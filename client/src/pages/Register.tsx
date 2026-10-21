import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Search,
  GitCompare,
  Bookmark,
} from 'lucide-react';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Focus primary input on mount
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
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
      await register(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline & Feature Highlights (Desktop only - duplicate logo removed) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center space-y-8 pr-4">
            {/* Headline */}
            <div>
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Understand the developers{' '}
                <span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-500 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-400 bg-clip-text text-transparent">
                  behind the code.
                </span>
              </h1>
              <p className="mt-4 text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-lg">
                Join StackPulse to benchmark developers, analyze repositories, and track key engineering contributors.
              </p>
            </div>

            {/* 3 Feature Highlights in a Card with Full Perimeter Animated Outer Border */}
            <div className="perimeter-border-card shadow-2xl">
              {/* Outer Border Animation running around the COMPLETE perimeter */}
              <div className="perimeter-border-glow" />
              <div className="perimeter-border-runner" />

              {/* Inner Card Container */}
              <div className="relative z-10 w-full h-full rounded-[calc(1.5rem-1.5px)] p-5 sm:p-6 glass-panel border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
                {/* Ambient Glow Orbs */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800/70 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Search any GitHub developer</h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Explore language distribution, top stars, repository breakdowns, and commit activity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800/70 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-sm">
                      <GitCompare className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Compare side by side</h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Benchmark multiple profiles in real-time with automated metric leadership highlights.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800/70 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pin and annotate repos</h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Keep track of standout projects with custom tags and private engineering notes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Card (Centered on mobile - clean card without outer perimeter animation) */}
          <div className="w-full max-w-md mx-auto lg:max-w-none lg:col-span-6 xl:col-span-5">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-xl shadow-indigo-500/20 mb-3">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Create an account</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Join StackPulse to analyze and compare developer profiles</p>
            </div>

            {/* Clean Glass Form Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl relative overflow-hidden">
              {/* Subtle ambient gradients */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="hidden lg:block mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create an account</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Join StackPulse to analyze and compare developer profiles</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3 text-rose-600 dark:text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email Field with Focused Perimeter Border Animation */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="field-border-wrapper">
                    <div className="field-border-glow" />
                    <div className="field-border-runner" />

                    <div className="field-inner relative z-10 flex items-center w-full rounded-[calc(0.75rem-1.5px)] bg-white dark:bg-slate-900 transition-colors shadow-sm">
                      <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
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
                        className="w-full min-h-[44px] bg-transparent pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field with Focused Perimeter Border Animation */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="field-border-wrapper">
                    <div className="field-border-glow" />
                    <div className="field-border-runner" />

                    <div className="field-inner relative z-10 flex items-center w-full rounded-[calc(0.75rem-1.5px)] bg-white dark:bg-slate-900 transition-colors shadow-sm">
                      <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="At least 6 characters"
                        className="w-full min-h-[44px] bg-transparent pr-12 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 px-3.5 flex items-center justify-center min-h-[44px] min-w-[44px] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Field with Focused Perimeter Border Animation */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="field-border-wrapper">
                    <div className="field-border-glow" />
                    <div className="field-border-runner" />

                    <div className="field-inner relative z-10 flex items-center w-full rounded-[calc(0.75rem-1.5px)] bg-white dark:bg-slate-900 transition-colors shadow-sm">
                      <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-slate-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Re-enter password"
                        className="w-full min-h-[44px] bg-transparent pr-12 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 px-3.5 flex items-center justify-center min-h-[44px] min-w-[44px] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full min-h-[44px] mt-2 rounded-xl text-white text-sm font-semibold flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer active:scale-[0.985]"
                >
                  {/* Ambient backdrop glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-xl blur-sm opacity-40 group-hover:opacity-85 group-hover:blur-md transition-all duration-300 pointer-events-none" />

                  {/* Button surface */}
                  <div className="relative w-full h-full min-h-[44px] py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center gap-2 overflow-hidden shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-600/50 transition-shadow">
                    {/* Specular top highlight */}
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                    {/* Animated luminous shimmer beam */}
                    <div className="btn-shimmer-sweep pointer-events-none" />

                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                    ) : (
                      <>
                        <span className="relative z-10 font-semibold tracking-wide">Create Account</span>
                        <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                    Sign in
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
