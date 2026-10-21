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
  { username: 'torvalds', label: 'Linus Torvalds', tag: 'Linux' },
  { username: 'gaearon', label: 'Dan Abramov', tag: 'React' },
  { username: 'shadcn', label: 'shadcn', tag: 'Tailwind' },
  { username: 'sindresorhus', label: 'Sindre Sorhus', tag: 'OSS' },
  { username: 'tj', label: 'TJ Holowaychuk', tag: 'Express' },
  { username: 'yyx990803', label: 'Evan You', tag: 'Vite' },
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
    <div className="relative overflow-hidden w-full">
      {/* Ambient Radial Background Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none overflow-hidden">
        <div className="absolute top-6 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/15 rounded-full blur-[90px] sm:blur-[128px] animate-pulse-glow"></div>
        <div className="absolute top-12 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-cyan-500/10 rounded-full blur-[90px] sm:blur-[128px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-semibold tracking-wide shadow-inner mb-3 sm:mb-6 backdrop-blur-md max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">GitHub Developer Analytics & Benchmarking</span>
          </div>

          <h1 className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-3 sm:mb-6 leading-tight">
            Explore Developer Activity
            <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              With Deep Intelligence
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300/90 leading-relaxed max-w-xl mx-auto font-normal px-2">
            Instant stars aggregation, interactive language charts, commit timelines, and side-by-side developer benchmarks.
          </p>
        </div>

        {/* High-Tech Mobile-Optimized Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative group"
          >
            {/* Glowing outer border halo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-2xl sm:rounded-3xl blur-md opacity-40 group-hover:opacity-75 group-focus-within:opacity-100 transition duration-500"></div>

            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-[#0D1322] border border-slate-700/80 rounded-2xl shadow-2xl p-2 sm:p-2.5 backdrop-blur-xl gap-2">
              <div className="flex items-center flex-1 min-w-0">
                <div className="pl-3 pr-2 text-slate-400 shrink-0">
                  <Search className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-400" />
                </div>
                <input
                  type="text"
                  id="github-search-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter GitHub username (e.g. torvalds)..."
                  className="w-full bg-transparent px-1 py-2 sm:py-3 text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none font-medium truncate"
                />
              </div>
              <button
                type="submit"
                id="search-submit-btn"
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-[0.98]"
              >
                <span>Analyze</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick-Pick Suggested Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2 justify-center">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              Popular:
            </span>
            {SUGGESTED_DEVELOPERS.map((dev) => (
              <button
                key={dev.username}
                onClick={() => handleSearch(dev.username)}
                className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 hover:border-indigo-500/50 transition-all active:scale-95"
              >
                <span className="font-mono text-indigo-300">@{dev.username}</span>
                <span className="text-[10px] text-slate-400">({dev.tag})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="flex items-center gap-1.5 mb-2.5 text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
              <History className="w-3 h-3 text-indigo-400" />
              <span>Recent Lookups</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {recentSearches.map((item) => (
                <div
                  key={item}
                  onClick={() => handleSearch(item)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono cursor-pointer transition-all active:scale-95"
                >
                  <span className="text-indigo-400 font-bold">#</span>
                  <span className="truncate max-w-[140px]">{item}</span>
                  <button
                    type="button"
                    onClick={(e) => clearRecent(e, item)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-0.5"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <div className="glass-card stat-card-gradient p-5 sm:p-6 rounded-2xl border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">Aggregated Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Total stars and language distributions are calculated automatically across all public repositories with conditional ETag caching.
            </p>
          </div>

          <div className="glass-card stat-card-gradient p-5 sm:p-6 rounded-2xl border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">Head-to-Head Compare</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Compare 2 to 5 developers simultaneously with side-by-side matrices, multi-bar metric charts, and 1-click comparison saving.
            </p>
          </div>

          <div className="glass-card stat-card-gradient p-5 sm:p-6 rounded-2xl border border-slate-800/80 sm:col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">Curate & Pin Repositories</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Bookmark repositories, attach personal engineering notes, and organize with custom tags. Isolated securely to your account.
            </p>
          </div>
        </div>

        {/* Engine Security & Caching Badge Footer */}
        <div className="mt-10 sm:mt-14 text-center flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] sm:text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>PostgreSQL Caching Layer (0 Quota Consumption)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>JWT & Bcrypt Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
