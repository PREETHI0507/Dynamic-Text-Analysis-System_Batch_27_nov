
import React, { useState, useEffect } from 'react';
import { AppState, AnalysisResult } from './types';
import { GeminiService } from './services/geminiService';
import NexusGraph from './components/NexusGraph';
import SentimentGauge from './components/SentimentGauge';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isError, setIsError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    // Default to dark mode as it was the original style
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleStart = () => {
    setState(AppState.INPUT);
    setIsFocused(true);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setState(AppState.ANALYZING);
    setIsError(false);
    try {
      const result = await GeminiService.analyzeText(inputText);
      setAnalysis(result);
      setState(AppState.DASHBOARD);
    } catch (error) {
      console.error(error);
      setIsError(true);
      setState(AppState.INPUT);
    }
  };

  const handleNewProject = () => {
    setAnalysis(null);
    setInputText('');
    setState(AppState.INPUT);
  };

  const exitWorkspace = () => {
    setIsFocused(false);
    setState(AppState.LANDING);
    setAnalysis(null);
    setInputText('');
  };

  const ThemeToggle = () => (
    <button 
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 transition-all border border-slate-900/5 dark:border-white/5"
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
      ) : (
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
      )}
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isFocused ? 'bg-slate-50 dark:bg-[#020617]' : 'bg-transparent'}`}>
      {/* Landing Navigation - Only shown when NOT focused */}
      {!isFocused && (
        <nav className="sticky top-0 z-50 glass-card px-8 py-5 flex justify-between items-center mx-6 mt-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 nexus-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">NarrativeNexus</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold">Features</a>
            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold">Enterprise</a>
            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold">API Docs</a>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button 
                onClick={handleStart} 
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/5 dark:shadow-white/5"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Workspace Header - Shown when IN flow */}
      {isFocused && (
        <div className="h-16 border-b border-slate-900/5 dark:border-white/5 glass-card px-6 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 nexus-gradient rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-slate-200">Narrative Analysis Portal</span>
            <div className="h-4 w-px bg-slate-900/10 dark:bg-white/10 mx-2"></div>
            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">
              {state === AppState.INPUT ? 'Input Mode' : state === AppState.ANALYZING ? 'Processing' : 'Analysis Results'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {state === AppState.DASHBOARD && (
               <button onClick={handleNewProject} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 px-4 py-2 rounded-lg border border-blue-400/20 transition-all">
                + NEW SESSION
              </button>
            )}
            <button onClick={exitWorkspace} className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 transition-all">
              EXIT WORKSPACE
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {state === AppState.LANDING && (
          <div className="relative overflow-hidden page-transition">
            <div className="max-w-7xl mx-auto px-6 pt-32 pb-48 text-center relative z-10">
              <div className="mb-6 animate-bounce">
                <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                  v4.0 Next-Gen Semantic Engine
                </span>
              </div>
              <h1 className="text-7xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.05] text-slate-900 dark:text-white">
                Turn Raw Text into <br />
                <span className="nexus-text-gradient">Pure Intelligence.</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
                NarrativeNexus employs high-dimensional semantic mapping to extract themes, 
                sentiment, and actionable connections from your unstructured data.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button 
                  onClick={handleStart}
                  className="group relative px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-extrabold text-xl transition-all transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-white/10"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Initialize Analysis 
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                  </span>
                </button>
                <button className="px-10 py-5 glass-card text-slate-900 dark:text-white rounded-2xl font-bold text-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  Explore Sample
                </button>
              </div>

              {/* Floating Feature Icons */}
              <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {[
                  { title: "Topic Graphs", desc: "Dynamic semantic mapping", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                  { title: "Smart Summary", desc: "AI-distilled insights", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                  { title: "Sentiment Flow", desc: "Emotional tone tracking", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                  { title: "Entity Map", desc: "Named entity recognition", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }
                ].map((f, i) => (
                  <div key={i} className="glass-card p-6 rounded-2xl text-left hover-glow transition-all group">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.icon}/>
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{f.title}</h3>
                    <p className="text-slate-500 text-xs mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Focused Flow Section */}
        {isFocused && (
          <div className="flex-1 flex flex-col page-transition relative">
            {(state === AppState.INPUT || state === AppState.ANALYZING) && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-4xl glass-card rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
                  {state === AppState.ANALYZING && (
                    <div className="absolute inset-0 z-50 bg-slate-50/95 dark:bg-[#020617]/95 backdrop-blur-md flex flex-col items-center justify-center">
                      <div className="relative w-24 h-24 mb-10">
                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Deconstructing Content...</h2>
                      <p className="text-slate-500 text-sm font-mono animate-pulse">Running semantic clustering algorithm...</p>
                    </div>
                  )}

                  <div className="mb-10 text-center">
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Feed the Engine</h2>
                    <p className="text-slate-500 dark:text-slate-400">Input any length of text. Reviews, articles, transcripts, or feedback.</p>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[30px] opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity blur-lg"></div>
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your source material here..."
                      className="relative w-full h-80 bg-slate-100 dark:bg-[#0f172a] border border-slate-900/5 dark:border-white/5 rounded-[28px] p-8 text-xl text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none transition-all custom-scrollbar placeholder:text-slate-400 dark:placeholder:text-slate-700"
                    />
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex gap-4">
                      <button className="flex items-center gap-2 px-6 py-3 bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 rounded-xl transition-all text-sm font-bold border border-slate-900/5 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        Load Template
                      </button>
                    </div>

                    <button 
                      onClick={handleAnalyze}
                      disabled={!inputText.trim()}
                      className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/10 active:scale-95"
                    >
                      EXECUTE NEURAL MAPPING
                    </button>
                  </div>

                  {isError && (
                    <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      <span className="text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest">Protocol Failure: Check API Key or Input Length</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {state === AppState.DASHBOARD && analysis && (
              <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
                <div className="max-w-[1600px] mx-auto">
                  {/* Dashboard Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
                    <div className="max-w-4xl">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-widest uppercase border border-emerald-500/20 rounded-full">Report Ready</span>
                        <span className="text-slate-400 dark:text-slate-600 text-[10px] font-mono tracking-tighter uppercase">ID: {Math.random().toString(36).substr(2, 9)}</span>
                      </div>
                      <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">The Semantic Nexus</h2>
                      <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        "{analysis.summary}"
                      </p>
                    </div>
                    <div className="flex gap-4">
                       <button className="flex items-center gap-2 px-6 py-3 glass-card hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-xs font-bold uppercase text-slate-700 dark:text-slate-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        Save Data
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Left Panel: Graph and Insights */}
                    <div className="xl:col-span-3 space-y-8">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl opacity-5 dark:opacity-10 group-hover:opacity-15 dark:group-hover:opacity-20 transition-opacity blur"></div>
                        <NexusGraph themes={analysis.themes} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card p-10 rounded-[32px]">
                          <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Thematic Clusters</h3>
                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
                            </div>
                          </div>
                          <div className="space-y-6">
                            {analysis.themes.map((theme, idx) => (
                              <div key={idx} className="p-4 bg-slate-900/5 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 hover:border-blue-500/30 transition-all group">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-bold text-slate-700 dark:text-slate-200">{theme.name}</span>
                                  <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase">{Math.round(theme.relevance * 100)}% Match</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-blue-500 h-full transition-all duration-1000 ease-out" style={{ width: `${theme.relevance * 100}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-3 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">{theme.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="glass-card p-10 rounded-[32px]">
                          <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Execution Vector</h3>
                            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {analysis.actionableInsights.map((insight, idx) => (
                              <div key={idx} className="flex gap-4 p-5 bg-gradient-to-r from-purple-500/5 to-transparent rounded-2xl border-l-2 border-purple-500/40">
                                <span className="text-lg font-black text-purple-500/30">{idx + 1}</span>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{insight}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Metrics & Entities */}
                    <div className="space-y-8">
                      <div className="glass-card rounded-[32px] overflow-hidden">
                        <SentimentGauge score={analysis.sentiment.score} label={analysis.sentiment.label} />
                        <div className="p-8 pt-0 mt-4 border-t border-slate-900/5 dark:border-white/5">
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Detailed Reasoning</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                            {analysis.sentiment.explanation}
                          </p>
                        </div>
                      </div>

                      <div className="glass-card p-8 rounded-[32px]">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center justify-between">
                          Semantic Nodes
                          <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">{analysis.entities.length} TOTAL</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.entities.map((entity, idx) => (
                            <div key={idx} className="group relative px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-900/5 dark:border-white/5 rounded-xl hover:border-blue-500/50 transition-all cursor-help">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{entity.name}</span>
                                <span className="text-[9px] text-slate-400 dark:text-slate-600 uppercase font-black">{entity.type}</span>
                              </div>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-50 dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 text-[10px] text-slate-600 dark:text-slate-400 leading-normal">
                                <div className="font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-tighter">Significance</div>
                                {entity.significance}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-50 dark:bg-slate-900 rotate-45 border-r border-b border-slate-900/10 dark:border-white/10"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-8 rounded-[32px] bg-gradient-to-br from-blue-600 to-purple-700 shadow-2xl shadow-blue-500/20">
                        <h3 className="text-xl font-black text-white mb-2">Export Protocol</h3>
                        <p className="text-sm text-white/70 mb-8 leading-relaxed">Intelligence generated at {new Date().toLocaleTimeString()}. Download complete dataset.</p>
                        <div className="grid grid-cols-1 gap-3">
                          <button className="w-full py-4 bg-white text-slate-900 rounded-xl font-black text-xs tracking-widest uppercase hover:scale-[1.02] transition-transform">GENERATE PDF LEDGER</button>
                          <button className="w-full py-4 bg-black/20 text-white rounded-xl font-black text-xs tracking-widest uppercase hover:bg-black/30 transition-colors">RAW JSON STREAM</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer - Only shown when NOT focused */}
      {!isFocused && (
        <footer className="glass-card mt-20 px-8 py-20 mx-6 mb-6 rounded-3xl">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 nexus-gradient rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </div>
                <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">NarrativeNexus</span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed text-sm">
                Architecting the future of text intelligence through advanced neural semantic mapping and high-dimensional analysis.
              </p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest mb-6">Network</h4>
              <nav className="flex flex-col gap-4 text-sm text-slate-500">
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Systems</a>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Neural Hub</a>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Integrations</a>
              </nav>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest mb-6">Terminal</h4>
              <nav className="flex flex-col gap-4 text-sm text-slate-500">
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Access Logic</a>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Security Node</a>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Status</a>
              </nav>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-slate-900/5 dark:border-white/5 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.2em]">
            <span>© 2024 NARRATIVE NEXUS LABS</span>
            <div className="flex gap-8">
              <a href="#" className="hover:text-slate-900 dark:hover:text-slate-400">Privacy Protocol</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-slate-400">End User License</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
