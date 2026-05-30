import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Database, Shield, CheckCircle2, Moon, Sun, AlertOctagon, Trash2, Key, XCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { brightDataApiKey, setBrightDataApiKey, geminiApiKey, setGeminiApiKey, theme, setTheme } = useAppContext();

  const handleFactoryReset = () => {
    const confirmReset = window.confirm(
      "WARNING: This will delete all local data, including tracked products, chat history, alert rules, and API keys. The application will reload to its initial state. Are you sure?"
    );
    
    if (confirmReset) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Platform Settings</h1>
          <p className="text-slate-400">Configure your API integrations and system preferences.</p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-blue-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Appearance</h3>
                  <p className="text-sm text-slate-400">Toggle between dark and light mode.</p>
                </div>
              </div>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={theme === 'light'} 
                    onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                  />
                  <div className={`block w-12 h-7 rounded-full transition-colors ${theme === 'light' ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${theme === 'light' ? 'translate-x-5' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg"><Shield className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Google Gemini API Key</h3>
                  <p className="text-sm text-slate-400">Enterprise AI Analyst & Reasoning Core.</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${geminiApiKey ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {geminiApiKey ? <><CheckCircle2 className="w-4 h-4" /> Configured</> : <><XCircle className="w-4 h-4" /> Missing Key</>}
              </div>
            </div>
            <div className="mt-4">
              <input 
                type="password" 
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter Gemini API Key (AIzaSy...)" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
              />
            </div>
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-start gap-3">
              <Key className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                For the Cloud Run deployment, please provide your Gemini API Key here. It will be stored locally in your browser.
              </p>
            </div>
          </div>

          {/* Bright Data API Key */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500/10 rounded-lg"><Database className="w-5 h-5 text-brand-400" /></div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Bright Data API Key</h3>
                  <p className="text-sm text-slate-400">Required for live e-commerce scraping (Web Unlocker / Scraper API).</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${brightDataApiKey ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {brightDataApiKey ? <><CheckCircle2 className="w-4 h-4" /> Configured</> : <><XCircle className="w-4 h-4" /> Missing Key</>}
              </div>
            </div>
            <div className="mt-4">
              <input 
                type="password" 
                value={brightDataApiKey}
                onChange={(e) => setBrightDataApiKey(e.target.value)}
                placeholder="Enter Bright Data Token..." 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono"
              />
            </div>
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-start gap-3">
              <Shield className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Keys are stored locally in your browser's memory for this session. In a production environment, these would be securely managed via Google Cloud Secret Manager and accessed via Cloud Functions.
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/10 rounded-lg"><AlertOctagon className="w-5 h-5 text-rose-400" /></div>
              <div>
                <h3 className="text-lg font-semibold text-rose-400">Danger Zone</h3>
                <p className="text-sm text-rose-500/70">Irreversible destructive actions.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-rose-900/30">
              <div>
                <h4 className="text-sm font-medium text-slate-200">Factory Reset</h4>
                <p className="text-xs text-slate-500 mt-1">Clear all local storage, products, and chat history.</p>
              </div>
              <button 
                onClick={handleFactoryReset}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-600/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Reset App
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
