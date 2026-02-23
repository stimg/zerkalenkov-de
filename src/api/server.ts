import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import resumeData from '../data/resume.json';
import { sanitizeJD } from './sanitize';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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
    if (url.pathname === '/api/match' && req.method === 'POST') {
      try {
        const { jd: rawJd } = await req.json();
        const jd = sanitizeJD(rawJd);

        const systemPrompt = `You are an expert recruiter analyzing job description matches and calculate relevance scores for job postings.

Given this candidate's resume:
${JSON.stringify(resumeData, null, 2)}

And this job description:
${jd}

BEFORE PROCEEDING (CRITICAL):
- Analyse user query, it must be a valid job description and resume and have a valid JD structure: position/title, description, responsibilities/tasks, and tech stack
- If the user query doesn't look like a job description, return a JSON object with the following structure: { "error": "Invalid JD" }
- If the JD is valid and can be proceeded, make a fast evaluation, if it it relevant to my domain knowledge. Examples:
  - JD: "Software Engineer" --> true (perfect)
  - JD: "Looking for a skilled engineer with experience in Python and AWS, and a strong interest in blockchain" --> true
  - JD: "Experienced driver" --> false
  - JD: "Architect" --> false
- If the result is false, return a JSON object with the following structure: { "error": "Not relevant" }


1. Analyze the JD, extract:
- Position title
- MUST HAVE skills - "Required", "Must have", "Essential", "Mandatory" (not "Nice to have"), mentioned multiple times or emphasized
- Key responsibilities action verbs and domain keywords
- Tech stack - specific technologies mentioned
- Industry/domain keywords - company-specific terminology


2. JD Relevance Check

**Before proceeding, validate overall match:**

2.1. For EACH must-have skill from JD:
- Check if skill exists in Consolidated Resume
- Create list: MATCHED must-haves vs MISSING must-haves

2.2. Overall Relevance Score
Calculate: (Total matched JD keywords / Total JD keywords) * 100 = Relevance %
Assign: "Strong Match" if > 80%, "High Match" if > 70%, "Good Match" if > 60%, Otherwise "Weak Match"

Return a JSON response with this structure:
{
  "position": "AI Software Engineer",
  "overallMatch": "Perfect Match" > 90% | "Strong Match" > 80% | "High Match" > 70% | "Good Match" > 60% | "Weak Match" < 60%,
  "summary": "2-3 sentence summary of overall alignment",
  "directMatches": ["skill1", "skill2", ...],
  "missingMustHaveSkills": ["skill1", "skill2", ...],
  "relatedExperience": [{"required": "skill", "related": "explanation"}, ...],
  "transferableStrengths": ["strength1", "strength2", ...],
  "quickLearnerNote": "Note about adaptability if needed",
  "whyThisCandidate": ["point1", "point2", ...]
}

IMPORTANT: Always frame positively for the candidate. Find related/transferable experience for any non-exact matches. Emphasize problem solving, adaptability, and learning speed, skills. Return only the JSON object, no additional text.`;

        const completion = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: 'Analyze the match' }],
        });

        const block = completion.content[0];
        const text = block?.type === 'text' ? block.text : '{}';
        const jsonMatch = text.match(/\{[\s\S]*}/);
        const result = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Match error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to process request' }),
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
