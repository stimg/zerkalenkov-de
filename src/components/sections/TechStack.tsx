import { useEffect, useRef } from 'react';
import {
  ReactLogo,
  TypeScriptLogo,
  NextJsLogo,
  NodeJsLogo,
  PythonLogo,
  ClaudeLogo,
  GeminiLogo,
  OpenAILogo,
  OllamaLogo,
  LangChainLogo,
  AWSLogo,
  DockerLogo,
  PostgreSQLLogo,
  MongoDBLogo,
  RedisLogo,
} from '@/components/icons/TechLogos';

const logos = [
  ReactLogo,
  TypeScriptLogo,
  NextJsLogo,
  NodeJsLogo,
  PythonLogo,
  ClaudeLogo,
  GeminiLogo,
  OpenAILogo,
  OllamaLogo,
  LangChainLogo,
  AWSLogo,
  DockerLogo,
  PostgreSQLLogo,
  MongoDBLogo,
  RedisLogo,
]
export function TechStack() {
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

  return (
    <div
      ref={scrollRef}
      className="flex gap-16 overflow-hidden"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
      }}
    >
      {/* Render logos twice for seamless infinite scroll */}
      {[...logos, ...logos].map((logo, index)=> {
        return (
          <div
            key={`tech-icon-${index}`}
            className="flex flex-col items-center justify-center gap-3 shrink-0 transition-opacity hover:opacity-70"
          >
            <span className="text-4xl" role="img">
              {logo()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
