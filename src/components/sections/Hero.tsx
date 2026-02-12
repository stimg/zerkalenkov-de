import { ChevronDown, MessageSquare, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { scrollToSection } from '@/lib/utils';
import { Scene } from '@/components/three/Scene';
import { DarkVeil } from '@/components/backgrounds/DarkVeil.tsx';
import { TechStack } from '@/components/sections/TechStack';
import resumeData from '@/data/resume.json';

interface HeroProps {
  onChatOpen: () => void;
  onJDMatchOpen: () => void;
}

export function Hero({ onChatOpen, onJDMatchOpen }: HeroProps) {
  const { personal } = resumeData;

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className={ 'absolute inset-0 z-0'}>
        <DarkVeil
            hueShift={352}
            noiseIntensity={0.3}
            scanlineIntensity={0.7}
            speed={0.5}
            scanlineFrequency={1}
            warpAmount={1.6}
        />
      </div>

      <Scene />

      <div className="relative z-10 container-custom text-center px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <p className="text-5xl md:text-2xl text-black dark:text-white font-medium">
            Hi, I'm
          </p>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary-400 via-primary-100 to-primary-400 bg-clip-text text-transparent pb-3">
            {personal.name} {personal.surname}
          </h1>

          <p className="text-2xl md:text-4xl font-semibold text-gray-800 dark:text-gray-200">
            {personal.title}
          </p>

          <p className="text-lg text-justify md:text-xl text-primary-600 dark:text-primary-200 max-w-2xl mx-auto">
            {personal.tagline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button variant="primary" size="md" onClick={onChatOpen}>
              <MessageSquare className="w-5 h-5" />
              Chat with My Resume
            </Button>

            <Button variant="primary" size="md" onClick={onJDMatchOpen}>
              <FileSearch className="w-5 h-5" />
              Check JD Match
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => scrollToSection('#projects')}
              className="hidden sm:inline-flex"
            >
              View Projects
            </Button>
          </div>
        </div>

        <div className="mt-20 mb-10 w-full max-w-6xl mx-auto">
          <TechStack />
        </div>

        <button
          onClick={() => scrollToSection('#about')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block"
          aria-label="Scroll to next section"
        >
          <ChevronDown className="w-8 h-8 text-primary-500" />
        </button>
      </div>
    </section>
  );
}
