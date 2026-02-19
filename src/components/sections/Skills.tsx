import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Accordion } from '@/components/ui/Accordion';
import { useIntersection } from '@/hooks/useIntersection';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import resumeData from '@/data/resume.json';

export const Skills: React.FC = () => {
  const { skills } = resumeData;
  const { ref, hasIntersected } = useIntersection({ threshold: 0.1, freezeOnceVisible: true });
  const isMobile = useIsMobile();

  return (
    <section id="skills" ref={ref} className="py-20 bg-gray-50 dark:bg-[#12121a]">
      <div className="container-custom">
        <div
          className={cn(
            'text-center mb-16 transition-all duration-700',
            hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}
        >
          <h2 className="text-3xl md:text-5xl font-bold">Skills & Technologies</h2>
        </div>

        {isMobile ? (
          <div className="space-y-4">
            {skills.map((category) => (
              <Accordion key={category.category} title={category.category} defaultOpen={false}>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((skill) => (
                    <Badge key={skill.name} variant="default">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </Accordion>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((category, index) => (
              <div
                key={category.category}
                className={cn(
                  'transition-all duration-700',
                  hasIntersected
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <h3 className="text-xl font-bold mb-4 text-primary-600 dark:text-primary-400">
                  {category.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((skill) => (
                    <Badge key={skill.name} variant="default">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
