import { useEffect, useRef } from 'react';
import resumeData from '@/data/resume.json';
import {
  ReactLogo,
  TypeScriptLogo,
  NextJsLogo,
  NodeJsLogo,
  PythonLogo,
  OpenAILogo,
  LangChainLogo,
  AWSLogo,
  DockerLogo,
  PostgreSQLLogo,
  MongoDBLogo,
  RedisLogo,
} from '@/components/icons/TechLogos';

const logoMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'React': ReactLogo,
  'TypeScript': TypeScriptLogo,
  'Next.js': NextJsLogo,
  'Node.js': NodeJsLogo,
  'Python': PythonLogo,
  'OpenAI': OpenAILogo,
  'LangChain': LangChainLogo,
  'AWS': AWSLogo,
  'Docker': DockerLogo,
  'PostgreSQL': PostgreSQLLogo,
  'MongoDB': MongoDBLogo,
  'Redis': RedisLogo,
};

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
      {duplicatedStack.map((tech, index) => {
        const LogoComponent = logoMap[tech.name];
        return (
          <div
            key={`${tech.name}-${index}`}
            className="flex flex-col items-center justify-center gap-3 shrink-0 transition-opacity hover:opacity-70"
          >
            {LogoComponent ? (
              <LogoComponent className="w-12 h-12" />
            ) : (
              <span className="text-4xl" role="img" aria-label={tech.name}>
                {tech.icon}
              </span>
            )}
            <span className="font-bold text-sm whitespace-nowrap">{tech.name}</span>
          </div>
        );
      })}
    </div>
  );
}
