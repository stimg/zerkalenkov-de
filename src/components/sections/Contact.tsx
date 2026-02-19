import React from 'react';
import { Mail, Linkedin, Github, MapPin, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useIntersection } from '@/hooks/useIntersection';
import { cn } from '@/lib/utils';
import resumeData from '@/data/resume.json';

export const Contact: React.FC = () => {
  const { personal } = resumeData;
  const { ref, hasIntersected } = useIntersection({ threshold: 0.1, freezeOnceVisible: true });

  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: personal.email,
      href: `mailto:${personal.email}`,
      color: 'text-red-500',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'Connect on LinkedIn',
      href: personal.linkedin,
      color: 'text-blue-500',
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'View my code',
      href: personal.github,
      color: 'text-gray-700 dark:text-gray-300',
    },
  ];

  return (
    <section id="contact" ref={ref} className="py-20 bg-gray-50 dark:bg-[#12121a]">
      <div className="container-custom">
        <div
          className={cn(
            'text-center mb-16 transition-all duration-700',
            hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Let's Connect</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have a project in mind? Let's talk about how we can work together.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card
            className={cn(
              'p-8 transition-all duration-700',
              hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Badge variant="success" className="text-sm px-4 py-2">
                  <CheckCircle className="w-4 h-4" />
                  {personal.availability === 'available'
                    ? 'Available for projects'
                    : 'Limited availability'}
                </Badge>
                <Badge variant="default" className="text-sm px-4 py-2">
                  <MapPin className="w-4 h-4" />
                  {personal.location}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <a
                      key={method.label}
                      href={method.href}
                      target={method.label !== 'Email' ? '_blank' : undefined}
                      rel={method.label !== 'Email' ? 'noopener noreferrer' : undefined}
                      className={cn(
                        'flex flex-col items-center gap-3 p-6 rounded-lg',
                        'bg-gray-50 dark:bg-[#1e1e2e] border-2 border-transparent',
                        'hover:border-primary-500 hover:shadow-lg transition-all duration-300',
                        'min-h-[120px] justify-center',
                        'transition-all duration-700',
                        hasIntersected
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-10'
                      )}
                      style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                    >
                      <Icon className={cn('w-8 h-8', method.color)} />
                      <div className="text-center">
                        <p className="font-semibold text-sm mb-1">{method.label}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{method.value}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
