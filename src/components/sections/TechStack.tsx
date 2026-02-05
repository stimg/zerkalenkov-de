import { useEffect, useRef } from 'react';
import resumeData from '@/data/resume.json';

export function TechStack() {
  const { techStack } = resumeData;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    let animationId: number;
    let scrollPos = 0;

    const animate = () => {
      scrollPos += 0.5;
      if (scrollPos >= scroll.scrollWidth / 2) {
        scrollPos = 0;
      }
      scroll.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(animate);
    };

    const handlePause = () => cancelAnimationFrame(animationId);
    const handleResume = () => {
      animationId = requestAnimationFrame(animate);
    };

    scroll.addEventListener('mouseenter', handlePause);
    scroll.addEventListener('mouseleave', handleResume);
    scroll.addEventListener('touchstart', handlePause);
    scroll.addEventListener('touchend', handleResume);

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      scroll.removeEventListener('mouseenter', handlePause);
      scroll.removeEventListener('mouseleave', handleResume);
      scroll.removeEventListener('touchstart', handlePause);
      scroll.removeEventListener('touchend', handleResume);
    };
  }, []);

  const duplicatedStack = [...techStack, ...techStack];

  return (
    <section id="tech-stack" className="py-12 bg-gray-50 dark:bg-[#12121a] border-y border-gray-200 dark:border-gray-800">
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {duplicatedStack.map((tech, index) => (
          <div
            key={`${tech.name}-${index}`}
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-[#1e1e2e] rounded-full border border-gray-200 dark:border-gray-800 whitespace-nowrap shrink-0 hover:border-primary-500 transition-colors"
          >
            <span className="text-2xl" role="img" aria-label={tech.name}>
              {tech.icon}
            </span>
            <span className="font-medium">{tech.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
