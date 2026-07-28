import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, HelpCircle, Zap } from 'lucide-react';
import { aiService } from '@/services/aiService';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function FormattedText({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1 text-xs sm:text-sm">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={lIdx} className="h-1" />;

        // Headers (### Header)
        if (trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={lIdx} className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-1.5 mb-1">
              {parseBold(headerText)}
            </h4>
          );
        }

        // Bullet point (- Bullet or * Bullet)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.substring(2);
          return (
            <div key={lIdx} className="flex items-start gap-1.5 pl-1">
              <span className="text-brand-500 font-bold">•</span>
              <span>{parseBold(bulletText)}</span>
            </div>
          );
        }

        // Numbered list (1. Item)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lIdx} className="flex items-start gap-1.5 pl-1">
              <span className="font-bold text-brand-600 dark:text-brand-400">{numMatch[1]}.</span>
              <span>{parseBold(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={lIdx}>{parseBold(line)}</p>;
      })}
    </div>
  );
}

export function AiCopilotWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "👋 Hi! I am **BalajiOne AI Copilot**. How can I help you with your GST billing, stock inventory, or customer payments today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    '⚖️ Explain IGST vs CGST/SGST rules',
    '💳 How do I handle overdue receivables?',
    '📦 Best practice for HSN code assignment',
  ];

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setLoading(true);

    try {
      const res = await aiService.askCopilot(q);
      setMessages((prev) => [...prev, { sender: 'ai', text: res.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "⚠️ Couldn't fetch AI response right now. Please verify your connection or retry.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900 dark:border-l dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-4 text-white dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">BalajiOne AI Copilot</h3>
                  <p className="text-xs text-brand-100 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-300" /> Powered by Gemini & Smart GST Engine
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-1.5 text-white/80 hover:bg-white/20 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white'
                        : 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                    }`}
                  >
                    {m.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white font-medium rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <FormattedText content={m.text} />
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                    <Bot className="h-4 w-4 animate-bounce" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-brand-500 animate-ping" />
                    Analyzing business GST records...
                  </div>
                </div>
              )}
            </div>

            {/* Quick Chips */}
            <div className="border-t border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-1.5 px-1">
                <HelpCircle className="h-3 w-3" /> Quick Questions
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-brand-500 hover:text-brand-600 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI Copilot about GST, invoices, reports..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
