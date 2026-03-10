import Anthropic from '@anthropic-ai/sdk';
import { buildJDMSystemPrompt, buildChatSystemPrompt } from "@/api/prompts.ts";
import { sanitizeUserMessage } from "@/api/sanitize.ts";
import type { MatchResult } from "@/api/anthropic.ts";

// awslambda is a global available in Node.js 18+ Lambda runtime.
// Requires InvokeMode: RESPONSE_STREAM on the Lambda Function URL.
declare const awslambda: {
  streamifyResponse(
    handler: (event: LambdaEvent, responseStream: NodeJS.WritableStream, context: unknown) => Promise<void>
  ): unknown;
  HttpResponseStream: {
    from(
      responseStream: NodeJS.WritableStream,
      metadata: { statusCode?: number; headers?: Record<string, string> }
    ): NodeJS.WritableStream;
  };
};

type LambdaEvent = {
  requestContext?: { http?: { method?: string; sourceIp?: string } };
  headers?: Record<string, string>;
  body?: string;
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 0,
  timeout: 30000,
});

const VALID_MATCH_LABELS = new Set(['Perfect Match', 'Strong Match', 'High Match', 'Good Match', 'Weak Match']);

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((i) => typeof i === 'string');

const isValidResult = (v: unknown): v is MatchResult => {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;

  // LLM-signalled errors are valid passthrough
  if (typeof r.error === 'string') return true;

  return (
    typeof r.position === 'string' &&
    typeof r.overallMatch === 'string' && VALID_MATCH_LABELS.has(r.overallMatch) &&
    typeof r.summary === 'string' &&
    isStringArray(r.directMatches) &&
    isStringArray(r.missingMustHaveSkills) &&
    Array.isArray(r.relatedExperience) &&
    (r.relatedExperience as unknown[]).every(
      (e) => typeof e === 'object' && e !== null &&
        typeof (e as Record<string, unknown>).required === 'string' &&
        typeof (e as Record<string, unknown>).related === 'string',
    ) &&
    isStringArray(r.transferableStrengths) &&
    typeof r.quickLearnerNote === 'string' &&
    isStringArray(r.whyThisCandidate)
  );
};

const MATCH_RATE_LIMIT_RPM = 2;
const CHAT_RATE_LIMIT_RPM = 20;

const makeRateLimiter = (rpm: number) => {
  const store = new Map<string, { count: number; resetAt: number }>();
  return (ip: string): boolean => {
    const now = Date.now();
    const entry = store.get(ip);
    if (!entry || now >= entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + 60_000 });
      return true;
    }
    if (entry.count >= rpm) return false;
    entry.count++;
    return true;
  };
};

const checkMatchRateLimit = makeRateLimiter(MATCH_RATE_LIMIT_RPM);
const checkChatRateLimit = makeRateLimiter(CHAT_RATE_LIMIT_RPM);

const baseHeaders = {
  // 'Access-Control-Allow-Origin': '*', --> Configure CORS headers on AWS Lambda Function URL
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'Content-Security-Policy': "default-src 'none'",
};

// Sends a complete JSON response via the Lambda response stream.
// Must be called at most once per request.
const respond = (
  responseStream: NodeJS.WritableStream,
  statusCode: number,
  body: unknown,
) => {
  const out = awslambda.HttpResponseStream.from(responseStream, {
    statusCode,
    headers: { ...baseHeaders, 'Content-Type': 'application/json' },
  });
  out.write(JSON.stringify(body));
  out.end();
};

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export const handler = awslambda.streamifyResponse(async (event: LambdaEvent, responseStream, _context) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    awslambda.HttpResponseStream.from(responseStream, { statusCode: 200, headers: baseHeaders }).end();
    return;
  }

  const ip = event.requestContext?.http?.sourceIp ?? 'unknown';
  const body = JSON.parse(event.body ?? '{}') as Record<string, unknown>;
  const { type } = body;

  // ── Chat endpoint — streams NDJSON chunks ──────────────────────────────────
  if (type === 'chat') {
    if (!checkChatRateLimit(ip)) {
      respond(responseStream, 429, { error: 'Too many requests' });
      return;
    }

    const { message, history } = body as { message: unknown; history: unknown };

    if (typeof message !== 'string' || !message.trim()) {
      respond(responseStream, 400, { error: 'Missing message' });
      return;
    }

    const safeHistory = ((history ?? []) as ChatHistoryItem[])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content)
      .slice(-6);

    const out = awslambda.HttpResponseStream.from(responseStream, {
      statusCode: 200,
      headers: { ...baseHeaders, 'Content-Type': 'application/x-ndjson' },
    });

    try {
      const stream = anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: buildChatSystemPrompt(),
        messages: [...safeHistory, { role: 'user', content: message }],
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          out.write(JSON.stringify({ t: 'd', v: chunk.delta.text }) + '\n');
        }
      }

      const final = await stream.finalMessage();
      out.write(JSON.stringify({ t: 'u', v: { i: final.usage.input_tokens, o: final.usage.output_tokens } }) + '\n');
    } catch (error) {
      console.error('Lambda chat stream error:', error instanceof Error ? error.message : String(error));
      out.write(JSON.stringify({ t: 'e', v: 'Processing failed' }) + '\n');
    } finally {
      out.end();
    }
    return;
  }

  // ── JD match endpoint — streams NDJSON chunks ─────────────────────────────
  if (!checkMatchRateLimit(ip)) {
    respond(responseStream, 429, { error: 'Too many requests' });
    return;
  }

  const { rawJd } = body as { rawJd: unknown };

  if (typeof rawJd !== 'string' || !rawJd.trim()) {
    respond(responseStream, 400, { error: 'Missing jd field' });
    return;
  }

  const jd = sanitizeUserMessage(rawJd);

  if (jd.length < 250) {
    respond(responseStream, 400, { error: 'Too short' });
    return;
  }

  if (jd.length > 5000) {
    respond(responseStream, 400, { error: 'Too long' });
    return;
  }

  const out = awslambda.HttpResponseStream.from(responseStream, {
    statusCode: 200,
    headers: { ...baseHeaders, 'Content-Type': 'application/x-ndjson' },
  });

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: buildJDMSystemPrompt(jd),
      messages: [{ role: 'user', content: 'Analyze the match' }],
    });

    let fullText = '';
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        fullText += chunk.delta.text;
        out.write(JSON.stringify({ t: 'd', v: chunk.delta.text }) + '\n');
      }
    }

    const jsonMatch = fullText.match(/\{[\s\S]*}/);
    let parsed: unknown = null;
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[0]); } catch { /* falls through to error */ }
    }

    if (isValidResult(parsed)) {
      out.write(JSON.stringify({ t: 'r', v: parsed }) + '\n');
    } else {
      console.error('Lambda error: invalid or unparseable LLM response');
      out.write(JSON.stringify({ t: 'e', v: 'Processing failed' }) + '\n');
    }
  } catch (error) {
    console.error('Lambda error:', error instanceof Error ? error.message : String(error));
    out.write(JSON.stringify({ t: 'e', v: 'Processing failed' }) + '\n');
  } finally {
    out.end();
  }
});