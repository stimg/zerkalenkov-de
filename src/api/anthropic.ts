import { sanitizeUserInput } from './sanitize';

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

export interface ChatUsage {
  input: number;
  output: number;
}

// Chunk types sent by the Lambda / local dev server NDJSON stream:
//   { t: 'd', v: string }          — text delta
//   { t: 'r', v: MatchResult }     — final parsed result (match endpoint)
//   { t: 'u', v: { i, o } }        — usage (chat endpoint, final)
//   { t: 'e', v: string }          — error
type NdjsonChunk =
  | { t: 'd'; v: string }
  | { t: 'r'; v: MatchResult }
  | { t: 'u'; v: { i: number; o: number } }
  | { t: 'e'; v: string };

const LAMBDA_URL = import.meta.env.VITE_LAMBDA_URL as string;

const checkResponse = async (response: Response): Promise<void> => {
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(`API error ${response.status}: ${body.error ?? 'unknown'}`);
  }
};

async function* readNdjsonStream(body: ReadableStream<Uint8Array>): AsyncGenerator<NdjsonChunk> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        yield JSON.parse(line) as NdjsonChunk;
      } catch {
        // skip unparseable lines
      }
    }
  }
}

export const callAnthropicJDMatcher = async (
  rawJd: string,
  onChunk?: (text: string) => void,
): Promise<MatchResult> => {
  const jd = sanitizeUserInput(rawJd);

  if (jd.length < 250) return { error: 'Too short' } as unknown as MatchResult;
  if (jd.length > 5000) return { error: 'Too long' } as unknown as MatchResult;

  const response = await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawJd: jd }),
  });

  await checkResponse(response);

  for await (const chunk of readNdjsonStream(response.body!)) {
    if (chunk.t === 'd') onChunk?.(chunk.v);
    else if (chunk.t === 'r') return chunk.v;
    else if (chunk.t === 'e') throw new Error(chunk.v);
  }

  throw new Error('No result received from server');
};

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
  const response = await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'chat', message: sanitizeUserInput(message), history }),
  });

  await checkResponse(response);

  // Lambda streaming path (production)
  if (response.headers.get('content-type')?.includes('x-ndjson')) {
    let usage: ChatUsage | undefined;

    for await (const chunk of readNdjsonStream(response.body!)) {
      if (chunk.t === 'd') onChunk(chunk.v);
      else if (chunk.t === 'u') usage = { input: chunk.v.i, output: chunk.v.o };
      else if (chunk.t === 'e') throw new Error(chunk.v);
    }

    return { usage };
  }

  // Fallback: non-streaming (local Bun dev server)
  const data = await response.json() as { message: string; usage?: ChatUsage };
  onChunk(data.message);
  return { usage: data.usage };
};
