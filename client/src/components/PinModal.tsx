import React, { useState } from 'react';
import { X, Tag, FileText, Check, Trash2 } from 'lucide-react';
import { apiRequest } from '../services/api.js';

interface PinModalProps {
  repo: {
    id: string;
    name: string;
    primary_language?: string;
    stars: number;
    pin_details?: {
      id: string;
      note?: string;
      tags: string[];
    } | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ repo, isOpen, onClose, onSuccess }) => {
  const isEditing = !!repo.pin_details?.id;
  const [note, setNote] = useState<string>(repo.pin_details?.note || '');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(repo.pin_details?.tags || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && repo.pin_details?.id) {
        // PATCH existing pin
        await apiRequest(`/pins/${repo.pin_details.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ note, tags }),
        });
      } else {
        // POST new pin
        await apiRequest('/pins', {
          method: 'POST',
          body: JSON.stringify({ repo_id: repo.id, note, tags }),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save pin');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!repo.pin_details?.id) return;
    setLoading(true);
    try {
      await apiRequest(`/pins/${repo.pin_details.id}`, { method: 'DELETE' });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to remove pin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="glass-panel w-full max-w-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-700/80 shadow-2xl relative my-auto flex flex-col max-h-[calc(100dvh-1.5rem)]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80 shrink-0 pr-8">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-lg font-bold text-white truncate">
              {isEditing ? 'Edit Repository Pin' : 'Pin Repository'}
            </h3>
            <p className="text-xs text-indigo-400 font-mono truncate">{repo.name}</p>
          </div>
        </div>

        {error && (
          <div className="mt-2 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs shrink-0">
            {error}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 pt-3">
          <div className="flex-1 overflow-y-auto overscroll-contain pr-1 space-y-3 scrollbar-thin">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Personal Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why did you pin this repository?"
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tag and hit Enter"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 border border-slate-700 shrink-0"
                >
                  Add
                </button>
              </div>

              {/* Tag Badges */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-400 ml-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Actions - Always visible */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800 shrink-0">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Unpin</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving...' : 'Save Pin'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
