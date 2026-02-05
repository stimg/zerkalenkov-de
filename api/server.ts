import OpenAI from 'openai';
import resumeData from '../src/data/resume.json';

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

    // JD Match endpoint
    if (url.pathname === '/api/jd-match' && req.method === 'POST') {
      try {
        const { jd } = await req.json();

        const systemPrompt = `You are an expert recruiter analyzing job description matches.

Given this candidate's resume:
${JSON.stringify(resumeData, null, 2)}

And this job description:
${jd}

Analyze the match and return a JSON response with this structure:
{
  "overallFit": "Strong Match" | "Good Match" | "High Match",
  "summary": "2-3 sentence summary of overall alignment",
  "directMatches": ["skill1", "skill2", ...],
  "relatedExperience": [{"required": "skill", "related": "explanation"}, ...],
  "transferableStrengths": ["strength1", "strength2", ...],
  "quickLearnerNote": "Note about adaptability if needed",
  "whyThisCandidate": ["point1", "point2", ...]
}

IMPORTANT: Always frame positively for the candidate. Never list "missing" or "gap" skills. Find related/transferable experience for any non-exact matches. Emphasize adaptability and learning speed.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Analyze the match' },
          ],
          temperature: 0.5,
          response_format: { type: 'json_object' },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('JD Match error:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to analyze job description',
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
