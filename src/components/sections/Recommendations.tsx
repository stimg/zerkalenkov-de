import { useState } from 'react';
import { Quote, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useIntersection } from '@/hooks/useIntersection';
import { cn } from '@/lib/utils';
import resumeData from '@/data/resume.json';

export function Recommendations() {
  const { recommendations } = resumeData;
  const [isAllModalOpen, setIsAllModalOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<typeof recommendations[0] | null>(null);
  const { ref, hasIntersected } = useIntersection({ threshold: 0.1, freezeOnceVisible: true });

  // Show first 3 recommendations in the main section
  const featuredRecommendations = recommendations.slice(0, 3);

  // Helper function to render content with paragraph breaks
  const renderContent = (content: string) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-4' : ''}>
        {paragraph}
      </p>
    ));
  };

  return (
    <>
      <section id="recommendations" ref={ref} className="py-20 bg-gray-50 dark:bg-[#0f0f14]">
        <div className="container-custom">
          <div
            className={cn(
              'text-center mb-16 transition-all duration-700',
              hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Recommendations</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              What clients and colleagues say about working with me
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {featuredRecommendations.map((recommendation, index) => (
              <Card
                key={recommendation.id}
                hover
                onClick={() => setSelectedRecommendation(recommendation)}
                className={cn(
                  'cursor-pointer transition-all duration-700',
                  hasIntersected
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                      <Quote className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold truncate">{recommendation.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {recommendation.position}
                      </p>
                      {recommendation.company && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Worked together at {recommendation.company}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {recommendation.date}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-6">
                    "{recommendation.content}"
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {recommendations.length > 3 && (
            <div
              className={cn(
                'mt-12 text-center transition-all duration-700',
                hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              )}
              style={{ transitionDelay: '300ms' }}
            >
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsAllModalOpen(true)}
                className="group primary"
              >
                Show All Recommendations
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Modal for single recommendation */}
      <Modal
        isOpen={!!selectedRecommendation}
        onClose={() => setSelectedRecommendation(null)}
        title={selectedRecommendation?.name || ''}
        className="max-w-3xl"
      >
        {selectedRecommendation && (
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                <Quote className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedRecommendation.position}
                </p>
                {selectedRecommendation.company && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Worked together at {selectedRecommendation.company}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {selectedRecommendation.date}
                </p>
              </div>
            </div>
            <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className="space-y-4">"{renderContent(selectedRecommendation.content)}"</div>
            </blockquote>
          </div>
        )}
      </Modal>

      {/* Modal for all recommendations */}
      <Modal
        isOpen={isAllModalOpen}
        onClose={() => setIsAllModalOpen(false)}
        title="All Recommendations"
        className="max-w-4xl"
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {recommendations.map((recommendation, index) => (
            <div
              key={recommendation.id}
              className={cn(
                'p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#12121a]',
                index !== recommendations.length - 1 && 'mb-4'
              )}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                  <Quote className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{recommendation.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {recommendation.position}
                  </p>
                  {recommendation.company && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Worked together at {recommendation.company}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {recommendation.date}
                  </p>
                </div>
              </div>
              <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed italic space-y-4">
                <div>"{renderContent(recommendation.content)}"</div>
              </blockquote>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
