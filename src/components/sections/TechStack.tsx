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
      scrollPos += 0.3;
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
    <div
      ref={scrollRef}
      className="flex gap-16 overflow-hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {duplicatedStack.map((tech, index) => (
        <div
          key={`${tech.name}-${index}`}
          className="flex flex-col items-center justify-center gap-3 shrink-0 transition-opacity hover:opacity-70"
        >
          <span className="text-4xl" role="img" aria-label={tech.name}>
            {tech.icon}
          </span>
          <span className="font-bold text-sm whitespace-nowrap">{tech.name}</span>
        </div>
      ))}
    </div>
  );
}
