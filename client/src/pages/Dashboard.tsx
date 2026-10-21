import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  History, 
  ArrowRight, 
  X, 
  Code2, 
  GitCompare, 
  Bookmark, 
  ShieldCheck, 
  TrendingUp, 
  Cpu
} from 'lucide-react';

const SUGGESTED_DEVELOPERS = [
  { username: 'torvalds', label: 'Linus Torvalds', tag: 'Linux / Git', color: 'from-amber-500/20 to-orange-500/10' },
  { username: 'gaearon', label: 'Dan Abramov', tag: 'React / Redux', color: 'from-cyan-500/20 to-blue-500/10' },
  { username: 'shadcn', label: 'shadcn', tag: 'Tailwind UI', color: 'from-zinc-500/20 to-slate-500/10' },
  { username: 'sindresorhus', label: 'Sindre Sorhus', tag: 'Open Source', color: 'from-indigo-500/20 to-purple-500/10' },
  { username: 'tj', label: 'TJ Holowaychuk', tag: 'Apex / Express', color: 'from-emerald-500/20 to-teal-500/10' },
  { username: 'yyx990803', label: 'Evan You', tag: 'Vue / Vite', color: 'from-emerald-500/20 to-lime-500/10' },
];

export const Dashboard: React.FC = () => {
  const [username, setUsername] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('stackpulse_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const handleSearch = (targetUser?: string) => {
    const query = (targetUser || username).trim();
    if (!query) return;

    // Save to recents
    const updated = [query, ...recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem('stackpulse_recent_searches', JSON.stringify(updated));

    navigate(`/developer/${encodeURIComponent(query)}`);
  };

  const clearRecent = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== itemToRemove);
    setRecentSearches(updated);
    localStorage.setItem('stackpulse_recent_searches', JSON.stringify(updated));
  };

  return (
    <div className="relative overflow-hidden">
      {/* Ambient Radial Background Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-[128px] animate-pulse-glow"></div>
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[128px]"></div>
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide shadow-inner mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
            <span>Real-time GitHub Developer Analytics & Benchmarking</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]">
            Explore Developer Activity <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              With Deep Intelligence
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl mx-auto font-normal">
            Instant stars aggregation, interactive language donut charts, commit timelines, and side-by-side multi-developer benchmarks.
          </p>
        </div>

        {/* High-Tech Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative group"
          >
            {/* Glowing outer border halo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-3xl blur-md opacity-40 group-hover:opacity-75 group-focus-within:opacity-100 transition duration-500"></div>

            <div className="relative flex items-center bg-[#0D1322] border border-slate-700/80 rounded-2xl shadow-2xl p-2 sm:p-2.5 backdrop-blur-xl">
              <div className="pl-3.5 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
              <input
                type="text"
                id="github-search-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Search any GitHub developer (e.g. torvalds, gaearon)..."
                className="flex-1 bg-transparent px-2 py-3 text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none font-medium"
              />
              <button
                type="submit"
                id="search-submit-btn"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Analyze</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick-Pick Suggested Pills */}
          <div className="mt-5 flex flex-wrap items-center gap-2 justify-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Trending:
            </span>
            {SUGGESTED_DEVELOPERS.map((dev) => (
              <button
                key={dev.username}
                onClick={() => handleSearch(dev.username)}
                className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 hover:border-indigo-500/50 shadow-sm transition-all hover:scale-105"
              >
                <span className="font-mono text-indigo-300">@{dev.username}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({dev.tag})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="max-w-2xl mx-auto mb-16">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <div
                  key={item}
                  onClick={() => handleSearch(item)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-200 text-xs font-mono cursor-pointer transition-all group shadow-sm hover:scale-105"
                >
                  <span className="text-indigo-400">#</span>
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={(e) => clearRecent(e, item)}
                    className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* High-Tech Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="glass-card stat-card-gradient p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Aggregated Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Total stars and language distributions are calculated automatically across all public repositories with conditional ETag caching.
            </p>
          </div>

          <div className="glass-card stat-card-gradient p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <GitCompare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Head-to-Head Compare</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Compare 2 to 5 developers simultaneously with side-by-side matrices, multi-bar metric charts, and 1-click comparison saving.
            </p>
          </div>

          <div className="glass-card stat-card-gradient p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Curate & Pin Repositories</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Bookmark repositories, attach personal engineering notes, and organize with custom tags. Isolated securely to your account.
            </p>
          </div>
        </div>

        {/* Engine Security & Caching Badge Footer */}
        <div className="mt-16 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>PostgreSQL Caching Layer (0 Quota Consumption)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>JWT & Bcrypt Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
