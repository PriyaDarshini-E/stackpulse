import React from 'react';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
      {/* Header Skeleton */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-6 border border-slate-800">
        <div className="w-28 h-28 rounded-full bg-slate-800 shrink-0"></div>
        <div className="space-y-3 w-full max-w-lg text-center md:text-left">
          <div className="h-7 bg-slate-800 rounded-lg w-48 mx-auto md:mx-0"></div>
          <div className="h-4 bg-slate-850 rounded w-32 mx-auto md:mx-0"></div>
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          <div className="flex gap-4 pt-2 justify-center md:justify-start">
            <div className="h-5 w-24 bg-slate-800 rounded"></div>
            <div className="h-5 w-24 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="h-4 w-20 bg-slate-800 rounded"></div>
            <div className="h-8 w-16 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-800 h-80 flex flex-col justify-between">
          <div className="h-5 w-36 bg-slate-800 rounded"></div>
          <div className="w-48 h-48 rounded-full bg-slate-800/70 mx-auto"></div>
          <div className="h-4 w-48 bg-slate-800 rounded mx-auto"></div>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-slate-800 h-80 flex flex-col justify-between">
          <div className="h-5 w-36 bg-slate-800 rounded"></div>
          <div className="h-44 bg-slate-800/60 rounded"></div>
          <div className="h-4 w-48 bg-slate-800 rounded mx-auto"></div>
        </div>
      </div>

      {/* Repositories Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-40 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="h-5 w-40 bg-slate-800 rounded"></div>
              <div className="h-4 w-full bg-slate-800 rounded"></div>
              <div className="flex gap-4 pt-2">
                <div className="h-4 w-16 bg-slate-800 rounded"></div>
                <div className="h-4 w-16 bg-slate-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
