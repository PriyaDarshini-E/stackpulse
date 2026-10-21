import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bookmark, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Star, 
  GitFork, 
  Tag, 
  Check, 
  X,
  FileText,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../services/api.js';
import { Pin } from '../types/index.js';

export const Pins: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Editing state for inline editing
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Fetch pins
  const { data, isLoading } = useQuery({
    queryKey: ['pins'],
    queryFn: () => apiRequest<{ pins: Pin[] }>('/pins'),
  });

  const pins = data?.pins || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (pinId: string) => apiRequest(`/pins/${pinId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pins'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ pinId, note, tags }: { pinId: string; note: string; tags: string[] }) =>
      apiRequest(`/pins/${pinId}`, {
        method: 'PATCH',
        body: JSON.stringify({ note, tags }),
      }),
    onSuccess: () => {
      setEditingPinId(null);
      queryClient.invalidateQueries({ queryKey: ['pins'] });
    },
  });

  // Collect all unique tags
  const allTags = Array.from(
    new Set(pins.flatMap((p) => p.tags || []))
  );

  // Filter pins
  const filteredPins = pins.filter((p) => {
    const matchesSearch =
      p.repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.note && p.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.repo.developer?.github_username &&
        p.repo.developer.github_username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = selectedTag ? p.tags.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  const startEdit = (pin: Pin) => {
    setEditingPinId(pin.id);
    setEditNote(pin.note || '');
    setEditTags(pin.tags || []);
    setNewTagInput('');
  };

  const handleAddEditTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newTagInput.trim().toLowerCase();
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags([...editTags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveEditTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove));
  };

  const saveEdit = (pinId: string) => {
    updateMutation.mutate({ pinId, note: editNote, tags: editTags });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Curated Engineering Knowledge</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pinned Repositories
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize standout repositories with personal notes and custom tags
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
            Total Pinned: <strong className="text-white">{pins.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by repository, developer, or note..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-500"
            />
          </div>

          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
            >
              <span>Tag: #{selectedTag}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60">
            <span className="text-xs text-slate-500 mr-1">Filter by tag:</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pins Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800 animate-pulse h-48"></div>
          ))}
        </div>
      ) : filteredPins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPins.map((pin) => {
            const isEditing = editingPinId === pin.id;

            return (
              <div
                key={pin.id}
                className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800/90 flex flex-col justify-between hover:border-indigo-500/40 transition-all space-y-3.5"
              >
                <div>
                  {/* Top Bar: Dev username and actions */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {pin.repo.developer?.avatar_url && (
                        <img
                          src={pin.repo.developer.avatar_url}
                          alt="avatar"
                          className="w-6 h-6 rounded-full border border-slate-700"
                        />
                      )}
                      {pin.repo.developer?.github_username && (
                        <Link
                          to={`/developer/${pin.repo.developer.github_username}`}
                          className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <UserIcon className="w-3 h-3" />
                          @{pin.repo.developer.github_username}
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => (isEditing ? setEditingPinId(null) : startEdit(pin))}
                        aria-label={isEditing ? 'Cancel Edit' : `Edit Note & Tags for ${pin.repo.name}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title={isEditing ? 'Cancel Edit' : 'Edit Note & Tags'}
                      >
                        {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(pin.id)}
                        aria-label={`Unpin ${pin.repo.name}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Unpin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Repo Title & Description */}
                  <div className="mb-3">
                    <a
                      href={pin.repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5 break-all"
                    >
                      <span>{pin.repo.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    </a>
                    {pin.repo.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {pin.repo.description}
                      </p>
                    )}
                  </div>

                  {/* Inline Note and Tag Editor */}
                  {isEditing ? (
                    <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-indigo-400" />
                          Personal Note
                        </label>
                        <textarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          rows={2}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-500"
                          placeholder="Add notes..."
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-indigo-400" />
                          Tags
                        </label>
                        <div className="flex gap-1.5 mb-2">
                          <input
                            type="text"
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyDown={handleAddEditTag}
                            placeholder="Add tag and hit Enter"
                            className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddEditTag}
                            className="px-2.5 py-1 bg-slate-800 text-xs rounded-lg text-slate-300"
                          >
                            Add
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {editTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            >
                              #{tag}
                              <button onClick={() => handleRemoveEditTag(tag)} className="hover:text-rose-400">
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingPinId(null)}
                          className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(pin.id)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Note display */}
                      {pin.note && (
                        <div className="mb-3 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed italic flex items-start gap-2">
                          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>"{pin.note}"</span>
                        </div>
                      )}

                      {/* Tag Badges */}
                      {pin.tags && pin.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {pin.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={() => setSelectedTag(tag)}
                              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:border-indigo-500/50 cursor-pointer transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer Meta */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    {pin.repo.primary_language && (
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        {pin.repo.primary_language}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-amber-400/90 font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-400/20" />
                      {pin.repo.stars.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <GitFork className="w-3.5 h-3.5" />
                      {pin.repo.forks.toLocaleString()}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    Pinned {new Date(pin.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">No Pinned Repositories Yet</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Search for developers, inspect their repositories, and click "Pin" to curate your favorite projects here.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Developers</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pins;
