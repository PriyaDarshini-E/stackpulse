import React, { useState } from 'react';
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

  const { register } = useAuth();
  const navigate = useNavigate();

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
          {/* Left Column: Brand & Feature Highlights (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center space-y-8 pr-4">
            {/* Logo Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-white font-sans">
                    Stack<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Pulse</span>
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400/90 -mt-0.5">
                  GitHub Developer Intelligence
                </span>
              </div>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.15]">
                Understand the developers{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                  behind the code.
                </span>
              </h1>
              <p className="mt-4 text-slate-300 text-base leading-relaxed max-w-lg">
                Join StackPulse to benchmark developers, analyze repositories, and track key engineering contributors.
              </p>
            </div>

            {/* 3 Feature Highlights */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Search any GitHub developer</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Explore language distribution, top stars, repository breakdowns, and commit activity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Compare side by side</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Benchmark multiple profiles in real-time with automated metric leadership highlights.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Pin and annotate repos</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Keep track of standout projects with custom tags and private engineering notes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Card (Centered on mobile) */}
          <div className="w-full max-w-md mx-auto lg:max-w-none lg:col-span-6 xl:col-span-5">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-xl shadow-indigo-500/20 mb-3">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">Create an account</h1>
              <p className="text-xs text-slate-400 mt-1">Join StackPulse to analyze and compare developer profiles</p>
            </div>

            {/* Glass Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="hidden lg:block mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-white">Create an account</h2>
                <p className="text-xs text-slate-400 mt-1">Join StackPulse to analyze and compare developer profiles</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="developer@example.com"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                      className="w-full min-h-[44px] pl-10 pr-12 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3.5 flex items-center justify-center min-h-[44px] min-w-[44px] text-slate-400 hover:text-white transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                      className="w-full min-h-[44px] pl-10 pr-12 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 px-3.5 flex items-center justify-center min-h-[44px] min-w-[44px] text-slate-400 hover:text-white transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
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
