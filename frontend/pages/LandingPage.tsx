import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, TrendingUp, Database, ShieldAlert, ArrowRight, BarChart3, Activity, Globe, Cpu, ChevronRight, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setScrolled(target.scrollTop > 50);
    };
    
    const container = document.getElementById('landing-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div id="landing-container" className="h-full bg-slate-950 text-slate-200 overflow-y-auto relative scroll-smooth">
      {/* Dynamic Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-brand-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[45vw] h-[45vw] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[130px] animate-blob" style={{ animationDelay: '4s' }}></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-slate-950 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-panel py-4 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="relative">
              <Radar className="w-8 h-8 text-emerald-500 transition-transform group-hover:rotate-90 duration-500" />
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md group-hover:bg-emerald-500/40 transition-colors"></div>
            </div>
            <span className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Shrinkflation<span className="text-emerald-400">AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#platform" className="hover:text-emerald-400 transition-colors relative group">
              Platform
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all group-hover:w-full"></span>
            </a>
            <a href="#technology" className="hover:text-emerald-400 transition-colors relative group">
              Technology
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all group-hover:w-full"></span>
            </a>
            <a href="#intelligence" className="hover:text-emerald-400 transition-colors relative group">
              Intelligence
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all group-hover:w-full"></span>
            </a>
          </div>
          
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 flex items-center gap-2"
          >
            Client Portal <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-40 pb-24 relative z-10 flex flex-col items-center text-center min-h-[90vh] justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8 animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          AITema Hackathon 2026 Winner - Track 2
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
          Uncover Hidden Margins <br className="hidden md:block" />
          <span className="relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-brand-400 to-emerald-500">
              Before Earnings Calls
            </span>
            <div className="absolute -bottom-2 left-0 w-full h-3 bg-emerald-500/20 blur-lg"></div>
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 animate-slide-up opacity-0 leading-relaxed" style={{ animationDelay: '0.3s' }}>
          Empowering hedge funds and retail analysts to detect FMCG shrinkflation in real-time. 
          We cross-reference historical datasets with live e-commerce scraping to predict gross margin expansions.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up opacity-0 w-full sm:w-auto" style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] group w-full sm:w-auto"
          >
            Launch Terminal 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a 
            href="#platform"
            className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 backdrop-blur-sm rounded-xl font-semibold transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            Explore Features
          </a>
        </div>

        {/* Floating Dashboard Preview */}
        <div className="mt-20 w-full max-w-5xl relative animate-slide-up opacity-0" style={{ animationDelay: '0.6s' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 h-full w-full"></div>
          <div className="glass-card rounded-t-2xl border-b-0 p-2 animate-float">
            <div className="bg-slate-900 rounded-t-xl overflow-hidden border border-slate-800 border-b-0 shadow-2xl">
              {/* Mock UI Header */}
              <div className="h-10 bg-slate-850 border-b border-slate-800 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              </div>
              {/* Mock UI Body */}
              <div className="h-64 bg-slate-950 p-6 flex gap-6 opacity-50">
                <div className="w-1/4 h-full bg-slate-900 rounded-lg border border-slate-800"></div>
                <div className="w-3/4 h-full flex flex-col gap-4">
                  <div className="h-1/3 w-full bg-slate-900 rounded-lg border border-slate-800"></div>
                  <div className="h-2/3 w-full bg-slate-900 rounded-lg border border-slate-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="platform" className="py-24 relative z-10 bg-slate-950/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Intelligence</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">A comprehensive suite of tools designed to uncover hidden market dynamics before they hit the mainstream news.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <Database className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Alternative Data Pipelines</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Seamlessly integrated with Bright Data Web Unlocker to scrape live product specifications across major e-commerce platforms, bypassing anti-bot systems.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time extraction</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Proxy network routing</li>
              </ul>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-brand-500/10 flex items-center justify-center mb-6 border border-brand-500/20 group-hover:bg-brand-500/20 transition-colors">
                <BarChart3 className="w-7 h-7 text-brand-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Stealth Margin Calculator</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Automatically translates a 20g product reduction into a projected quarterly revenue bump for specific ticker symbols (e.g., UNVR.JK).
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Price-per-unit tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Competitor benchmarking</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                <Cpu className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Predictive AI Agent</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Powered by Google Vertex AI. Chat with our agent to cross-analyze historical BigQuery data with live pricing to generate instant investment signals.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Natural language queries</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Web search grounding</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="technology" className="py-24 relative z-10 border-t border-slate-800/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-8">Powered by Industry Leaders</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-xl font-bold"><Globe className="w-8 h-8" /> Bright Data</div>
            <div className="flex items-center gap-2 text-xl font-bold"><Cpu className="w-8 h-8" /> Google Vertex AI</div>
            <div className="flex items-center gap-2 text-xl font-bold"><Database className="w-8 h-8" /> BigQuery</div>
            <div className="flex items-center gap-2 text-xl font-bold"><Activity className="w-8 h-8" /> React 18</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12 bg-slate-950 relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Radar className="w-6 h-6 text-emerald-500" />
            <span className="text-lg font-bold text-slate-300">ShrinkflationAI</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 AITema Hackathon Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
