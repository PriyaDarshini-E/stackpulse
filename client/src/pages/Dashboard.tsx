import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, History, ArrowRight, X, Code2, GitCompare, Bookmark } from 'lucide-react';

const SUGGESTED_DEVELOPERS = [
  { username: 'torvalds', label: 'Linus Torvalds', tag: 'Linux / Git' },
  { username: 'gaearon', label: 'Dan Abramov', tag: 'React / Redux' },
  { username: 'shadcn', label: 'shadcn', tag: 'UI Components' },
  { username: 'sindresorhus', label: 'Sindre Sorhus', tag: 'Open Source' },
  { username: 'tj', label: 'TJ Holowaychuk', tag: 'Express / Apex' },
  { username: 'yyx990803', label: 'Evan You', tag: 'Vue / Vite' },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Real-time GitHub Developer Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Inspect, Analyze & Compare <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            Any GitHub Developer
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400">
          Instant metrics, aggregated stars, language distributions, commit timeline charts, and side-by-side comparison tables.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto mb-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
          <div className="relative flex items-center bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl p-2">
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5 text-indigo-400" />
            </div>
            <input
              type="text"
              id="github-search-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username (e.g. torvalds, gaearon)..."
              className="flex-1 bg-transparent px-2 py-3 text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none"
            />
            <button
              type="submit"
              id="search-submit-btn"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
            >
              <span>Analyze</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Suggested Developer Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 justify-center">
          <span className="text-xs text-slate-400 font-medium">Popular:</span>
          {SUGGESTED_DEVELOPERS.map((dev) => (
            <button
              key={dev.username}
              onClick={() => handleSearch(dev.username)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/40 transition-colors"
            >
              <span>{dev.username}</span>
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-400">
                ({dev.tag})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="max-w-2xl mx-auto mb-14">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Recent Lookups</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <div
                key={item}
                onClick={() => handleSearch(item)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-xs cursor-pointer transition-colors group"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={(e) => clearRecent(e, item)}
                  className="text-slate-400 hover:text-rose-400"
                  title="Remove from history"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Aggregated Intelligence</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatic calculation of total stars, language breakdown, and commit frequency across all public repositories with conditional ETag caching.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <GitCompare className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Side-by-Side Comparison</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Compare two or more developers simultaneously. Contrast stars, followers, top languages, and activity charts. Save named comparisons for later.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Curate & Pin Repositories</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pin standout repositories, attach personal engineering notes, and organize with custom tags. Scoped securely to your authenticated account.
          </p>
        </div>
      </div>
    </div>
  );
};
