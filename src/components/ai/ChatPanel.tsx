import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useChat } from '@/hooks/useChat';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn, formatDate } from '@/lib/utils';
import { QUICK_SUGGESTIONS } from '@/lib/constants';
import resumeData from '@/data/resume.json';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const context = JSON.stringify(resumeData);
    await sendMessage(input, context);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed z-50 bg-white dark:bg-[#12121a] shadow-2xl border border-gray-200 dark:border-gray-800',
        isMobile
          ? 'inset-0 rounded-none'
          : 'bottom-4 right-4 w-[400px] h-[600px] rounded-xl'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-bold">Ask About My Experience</h3>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Ask me anything about my experience, skills, or projects!
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Quick suggestions:
                </p>
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 text-sm bg-gray-50 dark:bg-[#1e1e2e] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-[#1e1e2e]'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">{formatDate(message.timestamp)}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="bg-gray-100 dark:bg-[#1e1e2e] rounded-lg p-3">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e1e2e] focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isLoading}
            />
            <Button
              variant="primary"
              size="md"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
