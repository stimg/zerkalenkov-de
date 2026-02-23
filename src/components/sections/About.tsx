import React, { useState } from 'react';
import { Brain, Code, Mic, MapPin, Github, Linkedin, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useIntersection } from '@/hooks/useIntersection';
import { cn } from '@/lib/utils';
import resumeData from '@/data/resume.json';

const iconMap = {
  Brain,
  Code,
  Mic,
};

const stats = [
  { value: '20+', label: 'Years Experience' },
  { value: '14+', label: 'Projects Delivered' },
  { value: '2009', label: 'Freelancing Since' },
];

export const About: React.FC = () => {
  const { about, personal } = resumeData;
  const { ref, hasIntersected } = useIntersection({ threshold: 0.1, freezeOnceVisible: true });
  const [expanded, setExpanded] = useState(false);

  const paragraphs = personal.about.split('\n\n');

  return (
    <section id="about" ref={ref} className="py-20 bg-white dark:bg-[#0a0a0f]">
      <div className="container-custom">

        {/* Personal Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 items-start mb-20">

          {/* Avatar */}
          <div
            className={cn(
              'flex justify-center lg:justify-start transition-all duration-700',
              hasIntersected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            )}
          >
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex items-center justify-center shadow-2xl">
                  <img src={'/assets/me-320x320.jpg'} alt="Profile Picture"/>
              </div>
            </div>
          </div>

          {/* Bio content */}
          <div
            className={cn(
              'transition-all duration-700 delay-150',
              hasIntersected ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            )}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">About Me</h2>

            {/* Paragraphs with overflow clamp */}
            <div className={cn('relative mb-2', !expanded && 'max-h-[320px] overflow-hidden')}>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-base">{p}</p>
                ))}
              </div>
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-[#0a0a0f] to-transparent" />
              )}
            </div>

            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
            >
              {expanded ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> Show more</>}
            </button>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-3 rounded-xl bg-gray-50 dark:bg-[#12121a] border border-gray-100 dark:border-gray-800"
                >
                  <div className="text-2xl font-bold text-primary-500">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Meta info & links */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 text-primary-500" />
                {personal.location}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 text-primary-500" />
                Freelance since 2009
              </div>
              <a
                href={personal.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
              <a
                href={personal.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* What I Do */}
        <div
          className={cn(
            'transition-all duration-700 delay-300',
            hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">What I Do</h3>
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
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
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

      </div>
    </section>
  );
};
