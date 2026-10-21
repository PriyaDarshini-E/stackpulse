import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FolderHeart, 
  GitCompare, 
  Trash2, 
  Edit2, 
  Calendar, 
  Check, 
  X,
  Plus
} from 'lucide-react';
import { apiRequest } from '../services/api.js';
import { Comparison } from '../types/index.js';

export const SavedComparisons: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Fetch saved comparisons
  const { data, isLoading } = useQuery({
    queryKey: ['saved_comparisons'],
    queryFn: () => apiRequest<{ comparisons: Comparison[] }>('/comparisons'),
  });

  const comparisons = data?.comparisons || [];

  // Delete comparison mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/comparisons/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved_comparisons'] });
    },
  });

  // Rename comparison mutation
  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiRequest(`/comparisons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      setRenamingId(null);
      queryClient.invalidateQueries({ queryKey: ['saved_comparisons'] });
    },
  });

  const handleReopen = (comparison: Comparison) => {
    const usernames = comparison.comparison_devs
      .map((cd) => cd.developer.github_username)
      .filter(Boolean);

    if (usernames.length >= 2) {
      navigate(`/compare?users=${encodeURIComponent(usernames.join(','))}`);
    }
  };

  const startRename = (comparison: Comparison) => {
    setRenamingId(comparison.id);
    setRenameValue(comparison.name);
  };

  const handleSaveRename = (id: string) => {
    if (renameValue.trim()) {
      renameMutation.mutate({ id, name: renameValue.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <FolderHeart className="w-3.5 h-3.5" />
            <span>Saved Insights</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Saved Comparisons
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access and reopen saved developer comparisons with side-by-side metrics
          </p>
        </div>

        <Link
          to="/compare"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Comparison</span>
        </Link>
      </div>

      {/* Comparisons Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800 animate-pulse h-48"></div>
          ))}
        </div>
      ) : comparisons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisons.map((cmp) => {
            const isRenaming = renamingId === cmp.id;

            return (
              <div
                key={cmp.id}
                className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all space-y-4 group"
              >
                <div>
                  {/* Title Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {isRenaming ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="flex-1 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleSaveRename(cmp.id)}
                          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRenamingId(null)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {cmp.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>Saved on {new Date(cmp.created_at).toLocaleDateString()}</span>
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startRename(cmp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(cmp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Compared Developers Badges */}
                  <div className="space-y-2 mt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Compared Developers:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cmp.comparison_devs.map(({ developer }) => (
                        <div
                          key={developer.id}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 min-w-0"
                        >
                          <img
                            src={developer.avatar_url || 'https://github.com/identicons/user.png'}
                            alt={developer.github_username}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div className="truncate min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {developer.name || developer.github_username}
                            </p>
                            <p className="text-[10px] text-indigo-400 font-mono truncate">
                              @{developer.github_username}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">
                    {cmp.comparison_devs.length} Developers
                  </span>

                  <button
                    onClick={() => handleReopen(cmp)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Reopen in Compare</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <FolderHeart className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">No Saved Comparisons</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare 2 or more developers side-by-side, then click "Save Comparison" to easily revisit your findings.
          </p>
          <div className="pt-2">
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              <GitCompare className="w-4 h-4" />
              <span>Launch Compare Tool</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedComparisons;
