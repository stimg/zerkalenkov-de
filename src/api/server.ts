import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import resumeText from '../data/resume.txt' with { type: 'text' };
import { sanitizeUserMessage } from './sanitize';
import { buildJDMSystemPrompt } from "@/api/prompts.ts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 0,
  timeout: 30000,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const server = Bun.serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS + security headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
      'Content-Security-Policy': "default-src 'none'",
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Chat endpoint
    if (url.pathname === '/api/chat' && req.method === 'POST') {
      try {
        const { message, history } = await req.json();

        const systemPrompt = `You are a helpful assistant representing Alexey Zerkalenkov, a Senior Fullstack AI Engineer with 20+ years of experience.

Answer questions about his professional background based on this resume data:
${resumeText}

Be professional, concise, and helpful. Speak in first person as if you are Alexey. Don't make up information not in the resume.`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...(history || []).map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 500,
        });

        return new Response(
          JSON.stringify({
            message: completion.choices[0]?.message.content || "Sorry, I couldn't understand your message.",
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        console.error('Chat error:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to process request',
            message: 'Sorry, I encountered an error. Please try again.',
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // JD Match endpoint — streams NDJSON chunks
    if (url.pathname === '/api/match' && req.method === 'POST') {
      const { jd: rawJd } = await req.json().catch(() => ({}));

      if (!rawJd?.trim()) {
        return new Response(JSON.stringify({ error: 'Missing jd field' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const jd = sanitizeUserMessage(rawJd);

      if (jd.length < 250) {
        return new Response(JSON.stringify({ error: 'Too short' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (jd.length > 3000) {
        return new Response(JSON.stringify({ error: 'Too long' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const encoder = new TextEncoder();
      const body = new ReadableStream({
        async start(controller) {
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
                controller.enqueue(encoder.encode(JSON.stringify({ t: 'd', v: chunk.delta.text }) + '\n'));
              }
            }

            const jsonMatch = fullText.match(/\{[\s\S]*}/);
            let parsed: unknown = null;
            if (jsonMatch) {
              try { parsed = JSON.parse(jsonMatch[0]); } catch { /* falls through */ }
            }

            if (parsed && typeof parsed === 'object') {
              controller.enqueue(encoder.encode(JSON.stringify({ t: 'r', v: parsed }) + '\n'));
            } else {
              controller.enqueue(encoder.encode(JSON.stringify({ t: 'e', v: 'Processing failed' }) + '\n'));
            }
          } catch (error) {
            console.error('Match stream error:', error);
            controller.enqueue(encoder.encode(JSON.stringify({ t: 'e', v: 'Processing failed' }) + '\n'));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(body, {
        headers: { ...corsHeaders, 'Content-Type': 'application/x-ndjson' },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
});

console.log(`API server running at http://localhost:${server.port}`);
