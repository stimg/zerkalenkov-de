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

export const callAnthropic = async (rawJd: string): Promise<MatchResult> => {
  const response = await fetch('/api/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jd: rawJd }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};
