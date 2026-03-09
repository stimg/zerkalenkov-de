import { useState, useCallback } from 'react';
import { callAnthropicChatStream, type ChatUsage } from '@/api/anthropic';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  usage?: ChatUsage;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    const assistantId = `${Date.now() + 1}`;
    let firstChunk = true;

    try {
      const history = messages.map(({ role, content: c }) => ({ role, content: c }));

      const { usage } = await callAnthropicChatStream(content, history, (chunk) => {
        if (firstChunk) {
          firstChunk = false;
          // Add the assistant placeholder on first chunk so spinner gives way to text
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: 'assistant', content: chunk, timestamp: new Date() },
          ]);
          setIsLoading(false);
          setIsStreaming(true);
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
          );
        }
      });

      // Attach usage to the completed message
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, usage } : m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
  };
}