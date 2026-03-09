import { sanitizeUserMessage } from './sanitize';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MatchResult {
  position: string;
  overallMatch: string;
  summary: string;
  directMatches: string[];
  missingMustHaveSkills: string[];
  relatedExperience: Array<{ required: string; related: string }>;
  transferableStrengths: string[];
  quickLearnerNote: string;
  whyThisCandidate: string[];
  error?: string;
}

const LAMBDA_URL = import.meta.env.VITE_LAMBDA_URL as string;

export const callAnthropicJDMatcher = async (rawJd: string): Promise<MatchResult> => {
  const jd = sanitizeUserMessage(rawJd);

  if (jd.length < 250) {
    return { error: 'Too short' } as unknown as MatchResult;
  }

  if (jd.length > 5000) {
    return { error: 'Too long' } as unknown as MatchResult;
  }

  const response = await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ rawJd: jd }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`API error ${response.status}: ${body.error ?? 'unknown'}`);
  }

  return response.json();
};

export interface ChatUsage {
  input: number;
  output: number;
}

// Chunk types sent by the Lambda NDJSON stream:
//   { t: 'd', v: string }          — text delta
//   { t: 'u', v: { i, o } }        — usage (final)
//   { t: 'e', v: string }          — error
type NdjsonChunk =
  | { t: 'd'; v: string }
  | { t: 'u'; v: { i: number; o: number } }
  | { t: 'e'; v: string };

/**
 * Calls the chat endpoint and invokes `onChunk` for each streamed text delta.
 * Supports both the Lambda streaming response (application/x-ndjson) and the
 * local Bun dev server (application/json) transparently.
 */
export const callAnthropicChatStream = async (
  message: string,
  history: ChatMessage[],
  onChunk: (text: string) => void,
): Promise<{ usage?: ChatUsage }> => {
  const sanitized = sanitizeUserMessage(message);

  const response = await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'chat', message: sanitized, history }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`API error ${response.status}: ${body.error ?? 'unknown'}`);
  }

  // Lambda streaming path (production)
  if (response.headers.get('content-type')?.includes('x-ndjson')) {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let usage: ChatUsage | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line) as NdjsonChunk;
          if (chunk.t === 'd') {
            onChunk(chunk.v);
          } else if (chunk.t === 'u') {
            usage = { input: chunk.v.i, output: chunk.v.o };
          } else if (chunk.t === 'e') {
            throw new Error(chunk.v);
          }
        } catch (e) {
          if (e instanceof Error && e.message !== line) throw e; // re-throw non-parse errors
        }
      }
    }

    return { usage };
  }

  // Fallback: non-streaming (local Bun dev server)
  const data = await response.json() as { message: string; usage?: ChatUsage };
  onChunk(data.message);
  return { usage: data.usage };
};