import { sanitizeJD } from './sanitize';

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

const LAMBDA_URL = 'https://ejfv26i5o22jepqez7kx5lvnbm0fmiyb.lambda-url.eu-central-1.on.aws/';

export const callAnthropic = async (rawJd: string): Promise<MatchResult> => {
  const jd = sanitizeJD(rawJd);

  if (jd.length < 250) {
    return { error: 'Too short' } as unknown as MatchResult;
  }

  if (jd.length > 3000) {
    return { error: 'Too long' } as unknown as MatchResult;
  }

  const response = await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jd }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`API error ${response.status}: ${body.error ?? 'unknown'}`);
  }

  return response.json();
};
