import Anthropic from '@anthropic-ai/sdk';
import { buildJDMSystemPrompt, buildChatSystemPrompt } from "../src/api/prompts";
import { sanitizeUserMessage } from "../src/api/sanitize";
import type { MatchResult } from "../src/api/anthropic";

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'Content-Security-Policy': "default-src 'none'",
};

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

const handleChat = async (message: string, history: ChatHistoryItem[]): Promise<{ message: string; usage: { input: number; output: number } }> => {
  const safeHistory = (history ?? [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-6);

  const completion = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: buildChatSystemPrompt(),
    messages: [
      ...safeHistory,
      { role: 'user', content: message },
    ],
  });

  const block = completion.content[0];
  return {
    message: block?.type === 'text' ? block.text : '',
    usage: { input: completion.usage.input_tokens, output: completion.usage.output_tokens },
  };
};

export const handler = async (event: {
  requestContext?: { http?: { method?: string; sourceIp?: string } };
  headers?: Record<string, string>;
  body?: string;
}) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const ip = event.requestContext?.http?.sourceIp ?? 'unknown';
  const body = JSON.parse(event.body ?? '{}');
  const { type } = body;

  // Chat endpoint
  if (type === 'chat') {
    if (!checkChatRateLimit(ip)) {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Too many requests' }),
      };
    }

    try {
      const { message, history } = body;

      if (typeof message !== 'string' || !message.trim()) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing message' }),
        };
      }

      const result = await handleChat(message, history ?? []);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(result),
      };
    } catch (error) {
      console.error('Lambda chat error:', error instanceof Error ? error.message : String(error));
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Processing failed' }),
      };
    }
  }

  // JD match endpoint (default)
  if (!checkMatchRateLimit(ip)) {
    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Too many requests' }),
    };
  }

  try {
    const { rawJd } = body;

    if (typeof rawJd !== 'string' || !rawJd.trim()) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing jd field' }),
      };
    }

    const jd = sanitizeUserMessage(rawJd);

    if (jd.length < 250) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Too short' }),
      };
    }

    if (jd.length > 5000) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Too long' }),
      };
    }

    const completion = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: buildJDMSystemPrompt(jd),
      messages: [{ role: 'user', content: 'Analyze the match' }],
    });

    const block = completion.content[0];
    const text = block?.type === 'text' ? block.text : '';

    const jsonMatch = text.match(/\{[\s\S]*}/);
    if (!jsonMatch) {
      console.error('Lambda error: no JSON found in LLM response');
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Processing failed' }) };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error('Lambda error: failed to parse LLM JSON');
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Processing failed' }) };
    }

    if (!isValidResult(parsed)) {
      console.error('Lambda error: LLM response failed schema validation', parsed);
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Processing failed' }) };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(parsed),
    };
  } catch (error) {
    console.error('Lambda error:', error instanceof Error ? error.message : String(error));
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Processing failed' }),
    };
  }
};
