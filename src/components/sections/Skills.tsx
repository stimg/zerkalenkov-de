import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Accordion } from '@/components/ui/Accordion';
import { useIntersection } from '@/hooks/useIntersection';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import resumeData from '@/data/resume.json';
import type { Project } from '@/types/resume';

interface Tooltip {
  name: string;
  projects: Project[];
  x: number;
  y: number;
}

const matchesSkill = (projectSkill: string, skillName: string): boolean => {
  const a = projectSkill.toLowerCase();
  const b = skillName.toLowerCase();
  return a === b;
};

export const Skills: React.FC = () => {
  const { skills } = resumeData;
  const projects: Project[] = resumeData.projects;
  const { ref, hasIntersected } = useIntersection({ threshold: 0.1, freezeOnceVisible: true });
  const isMobile = useIsMobile();
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const projectsBySkill = useMemo(() => {
    const map = new Map<string, Project[]>();
    skills.forEach(category => {
      category.items.forEach(item => {
        const related = projects.filter(p =>
          p.skills.some(s => matchesSkill(s, item.name))
        );
        if (related.length > 0) {
          map.set(item.name, related);
        }
      });
    });
    return map;
  }, []);

  const showTooltip = (e: React.MouseEvent<HTMLDivElement>, skillName: string) => {
    const related = projectsBySkill.get(skillName);
    if (!related) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      name: skillName,
      projects: related,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

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
                  {category.items.map((skill) => {
                    const hasProjects = projectsBySkill.has(skill.name);
                    return (
                      <div
                        key={skill.name}
                        className={cn(hasProjects && 'cursor-pointer')}
                        onMouseEnter={(e) => showTooltip(e, skill.name)}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <Badge variant="default">{skill.name}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed-position tooltip — escapes all stacking contexts */}
      {tooltip && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          <div className="bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 w-64 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Used in
            </p>
            <div className="space-y-1.5">
              {tooltip.projects.map(p => (
                <div key={p.id} className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-snug truncate">
                    {p.title}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                    {p.period}
                  </span>
                </div>
              ))}
            </div>
            {/* Caret */}
            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] bg-white dark:bg-[#1e1e2e] border-r border-b border-gray-200 dark:border-gray-700 rotate-45" />
          </div>
        </div>
      )}
    </section>
  );
};
