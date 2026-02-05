import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, MessageSquare } from 'lucide-react';
import { cn, scrollToSection } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { NAV_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onChatOpen: () => void;
}

export function Header({ onChatOpen }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = NAV_ITEMS.map((item) => item.href.substring(1));
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    scrollToSection(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-nav shadow-sm py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <button
              onClick={() => scrollToSection('#hero')}
              className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              AZ
            </button>

            {!isMobile && (
              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      activeSection === item.href.substring(1) &&
                        'text-primary-600 dark:text-primary-400'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={onChatOpen}
                className="hidden md:inline-flex"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </Button>

              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle menu"
                  className="rounded-full"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <nav
            className="absolute top-[70px] right-4 left-4 bg-white dark:bg-[#12121a] rounded-xl shadow-2xl p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg font-medium transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  activeSection === item.href.substring(1) &&
                    'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                )}
              >
                {item.label}
              </button>
            ))}
            <Button variant="primary" size="md" onClick={onChatOpen} className="w-full mt-4">
              <MessageSquare className="w-4 h-4" />
              Chat with My Resume
            </Button>
          </nav>
        </div>
      )}
    </>
  );
}
