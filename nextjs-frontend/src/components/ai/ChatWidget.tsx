'use client';

import { useState, useRef, useEffect } from 'react';
import { apiPost, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  failed?: boolean;
  isStreaming?: boolean;
}

const FALLBACK =
  'Thanks for reaching out! Our Domestic Real Estate team can help at info@domesticrealestate.us — share what you need (buy, sell, or invest) and we\'ll follow up shortly.';

// Simple safe markdown parser
function parseMarkdown(text: string): string {
  if (!text) return "";
  
  // Escape HTML to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Code inline: `code`
  html = html.replace(/`(.*?)`/g, "<code class='bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono text-gold'>$1</code>");

  // Bullet Lists: lines starting with "- " or "* "
  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      let prefix = '';
      if (!inList) {
        inList = true;
        prefix = '<ul class="list-disc pl-5 my-2 space-y-1">';
      }
      return `${prefix}<li>${content}</li>`;
    } else {
      let suffix = '';
      if (inList) {
        inList = false;
        suffix = '</ul>';
      }
      return `${suffix}${line}`;
    }
  });

  if (inList) {
    processedLines.push('</ul>');
  }

  html = processedLines.join('\n');

  // Convert newlines to br, unless they are within structural HTML tags
  html = html.replace(/\n/g, "<br />");
  
  return html;
}

export default function ChatWidget() {
  const { notifyError, success } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi, this is Domestic Real Estate! How are you today? Are you looking to Buy, Sell, or Invest in property?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [leadSaved, setLeadSaved] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rate Limiting & Cooldown State
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Cooldown Countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Simulate streaming output (typewriter effect)
  const streamText = (messageId: string, fullText: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content: '', isStreaming: true } : msg
      )
    );

    let currentIndex = 0;
    const interval = setInterval(() => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const nextContent = fullText.slice(0, currentIndex + 1);
            const isDone = currentIndex + 1 >= fullText.length;
            return {
              ...msg,
              content: nextContent,
              isStreaming: !isDone,
            };
          }
          return msg;
        })
      );

      currentIndex += 3; // Type 3 characters at a time for speed
      if (currentIndex >= fullText.length) {
        clearInterval(interval);
      }
    }, 15);
  };

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    // Keep timestamps from the last 30 seconds
    const recentTimestamps = messageTimestamps.filter((t) => now - t < 30000);
    
    if (recentTimestamps.length >= 5) {
      setCooldown(30); // 30 seconds block
      return false;
    }

    setMessageTimestamps([...recentTimestamps, now]);
    return true;
  };

  const handleSend = async (textToSend: string, isRetryId?: string) => {
    if (!textToSend.trim() || loading) return;

    // Check rate limit first (skip rate check for retries)
    if (!isRetryId && !checkRateLimit()) {
      setMessages((prev) => [
        ...prev,
        {
          id: `rate-limit-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ **Rate Limit Exceeded**: You are sending messages too quickly. Please wait 30 seconds.',
        },
      ]);
      return;
    }

    setLoading(true);

    let messageId = isRetryId;
    if (!messageId) {
      messageId = `msg-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: messageId!, role: 'user', content: textToSend },
      ]);
      setInput('');
    } else {
      // Clear failure status on retry
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, failed: false } : msg))
      );
    }

    // Attempt email capture on user input
    const emailMatch = textToSend.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && !email) {
      setEmail(emailMatch[0]);
    }

    // Set up AbortController for 15s Timeout Handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const data = await apiPost<{
        response?: string;
        lead_captured?: boolean;
        provider?: string;
      }>('/ai/chat', {
        message: textToSend,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        type: /sell/i.test(textToSend) ? 'seller' : /invest/i.test(textToSend) ? 'investor' : undefined,
        history,
      }, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const reply = data.response || FALLBACK;
      const assistantMsgId = `assistant-${Date.now()}`;

      // Insert blank streaming message first
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '' },
      ]);

      // Trigger streaming character builder
      streamText(assistantMsgId, reply);

      if (data.lead_captured && !leadSaved) {
        setLeadSaved(true);
        success('We saved your contact — a specialist will follow up.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const errMsg = isAbort 
        ? 'Request timed out (15s limit). Please check your internet or retry.' 
        : 'AI is temporarily unavailable. Please try again later.';

      // Mark the user message as failed and keep failed status
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, failed: true } : msg))
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `❌ ${errMsg}`,
        },
      ]);

      notifyError(err, isAbort ? 'Request timed out.' : 'AI Chat is not responding.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-gold rounded-full shadow-glow flex items-center justify-center hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="Open AI Chat"
      >
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>
    );
  }

  // Handle Minimized State UI
  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 left-6 z-50 w-80 bg-navy hover:bg-navy-600 cursor-pointer shadow-2xl border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between text-white animate-slide-up"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="font-heading font-semibold text-xs">Domestic AI (Minimized)</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }} 
            className="text-white/70 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[540px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-800 rounded-card shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-slide-up">
      {/* Chat Header */}
      <div className="bg-navy p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-heading font-semibold text-sm">Domestic AI Assistant</h3>
            <p className="text-slate-300 text-xs">Your Key to Home</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Minimize Button */}
          <button 
            onClick={() => setIsMinimized(true)} 
            className="text-white/70 hover:text-white transition-colors" 
            aria-label="Minimize chat"
            title="Minimize"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          {/* Close Button */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white/70 hover:text-white transition-colors" 
            aria-label="Close chat"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Optional Contact Capture Row */}
      {showLeadForm && (
        <div className="px-3 pt-3 pb-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">Quick contact form (optional — our AI can also collect this):</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="flex-1 px-3 py-1.5 text-sm rounded-button bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 outline-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 px-3 py-1.5 text-sm rounded-button bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowLeadForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => setShowLeadForm(false)}
              className="text-xs text-gold font-semibold hover:underline"
            >
              Save &amp; Continue →
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-end gap-2 max-w-[85%]`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-gold text-white rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                }`}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
              />
              
              {/* Retry button for failed messages */}
              {msg.failed && (
                <button
                  onClick={() => handleSend(msg.content, msg.id)}
                  className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all cursor-pointer"
                  title="Retry sending message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 4.21M17 17l4-4m0 0l-4-4m4 4H1" />
                  </svg>
                </button>
              )}
            </div>
            {msg.failed && (
              <span className="text-[10px] text-red-500 mt-1 mr-2 font-medium">Failed to send</span>
            )}
          </div>
        ))}
        
        {/* Typing Dots / Bouncing Dots loader */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="text-xs text-slate-400 mr-1">Domestic AI is thinking</span>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field Form */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {cooldown > 0 && (
          <div className="text-center text-xs text-red-500 font-semibold mb-2">
            ⚠️ Cooldown Active: Wait {cooldown}s before sending another message.
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          {!showLeadForm && !leadSaved && (
            <button
              type="button"
              onClick={() => setShowLeadForm(true)}
              className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-button flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shrink-0"
              aria-label="Add contact info"
              title="Add contact details"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={cooldown > 0 ? "Blocked by cooldown..." : "Tell us about your property needs..."}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-button text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold"
            disabled={loading || cooldown > 0}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || cooldown > 0}
            className="w-10 h-10 bg-gradient-gold rounded-button flex items-center justify-center text-white disabled:opacity-50 hover:shadow-lg transition-all"
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
