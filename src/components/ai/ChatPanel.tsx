import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Maximize2, Send, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { Button } from '@/components/ui/Button';
import { useChat, type Message } from '@/hooks/useChat';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn, formatDate } from '@/lib/utils';
import { QUICK_SUGGESTIONS } from '@/lib/constants';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({isOpen, onClose}) => {
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const {messages, isLoading, sendMessage} = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#12121a] shadow-2xl border border-gray-200 dark:border-gray-800 rounded-full">
        <span className="text-sm font-semibold">Ask About My Experience</span>
        <Button variant="ghost" size="sm" onClick={() => setIsMinimized(false)} className="rounded-full">
          <Maximize2 className="w-4 h-4"/>
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
          <X className="w-4 h-4"/>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed z-50 bg-white dark:bg-[#12121a] shadow-2xl border border-gray-200 dark:border-gray-800',
        isMobile
          ? 'inset-0 rounded-none'
          : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(80vw,860px)] h-[min(80vh,85svh)] rounded-xl'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-bold">Ask About My Experience</h3>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(true)} className="rounded-full">
                <Minimize2 className="w-4 h-4"/>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
              <X className="w-4 h-4"/>
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

          {messages.map((message: Message) => (
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
                {message.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="text-sm prose dark:prose-invert max-w-none
                  prose-p:my-1.2 prose-p:text-sm prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-li:text-sm
                  prose-headings:my-1.5 prose-headings:font-semibold prose-h1:text-md prose-h2:text-md
                  prose-h3:text-md prose-h4:text-md prose-strong:text-sm prose-code:text-sm prose-code:text-primary-400
                  prose-pre:bg-gray-200 dark:prose-pre:bg-black/40 prose-pre:rounded prose-pre:p-2 prose-pre:text-sm">
                    <Markdown>{message.content}</Markdown>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 mt-1">
                  <p className="text-xs opacity-70">{formatDate(message.timestamp)}</p>
                  {message.role === 'assistant' && message.usage && (
                    <p className="text-xs opacity-50 tabular-nums">
                      ↑{message.usage.input} ↓{message.usage.output}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="bg-gray-100 dark:bg-[#1e1e2e] rounded-lg p-3">
                <Loader2 className="w-5 h-5 animate-spin"/>
              </div>
            </div>
          )}

          <div ref={messagesEndRef}/>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <input
              ref={inputRef}
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
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
