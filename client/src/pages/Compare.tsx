import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  GitCompare, 
  Plus, 
  X, 
  Star, 
  Users, 
  BookMarked, 
  Code, 
  Award, 
  BookmarkCheck, 
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { apiRequest } from '../services/api.js';

const DEVELOPER_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

export const Compare: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selected usernames state
  const [usernames, setUsernames] = useState<string[]>(() => {
    const raw = searchParams.get('users');
    if (raw) {
      return raw.split(',').map((u) => u.trim()).filter(Boolean);
    }
    return ['torvalds', 'gaearon']; // Default comparison
  });

  const [inputUsername, setInputUsername] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Save comparison modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [comparisonName, setComparisonName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync state to URL
  useEffect(() => {
    if (usernames.length > 0) {
      setSearchParams({ users: usernames.join(',') }, { replace: true });
    }
  }, [usernames, setSearchParams]);

  // Fetch comparison data
  const { 
    data: compareData, 
    isLoading, 
    error: fetchError,
    refetch 
  } = useQuery({
    queryKey: ['compare', usernames.join(',')],
    queryFn: () => apiRequest(`/compare?users=${encodeURIComponent(usernames.join(','))}`),
    enabled: usernames.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const handleAddDeveloper = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const trimmed = inputUsername.trim().toLowerCase();

    if (!trimmed) return;
    if (usernames.map((u) => u.toLowerCase()).includes(trimmed)) {
      setInputError('This developer is already in the comparison');
      return;
    }
    if (usernames.length >= 5) {
      setInputError('Maximum 5 developers can be compared at once');
      return;
    }

    setUsernames([...usernames, trimmed]);
    setInputUsername('');
  };

  const handleRemoveDeveloper = (usernameToRemove: string) => {
    if (usernames.length <= 2) {
      setInputError('At least 2 developers are required to compare');
      return;
    }
    setUsernames(usernames.filter((u) => u.toLowerCase() !== usernameToRemove.toLowerCase()));
  };

  const handleSaveComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comparisonName.trim() || !compareData?.developers) return;

    setSaveLoading(true);
    setSaveMessage(null);

    try {
      const developerIds = compareData.developers.map((d: any) => d.id);
      await apiRequest('/comparisons', {
        method: 'POST',
        body: JSON.stringify({
          name: comparisonName.trim(),
          developer_ids: developerIds,
        }),
      });

      setSaveMessage({ text: 'Comparison saved successfully!', type: 'success' });
      setTimeout(() => {
        setIsSaveModalOpen(false);
        setComparisonName('');
        setSaveMessage(null);
        navigate('/comparisons');
      }, 1200);
    } catch (err: any) {
      setSaveMessage({ text: err.message || 'Failed to save comparison', type: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  const developers = compareData?.developers || [];

  // Determine maximum values for highlights
  const maxStars = Math.max(...developers.map((d: any) => d.total_stars || 0), 0);
  const maxFollowers = Math.max(...developers.map((d: any) => d.followers || 0), 0);
  const maxRepos = Math.max(...developers.map((d: any) => d.public_repos || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Multi-Developer Head-to-Head</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Compare Developers
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Side-by-side analysis of stars, followers, repositories, and programming languages
          </p>
        </div>

        {developers.length >= 2 && (
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all self-start md:self-auto"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Save Comparison</span>
          </button>
        )}
      </div>

      {/* Developer Selector Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <form onSubmit={handleAddDeveloper} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUsername}
              onChange={(e) => {
                setInputUsername(e.target.value);
                setInputError(null);
              }}
              placeholder="Add another GitHub username (e.g. shadcn, sindresorhus)..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Developer</span>
          </button>
        </form>

        {inputError && (
          <p className="text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {inputError}
          </p>
        )}

        {/* Selected Developer Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Comparing ({usernames.length}/5):
          </span>
          {usernames.map((u, idx) => (
            <div
              key={u}
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-200"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: DEVELOPER_COLORS[idx % DEVELOPER_COLORS.length] }}
              ></span>
              <span className="font-mono">@{u}</span>
              <button
                type="button"
                onClick={() => handleRemoveDeveloper(u)}
                className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-700/60"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-500">Quick Presets:</span>
          <button
            type="button"
            onClick={() => setUsernames(['torvalds', 'gaearon'])}
            className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-indigo-300 border border-slate-700/60 text-[11px]"
          >
            Linus vs Dan Abramov
          </button>
          <button
            type="button"
            onClick={() => setUsernames(['shadcn', 'sindresorhus', 'tj'])}
            className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-indigo-300 border border-slate-700/60 text-[11px]"
          >
            UI & Open Source Leads
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400 font-medium">
            Fetching and comparing developers in parallel...
          </p>
        </div>
      )}

      {fetchError && (
        <div className="glass-panel p-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Comparison Failed</h3>
          <p className="text-xs text-rose-300 max-w-md mx-auto">
            {(fetchError as any)?.message || 'Failed to compare developers.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Comparison View */}
      {!isLoading && developers.length >= 2 && (
        <div className="space-y-8">
          {/* Comparison Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60">
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400 w-48">
                      Metric
                    </th>
                    {developers.map((dev: any, idx: number) => (
                      <th key={dev.id} className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={dev.avatar_url || 'https://github.com/identicons/user.png'}
                            alt={dev.github_username}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                              <span>{dev.name || dev.github_username}</span>
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: DEVELOPER_COLORS[idx % DEVELOPER_COLORS.length] }}
                              ></span>
                            </div>
                            <a
                              href={`https://github.com/${dev.github_username}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-indigo-400 font-mono hover:underline flex items-center gap-0.5"
                            >
                              @{dev.github_username}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {/* Total Stars Row */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-400 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                      Total Stars
                    </td>
                    {developers.map((dev: any) => {
                      const isLeader = dev.total_stars === maxStars && maxStars > 0;
                      return (
                        <td key={dev.id} className="py-4 px-6">
                          <div className="flex items-center gap-2 font-mono text-base font-bold text-white">
                            <span>{dev.total_stars.toLocaleString()}</span>
                            {isLeader && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                <Award className="w-3 h-3" /> Leader
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Followers Row */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-400 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      Followers
                    </td>
                    {developers.map((dev: any) => {
                      const isLeader = dev.followers === maxFollowers && maxFollowers > 0;
                      return (
                        <td key={dev.id} className="py-4 px-6">
                          <div className="flex items-center gap-2 font-mono text-base font-bold text-white">
                            <span>{dev.followers.toLocaleString()}</span>
                            {isLeader && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                                Top
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Public Repos Row */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-400 flex items-center gap-2">
                      <BookMarked className="w-4 h-4 text-cyan-400" />
                      Public Repos
                    </td>
                    {developers.map((dev: any) => {
                      const isLeader = dev.public_repos === maxRepos && maxRepos > 0;
                      return (
                        <td key={dev.id} className="py-4 px-6">
                          <div className="flex items-center gap-2 font-mono text-base font-bold text-white">
                            <span>{dev.public_repos.toLocaleString()}</span>
                            {isLeader && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                                Most
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Top Languages Row */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-400 flex items-center gap-2">
                      <Code className="w-4 h-4 text-purple-400" />
                      Top Languages
                    </td>
                    {developers.map((dev: any) => (
                      <td key={dev.id} className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {dev.topLanguages && dev.topLanguages.length > 0 ? (
                            dev.topLanguages.map((lang: string) => (
                              <span
                                key={lang}
                                className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                              >
                                {lang}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-xs">N/A</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Profile Link Action Row */}
                  <tr className="bg-slate-900/40">
                    <td className="py-4 px-6 font-semibold text-slate-400">Profile</td>
                    {developers.map((dev: any) => (
                      <td key={dev.id} className="py-4 px-6">
                        <button
                          onClick={() => navigate(`/developer/${dev.github_username}`)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                        >
                          View Full Profile
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Charts Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stars & Followers Comparison Bar Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Stars & Followers Comparison</span>
              </h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData?.chartMetrics?.overview || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} />
                    <XAxis dataKey="username" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                    <Bar dataKey="stars" name="Total Stars" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="followers" name="Followers" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Languages Comparison Bar Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Language Share Comparison (KB)</span>
              </h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData?.chartMetrics?.languages || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} />
                    <XAxis dataKey="language" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                    {developers.map((dev: any, idx: number) => (
                      <Bar
                        key={dev.github_username}
                        dataKey={dev.github_username}
                        name={`@${dev.github_username}`}
                        fill={DEVELOPER_COLORS[idx % DEVELOPER_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Comparison Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700/80 shadow-2xl relative">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">Save Comparison</h3>
            <p className="text-xs text-slate-400 mb-4">
              Give this comparison a memorable name so you can reopen it anytime.
            </p>

            {saveMessage && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 ${
                  saveMessage.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {saveMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveComparison} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Comparison Name
                </label>
                <input
                  type="text"
                  required
                  value={comparisonName}
                  onChange={(e) => setComparisonName(e.target.value)}
                  placeholder="e.g. Linux vs React Architects"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading || !comparisonName.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : 'Save Comparison'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
