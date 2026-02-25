import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle, Link as LinkIcon, Zap, Copy, MessageSquare, RotateCcw, AlertCircle, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { callAnthropic, type MatchResult } from '@/api/anthropic';

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 5 * 60 * 1000;
const STORAGE_KEY = 'jd_submission_timestamps';

const getActiveTimestamps = (): number[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];
    return timestamps.filter((ts) => Date.now() - ts < RATE_WINDOW_MS);
  } catch {
    return [];
  }
};

const formatTimeRemaining = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const useJDRateLimit = () => {
  const [isLimited, setIsLimited] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submissionsLeft, setSubmissionsLeft] = useState(RATE_LIMIT);

  const refresh = useCallback(() => {
    const active = getActiveTimestamps();
    const limited = active.length >= RATE_LIMIT;
    setIsLimited(limited);
    setSubmissionsLeft(Math.max(0, RATE_LIMIT - active.length));
    if (limited && active.length > 0) {
      const oldest = Math.min(...active);
      setTimeRemaining(RATE_WINDOW_MS - (Date.now() - oldest));
    } else {
      setTimeRemaining(0);
    }
    return limited;
  }, []);

  const recordSubmission = useCallback(() => {
    const active = getActiveTimestamps();
    active.push(Date.now());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { isLimited, timeRemaining, submissionsLeft, recordSubmission, refresh };
};

interface JDMatcherProps {
  isOpen: boolean;
  onClose: () => void;
  onChatOpen: () => void;
}

export const JDMatcher: React.FC<JDMatcherProps> = ({ isOpen, onClose, onChatOpen }) => {
  const [jd, setJd] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const isMobile = useIsMobile();
  const { isLimited, timeRemaining, submissionsLeft, recordSubmission, refresh } = useJDRateLimit();

  const handleAnalyze = async () => {
    if (!jd.trim()) return;
    if (refresh()) return;

    setIsAnalyzing(true);

    try {
      const data = await callAnthropic(jd);
      // Only count against quota when the request actually reached Lambda
      // (client-side length guards return early without hitting the backend)
      if (data.error !== 'Too short' && data.error !== 'Too long') {
        recordSubmission();
      }
      setResult(data);
    } catch (error) {
      // Network-level errors mean the fetch was attempted, so count it
      recordSubmission();
      console.error('JD Match error:', error);
      setResult({ error: 'API Error' } as unknown as MatchResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setJd('');
    setResult(null);
  };

  const handleCopySummary = () => {
    if (!result) return;
    const summary = `JD Match Analysis for Alexey Zerkalenkov\n\nPosition: ${result.position}\nOverall Fit: ${result.overallMatch}\n\n${result.summary}\n\nKey Strengths:\n${result.whyThisCandidate.map((point) => `• ${point}`).join('\n')}`;
    navigator.clipboard.writeText(summary);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Job Description Match Analyzer"
      fullScreen={isMobile}
      className={isMobile ? '' : 'max-w-3xl'}
    >
      {!result ? (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Paste a job description to see how Alexey's experience aligns with the requirements.
          </p>

          {isLimited ? (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300">Daily limit reached</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  You've used all {RATE_LIMIT} analyses for this session. To keep the service available for everyone, please wait a moment before trying again.
                </p>
                <p className="text-sm font-mono font-semibold text-amber-800 dark:text-amber-300 mt-2">
                  Available again in {formatTimeRemaining(timeRemaining)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here..."
                rows={isMobile ? 12 : 10}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e1e2e] focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              {submissionsLeft < RATE_LIMIT && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {submissionsLeft} {submissionsLeft === 1 ? 'analysis' : 'analyses'} remaining in this session
                </p>
              )}
              <Button
                variant="primary"
                size="md"
                onClick={handleAnalyze}
                disabled={!jd.trim() || isAnalyzing}
                className="w-auto mt-4"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Match'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : result?.error ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#1e1e2e] rounded-lg">
            <AlertCircle className="w-8 h-8 text-gray-400 shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {result.error === 'Invalid JD'
                  ? "That doesn't look like a job description"
                  : result.error === 'Not relevant'
                    ? "Role outside Alexey's domain"
                    : result.error === 'Too short'
                      ? "Job description is too short"
                      : result.error === 'Too long'
                        ? "Job description is too long"
                        : result.error === 'API Error'
                        ? "Service temporarily unavailable"
                        : "Input could not be processed"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {result.error === 'Invalid JD'
                  ? 'Please paste a valid job description that includes a position title, responsibilities, and required skills.'
                  : result.error === 'Not relevant'
                    ? "This position doesn't match Alexey's expertise in software engineering. Try pasting a tech role."
                    : result.error === 'Too short'
                      ? "The job description is too brief for a meaningful analysis. Please include the position title, key responsibilities, required tech stack, and any must-have qualifications."
                      : result.error === 'Too long'
                        ? "The job description exceeds the 3000 character limit. Please trim it down to the key sections: position title, responsibilities, and required skills."
                        : result.error === 'API Error'
                        ? "Something went wrong on our end. Please try again in a moment."
                        : 'The input contains content that cannot be processed. Please paste a plain job description and try again.'}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-950 rounded-lg">
            <div>
              {result.position && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">{result.position}</p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Fit</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {result.overallMatch}
              </p>
            </div>
            {result.overallMatch !== 'Weak Match' && (
              <CheckCircle className="w-12 h-12 text-primary-500" />
            )}
          </div>

          <div>
            <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-secondary-500" />
              Direct Skill Matches
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.directMatches.map((skill) => (
                <Badge key={skill} variant="success">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {result.missingMustHaveSkills?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Missing Must-Have Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missingMustHaveSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.relatedExperience.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-500" />
                Related Experience
              </h3>
              <div className="space-y-2">
                {result.relatedExperience.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm leading-[1.6]"
                  >
                    <p className="font-semibold text-blue-700 dark:text-blue-400">
                      {item.required}
                    </p>
                    <p className="text-blue-600 dark:text-blue-300">→ {item.related}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.transferableStrengths.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Transferable Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.transferableStrengths.map((strength, index) => (
                  <Badge key={index} variant="warning">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.quickLearnerNote && (
            <div className="p-4 bg-gray-50 dark:bg-[#1e1e2e] rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.quickLearnerNote}</p>
            </div>
          )}

          {result.overallMatch !== 'Weak Match' && (
            <div>
              <h3 className="text-lg font-bold mb-3">Why This Candidate</h3>
              <ul className="space-y-2">
                {result.whyThisCandidate.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary-500 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="primary" size="sm" onClick={handleCopySummary}>
              <Copy className="w-4 h-4" />
              Copy Summary
            </Button>
            <Button variant="outline" size="sm" onClick={() => { onClose(); onChatOpen(); }}>
              <MessageSquare className="w-4 h-4" />
              Ask Follow-up
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              Try Another JD
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
