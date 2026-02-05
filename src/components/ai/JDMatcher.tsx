import { useState } from 'react';
import { Loader2, CheckCircle, Link as LinkIcon, Zap, Copy, MessageSquare, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useIsMobile } from '@/hooks/useMediaQuery';
import resumeData from '@/data/resume.json';

interface JDMatcherProps {
  isOpen: boolean;
  onClose: () => void;
  onChatOpen: () => void;
}

interface MatchResult {
  overallFit: string;
  summary: string;
  directMatches: string[];
  relatedExperience: Array<{ required: string; related: string }>;
  transferableStrengths: string[];
  quickLearnerNote: string;
  whyThisCandidate: string[];
}

export function JDMatcher({ isOpen, onClose, onChatOpen }: JDMatcherProps) {
  const [jd, setJd] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const isMobile = useIsMobile();

  const handleAnalyze = async () => {
    if (!jd.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/jd-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd, resume: resumeData }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('JD Match error:', error);
      // Fallback to demo data for development
      setResult({
        overallFit: 'Strong Match',
        summary:
          "Alexey's 20+ years of full-stack experience combined with recent AI/GenAI specialization makes him an excellent fit for this role. His proven track record with enterprise-scale voice assistants and GenAI platforms directly aligns with the position requirements.",
        directMatches: [
          'TypeScript',
          'React',
          'Node.js',
          'Python',
          'OpenAI API',
          'LangChain',
          'AWS',
          'Docker',
          'PostgreSQL',
        ],
        relatedExperience: [
          {
            required: 'GraphQL',
            related: 'Extensive REST API design and implementation; GraphQL adoption is straightforward',
          },
          {
            required: 'Kubernetes',
            related: 'Advanced Docker experience with container orchestration knowledge',
          },
        ],
        transferableStrengths: [
          'Rapid technology adoption - proven by mastering GenAI stack in production within months',
          '20+ years adapting to evolving tech landscapes',
          'Enterprise-scale system architecture experience',
        ],
        quickLearnerNote:
          'With 20+ years of consistently adopting new technologies and frameworks, any unfamiliar tools mentioned in the JD would be quick additions to the skillset.',
        whyThisCandidate: [
          'Led AI voice assistant platform serving 10M+ daily interactions at Samsung/Harman',
          'Architected GenAI content platform scaling to 50K monthly users',
          'Proven ability to deliver production-ready AI solutions for Fortune 500 companies',
          'Strong full-stack foundation enables end-to-end feature ownership',
        ],
      });
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
    const summary = `JD Match Analysis for Alexey Zerkalenkov\n\nOverall Fit: ${result.overallFit}\n\n${result.summary}\n\nKey Strengths:\n${result.whyThisCandidate.map((point) => `• ${point}`).join('\n')}`;
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

          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here..."
            rows={isMobile ? 12 : 10}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e1e2e] focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />

          <Button
            variant="primary"
            size="lg"
            onClick={handleAnalyze}
            disabled={!jd.trim() || isAnalyzing}
            className="w-full"
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
      ) : (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-950 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Fit</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {result.overallFit}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-primary-500" />
          </div>

          <div>
            <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
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
                    className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm"
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
