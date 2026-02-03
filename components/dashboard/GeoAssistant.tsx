'use client';

/**
 * GeoAssistant Component
 *
 * A floating chat assistant that provides contextual help,
 * explains score changes, and suggests next best actions.
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  User,
  Loader2,
  ChevronDown,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeoAssistantProps {
  /** Current page context for contextual awareness */
  currentPage?: string;
  /** Current GEO score for context */
  currentScore?: number;
  /** Additional CSS classes */
  className?: string;
}

const suggestedQuestions = [
  'Why did my score drop?',
  'What should I fix first?',
  'How can I improve entity coverage?',
  'Explain citation health',
];

const mockResponses: Record<string, string> = {
  'why did my score drop':
    "Based on your recent audit, your GEO score dropped by 3 points primarily due to:\n\n1. **Content Decay** - Your pricing page lost primary source authority for 'Enterprise AI costs' on GPT-4\n2. **Entity Dilution** - Inconsistent brand name citations across third-party sites\n\nI recommend starting with the 'Reconcile Inconsistent Brand Name Citations' fix, which has the highest impact potential.",
  'what should i fix first':
    "Based on your current audit results, I recommend prioritizing:\n\n1. **Implement Missing Organization Schema.org Markup** (Critical Impact, 15 min)\n   - This directly affects how LLMs disambiguate your brand\n\n2. **Reconcile Inconsistent Brand Name Citations** (High Impact, 45 min)\n   - Fixes semantic authority dilution\n\nWould you like me to guide you through the first fix?",
  'how can i improve entity coverage':
    "To improve your entity coverage score:\n\n1. **Add Technical Terminology** - Include industry-specific terms (IAM, CSP, TLS/SSL) that AI models recognize\n\n2. **Define Key Concepts** - Explicitly define your core offerings in answer-first format\n\n3. **Link Related Entities** - Create semantic relationships between your brand and relevant topics\n\nYour current entity density is 'High' but you're missing connections to 'AWS/Azure' which are frequently co-cited in your industry.",
  'explain citation health':
    "**Citation Health** measures how consistently and accurately your brand is referenced across the web.\n\nYour current score: **7.2/10**\n\n**What affects it:**\n- Brand name consistency across directories\n- Accuracy of company information\n- Quality of backlink sources\n- Freshness of citations\n\n**Your issues:**\n- Legacy name 'GEO-Opt Inc' still appears on 5 industry directories\n- Missing citations on 3 major tech review sites\n\nWould you like to see the specific directories that need updates?",
};

export function GeoAssistant({
  currentPage = 'dashboard',
  currentScore,
  className,
}: GeoAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your GEO Assistant. I can help you understand your scores, explain recommendations, and guide you through optimizations. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      let response =
        "I understand you're asking about that. Let me help you with some general guidance on GEO optimization. Could you be more specific about what aspect you'd like to explore?";

      // Check for matching responses
      for (const [key, value] of Object.entries(mockResponses)) {
        if (lowerInput.includes(key)) {
          response = value;
          break;
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    // Auto-send after a brief delay
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: question,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsTyping(true);

      setTimeout(() => {
        const lowerInput = question.toLowerCase();
        let response =
          "I understand you're asking about that. Let me help you with some general guidance.";

        for (const [key, value] of Object.entries(mockResponses)) {
          if (lowerInput.includes(key)) {
            response = value;
            break;
          }
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1500);
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-14 h-14 rounded-full',
          'bg-primary hover:bg-primary/90',
          'flex items-center justify-center',
          'shadow-lg shadow-primary/25',
          'transition-all duration-300',
          isOpen && 'scale-0 opacity-0',
          className
        )}
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-96 h-[600px] max-h-[80vh]',
          'bg-card border border-border rounded-xl',
          'shadow-2xl shadow-black/20',
          'flex flex-col',
          'transition-all duration-300 origin-bottom-right',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">GEO Assistant</h3>
              <p className="text-xs text-muted-foreground">
                AI-powered optimization help
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'flex-row-reverse'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  message.role === 'assistant'
                    ? 'bg-primary/10'
                    : 'bg-muted'
                )}
              >
                {message.role === 'assistant' ? (
                  <Sparkles className="w-4 h-4 text-primary" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  message.role === 'assistant'
                    ? 'bg-muted'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                <p
                  className={cn(
                    'text-sm whitespace-pre-wrap',
                    message.role === 'assistant'
                      ? 'text-foreground'
                      : 'text-primary-foreground'
                  )}
                >
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">
              Suggested questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-xs text-foreground transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your GEO score..."
              className="flex-1 bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
