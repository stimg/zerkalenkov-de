import { Brain, Code, Mic } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useIntersection } from '@/hooks/useIntersection';
import { cn } from '@/lib/utils';
import resumeData from '@/data/resume.json';

const iconMap = {
  Brain,
  Code,
  Mic,
};

export function About() {
  const { about } = resumeData;
  const { ref, hasIntersected } = useIntersection({ threshold: 0.1, freezeOnceVisible: true });

  return (
    <section id="about" ref={ref} className="py-20 bg-white dark:bg-[#0a0a0f]">
      <div className="container-custom">
        <div
          className={cn(
            'text-justify max-w-3xl mx-auto mb-16 transition-all duration-700',
            hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">What I Do</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">{about.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {about.services.map((service, index) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <Card
                key={service.title}
                hover
                className={cn(
                  'transition-all duration-700',
                  hasIntersected
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{service.title}</h3>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.points.map((point) => (
                      <li key={point} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-primary-500 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
