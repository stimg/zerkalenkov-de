import OpenAI from 'openai';
import resumeData from '../data/resume.json';

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

const server = Bun.serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
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
${JSON.stringify(resumeData, null, 2)}

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
            message: completion.choices[0].message.content,
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

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
});

console.log(`API server running at http://localhost:${server.port}`);
