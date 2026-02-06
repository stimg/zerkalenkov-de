import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Skills } from '@/components/sections/Skills';
import { Projects } from '@/components/sections/Projects';
import { Contact } from '@/components/sections/Contact';
import { ChatPanel } from '@/components/ai/ChatPanel';
import { JDMatcher } from '@/components/ai/JDMatcher';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isJDMatcherOpen, setIsJDMatcherOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header onChatOpen={() => setIsChatOpen(true)} />

      <main>
        <Hero
          onChatOpen={() => setIsChatOpen(true)}
          onJDMatchOpen={() => setIsJDMatcherOpen(true)}
        />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>

      <Footer />

      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <JDMatcher
        isOpen={isJDMatcherOpen}
        onClose={() => setIsJDMatcherOpen(false)}
        onChatOpen={() => {
          setIsJDMatcherOpen(false);
          setIsChatOpen(true);
        }}
      />
    </div>
  );
}

export default App;
