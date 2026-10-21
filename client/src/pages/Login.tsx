import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  Activity,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  GitCompare,
  Bookmark,
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Automatically focus on email input on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Email address is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:overflow-hidden">
      <div className="w-full max-w-5xl my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Headline & Feature Highlights (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center space-y-3.5 pr-2">
            {/* Headline */}
            <div>
              <h1 className="text-2xl xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Understand the developers{' '}
                <span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-500 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-400 bg-clip-text text-transparent">
                  behind the code.
                </span>
              </h1>
              <p className="mt-1.5 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg">
                Explore comprehensive GitHub analytics, compare developer performance side by side, and pin key repositories with private notes.
              </p>
            </div>

            {/* 3 Feature Highlights in a Card with Full Perimeter Animated Outer Border */}
            <div className="perimeter-border-card shadow-xl">
              {/* Outer Border Animation running around the COMPLETE perimeter */}
              <div className="perimeter-border-glow" />
              <div className="perimeter-border-runner" />

              {/* Inner Card Container */}
              <div className="relative z-10 w-full h-full rounded-[calc(1.5rem-1.5px)] p-3.5 sm:p-4 glass-panel border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
                {/* Ambient Glow Orbs */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800/70 transition-all duration-200">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 dark:text-white">Search any GitHub developer</h2>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                        Explore language distribution, top stars, repository breakdowns, and commit activity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800/70 transition-all duration-200">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-sm">
                      <GitCompare className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 dark:text-white">Compare side by side</h2>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                        Benchmark multiple profiles in real-time with automated metric leadership highlights.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800/70 transition-all duration-200">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 dark:text-white">Pin and annotate repos</h2>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                        Keep track of standout projects with custom tags and private engineering notes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Card (Centered on mobile) */}
          <div className="w-full max-w-sm mx-auto lg:max-w-none lg:col-span-6 xl:col-span-5">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-4">
              <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20 mb-2">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Sign in to explore GitHub developer insights</p>
            </div>

            {/* Clean Glass Form Card */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl relative overflow-hidden">
              {/* Subtle ambient gradients */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="hidden lg:block mb-3.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Sign in to explore GitHub developer insights</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-600 dark:text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
                {/* Email Field with Focused Perimeter Border Animation */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="field-border-wrapper">
                    <div className="field-border-glow" />
                    <div className="field-border-runner" />

                    <div className="field-inner relative z-10 flex items-center w-full px-2 py-1 rounded-[calc(0.75rem-1.5px)] bg-slate-900 transition-colors shadow-sm">
                      <div className="w-7 h-7 rounded-md bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 mr-2.5 pointer-events-none">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        ref={emailInputRef}
                        autoFocus
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="developer@example.com"
                        className="w-full min-h-[34px] bg-transparent pr-3 py-1 text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field with Focused Perimeter Border Animation */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="field-border-wrapper">
                    <div className="field-border-glow" />
                    <div className="field-border-runner" />

                    <div className="field-inner relative z-10 flex items-center w-full px-2 py-1 rounded-[calc(0.75rem-1.5px)] bg-slate-900 transition-colors shadow-sm">
                      <div className="w-7 h-7 rounded-md bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 mr-2.5 pointer-events-none">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="••••••••"
                        className="w-full min-h-[34px] bg-transparent pr-10 py-1 text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center justify-center min-h-[34px] min-w-[34px] text-slate-400 hover:text-white transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full min-h-[40px] mt-1 rounded-xl text-white text-xs sm:text-sm font-semibold flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer active:scale-[0.985]"
                >
                  {/* Ambient backdrop glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-xl blur-sm opacity-40 group-hover:opacity-85 group-hover:blur-md transition-all duration-300 pointer-events-none" />

                  {/* Button surface */}
                  <div className="relative w-full h-full min-h-[40px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center gap-2 overflow-hidden shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-600/50 transition-shadow">
                    {/* Specular top highlight */}
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                    {/* Animated luminous shimmer beam */}
                    <div className="btn-shimmer-sweep pointer-events-none" />

                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                    ) : (
                      <>
                        <span className="relative z-10 font-semibold tracking-wide">Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Footer */}
              <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
