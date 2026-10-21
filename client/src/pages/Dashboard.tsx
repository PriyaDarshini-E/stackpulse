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
  Cpu,
  Trash2,
} from 'lucide-react';

const EXAMPLE_CHIPS = [
  { username: 'torvalds', label: 'Linus Torvalds', role: 'Linux' },
  { username: 'gaearon', label: 'Dan Abramov', role: 'React' },
  { username: 'sindresorhus', label: 'Sindre Sorhus', role: 'Open Source' },
  { username: 'shadcn', label: 'shadcn', role: 'UI Components' },
];

export const Dashboard: React.FC = () => {
  const [username, setUsername] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('stackpulse_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const handleSearch = (targetUser?: string) => {
    const query = (targetUser || username).trim();
    if (!query) return;

    // Save to recents in localStorage
    const updated = [query, ...recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem('stackpulse_recent_searches', JSON.stringify(updated));

    navigate(`/developer/${encodeURIComponent(query)}`);
  };

  const clearRecent = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s.toLowerCase() !== itemToRemove.toLowerCase());
    setRecentSearches(updated);
    localStorage.setItem('stackpulse_recent_searches', JSON.stringify(updated));
  };

  const clearAllRecents = () => {
    setRecentSearches([]);
    localStorage.removeItem('stackpulse_recent_searches');
  };

  return (
    <div className="relative overflow-hidden w-full">
      {/* Ambient Radial Background Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] pointer-events-none overflow-hidden">
        <div className="absolute top-6 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/15 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute top-12 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide shadow-inner mb-4 sm:mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>GitHub Developer Intelligence & Benchmarking</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 sm:mb-6 leading-tight">
            Explore Developer Activity
            <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              With Deep Intelligence
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto font-normal">
            Aggregated stars, interactive language distributions, commit velocity, and side-by-side developer benchmarks.
          </p>
        </div>

        {/* Large Centered Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative group"
          >
            {/* Ambient halo glow on hover/focus */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-3xl blur-md opacity-35 group-hover:opacity-65 group-focus-within:opacity-100 transition duration-500" />

            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-[#0D1322] border border-slate-700/80 rounded-2xl shadow-2xl p-2 sm:p-2.5 backdrop-blur-xl gap-2">
              <div className="flex items-center flex-1 min-w-0">
                <div className="pl-3.5 pr-2.5 text-slate-400 shrink-0">
                  <Search className="w-5 h-5 text-indigo-400" />
                </div>
                <input
                  type="text"
                  id="github-search-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter GitHub username (e.g. torvalds)..."
                  className="w-full bg-transparent px-1 py-3 text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none font-medium truncate"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                id="search-submit-btn"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Row of Clickable Example Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 justify-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Examples:
            </span>
            {EXAMPLE_CHIPS.map((chip) => (
              <button
                key={chip.username}
                onClick={() => handleSearch(chip.username)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 hover:border-indigo-500/50 transition-all active:scale-95 shadow-sm"
              >
                <span className="font-mono text-indigo-300 font-bold">@{chip.username}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">({chip.role})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches Section */}
        <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Recent Searches</span>
            </div>
            {recentSearches.length > 0 && (
              <button
                type="button"
                onClick={clearAllRecents}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium px-2 py-0.5 rounded-lg hover:bg-rose-500/10"
                title="Clear all recent searches"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {recentSearches.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <div
                  key={item}
                  onClick={() => handleSearch(item)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-200 text-xs font-mono cursor-pointer transition-all active:scale-95 shadow-sm group"
                >
                  <span className="text-indigo-400 font-bold">#</span>
                  <span className="truncate max-w-[150px]">{item}</span>
                  <button
                    type="button"
                    onClick={(e) => clearRecent(e, item)}
                    className="text-slate-500 group-hover:text-slate-400 hover:!text-rose-400 transition-colors p-0.5 rounded-md hover:bg-slate-700/50"
                    title={`Remove ${item}`}
                    aria-label={`Remove ${item} from recent searches`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Friendly Empty State */
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2.5">
                <History className="w-5 h-5 text-indigo-400/80" />
              </div>
              <p className="text-sm font-semibold text-slate-200">No recent searches yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Profiles you search will appear here for fast access. Try searching for <span className="text-indigo-300 font-mono">torvalds</span> or <span className="text-indigo-300 font-mono">gaearon</span> above!
              </p>
            </div>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
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

        {/* Engine Security & Caching Footer Badge */}
        <div className="mt-10 sm:mt-14 text-center flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
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
