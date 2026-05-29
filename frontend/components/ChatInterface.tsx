import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Bot, User, Loader2, Database, Globe, Sparkles, Download, Trash2, Search as SearchIcon, ExternalLink } from 'lucide-react';

interface Props {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (text: string, useWebSearch: boolean) => void;
  onClearChat: () => void;
}

const CHAT_TEMPLATES = [
  "Analyze potential shrinkflation for Susu Bear Brand.",
  "Compare historical and live margins for Kopi Sachet ABC.",
  "Find the latest news about Unilever's (UNVR.JK) earnings report."
];

export const ChatInterface: React.FC<Props> = ({ messages, isTyping, onSendMessage, onClearChat }) => {
  const [input, setInput] = useState('');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim(), useWebSearch);
      setInput('');
    }
  };

  const handleTemplateClick = (template: string) => {
    if (!isTyping) {
      // Auto-enable web search if template implies searching news
      const needsSearch = template.includes("latest news");
      if (needsSearch) setUseWebSearch(true);
      onSendMessage(template, needsSearch || useWebSearch);
    }
  };

  const handleExport = () => {
    if (messages.length === 0) return;
    const textContent = messages.map(m => `[${m.role.toUpperCase()}] - ${m.timestamp.toLocaleString()}\n${m.text}\n\n`).join('');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Analyst_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center z-10">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-500" />
            AI Analyst Terminal
          </h1>
        </div>
        <div className="flex gap-3 items-center">
          <div className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
            <Database className="w-3 h-3 text-blue-400" />
            BigQuery
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700 mr-2">
            <Globe className="w-3 h-3 text-emerald-400" />
            Bright Data
          </div>
          <button onClick={handleExport} title="Export Report" className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={onClearChat} title="Clear Chat" className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                <Bot className="w-8 h-8 text-emerald-500/50" />
            </div>
            <p className="text-center max-w-md text-sm">
              Enterprise AI Agent initialized. Query historical data, request live Bright Data scrapes, or ask for margin impact analysis.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
              msg.role === 'user' ? 'bg-emerald-600' : 
              msg.role === 'system' ? 'bg-slate-800' : 'bg-slate-900 border border-slate-700'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : 
               msg.role === 'system' ? <Database className="w-4 h-4 text-slate-400" /> :
               <Bot className="w-4 h-4 text-emerald-400" />}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-sm' 
                : msg.role === 'system'
                ? 'bg-slate-900 text-slate-500 text-xs border border-slate-800 rounded-tl-sm font-mono whitespace-pre-wrap'
                : 'bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-sm leading-relaxed text-sm'
            }`}>
              {msg.text.split('\n').map((line, i) => {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <span key={i} className="block min-h-[1em]">
                    {parts.map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="font-semibold text-emerald-400">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </span>
                );
              })}
              
              {/* Render Grounding URLs if available */}
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                    <SearchIcon className="w-3 h-3" /> Reference Sources (Google Search):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((url, idx) => (
                      <a 
                        key={idx} 
                        href={url.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs text-brand-400 transition-colors max-w-full"
                        title={url.title}
                      >
                        <span className="truncate max-w-[200px]">{url.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider animate-pulse">Processing Intelligence...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area with Templates & Toggles */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-2">
              <Sparkles className="w-3.5 h-3.5" /> Templates:
            </div>
            {CHAT_TEMPLATES.map((template, idx) => (
              <button
                key={idx}
                onClick={() => handleTemplateClick(template)}
                disabled={isTyping}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {template}
              </button>
            ))}
          </div>
          
          {/* Web Search Toggle */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Web Search</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={useWebSearch} onChange={() => setUseWebSearch(!useWebSearch)} disabled={isTyping} />
              <div className={`block w-8 h-5 rounded-full transition-colors ${useWebSearch ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${useWebSearch ? 'translate-x-3' : ''}`}></div>
            </div>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command or query..."
            disabled={isTyping}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl pl-5 pr-14 py-3.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-emerald-600"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
