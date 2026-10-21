import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  BarChart2,
  Code2,
  Users,
  Check,
  Star,
  Search,
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (provider: string) => {
    setNotice(`${provider} sign-in is coming soon. Please sign in with your email address.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setNotice('Password reset instructions will be sent if an account with this email exists.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="relative min-h-screen bg-[#F4EFEA] text-[#1E362A] overflow-x-hidden selection:bg-[#98B294]/30 selection:text-[#1E362A]">
      {/* Top Right Decorative Forest Green Shape with Dot Matrix */}
      <div className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 h-48 sm:h-64 pointer-events-none select-none z-0">
        <div className="absolute top-0 right-0 w-full h-full bg-[#2E4D3C] rounded-bl-[120px] sm:rounded-bl-[160px] opacity-95 shadow-md flex items-center justify-center p-8">
          {/* Dot Matrix Pattern */}
          <div className="grid grid-cols-6 gap-3.5 sm:gap-4 ml-12 mb-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#8FA887]/60"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Organic Background Glows */}
      <div className="absolute top-1/4 left-[-100px] w-96 h-96 rounded-full bg-[#98B294]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-[#D27D56]/10 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col min-h-screen justify-between">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between pb-6 sm:pb-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#234233] flex items-center justify-center text-[#A5BEA0] shadow-md shadow-[#234233]/20 transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1E362A]">
                  StackPulse
                </span>
                <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.22em] text-[#234233]/85 uppercase -mt-0.5">
                GitHub Intelligence
              </span>
            </div>
          </Link>

          {/* New here? Get Started button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline text-xs sm:text-sm font-medium text-[#5C6B64]">
              New here?
            </span>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#D27D56] hover:bg-[#BF6E48] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#D27D56]/30 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Content Hero & Login Form Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center my-auto py-4 sm:py-6">
          {/* Left Column: Hero, Features & Interactive Dashboard Preview */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-7 sm:space-y-8 pr-0 lg:pr-4">
            {/* Tagline */}
            <div>
              <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                <span className="w-7 h-[2px] bg-[#D27D56] rounded-full inline-block" />
                <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[#5C6B64]">
                  Developers • Data • Insights
                </span>
              </div>

              {/* Display Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-[#1E362A] leading-[1.08]">
                Understand <br />
                the Developers <br />
                Behind the Code.
              </h1>

              {/* Subtitle */}
              <p className="mt-3.5 sm:mt-4 text-sm sm:text-base text-[#5C6B64] leading-relaxed max-w-lg">
                Explore GitHub profiles, repository insights and compare developer activity to make smarter decisions.
              </p>
            </div>

            {/* 3 Nature-Themed Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
              {/* Feature 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 border border-[#E8E2D9]/80 backdrop-blur-sm shadow-sm transition-transform hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-[#E2EBE0] text-[#234233] flex items-center justify-center shrink-0">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-[#1E362A]">Profile Insights</h2>
                  <p className="text-[11px] text-[#62726B] leading-tight mt-0.5">
                    Get a complete view of any developer
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 border border-[#E8E2D9]/80 backdrop-blur-sm shadow-sm transition-transform hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-[#FAEDE7] text-[#D27D56] flex items-center justify-center shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-[#1E362A]">Repository Metrics</h2>
                  <p className="text-[11px] text-[#62726B] leading-tight mt-0.5">
                    Analyze stars, languages and activity
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 border border-[#E8E2D9]/80 backdrop-blur-sm shadow-sm transition-transform hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-[#E2EBE0] text-[#234233] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-[#1E362A]">Compare Developers</h2>
                  <p className="text-[11px] text-[#62726B] leading-tight mt-0.5">
                    Make data-driven decisions
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Visual Composition: Laptop Mockup, Floating Badges, Books & GitHub Mug */}
            <div className="relative pt-4 sm:pt-6 pb-2">
              {/* Floating Badge 1: Octocat Card */}
              <div className="absolute -top-3 left-4 sm:left-10 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-lg shadow-black/5 border border-[#ECE5DD] flex items-center gap-3 transition-transform hover:-translate-y-1">
                {/* GitHub Logo */}
                <div className="w-8 h-8 rounded-full bg-[#1E362A] flex items-center justify-center text-white">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#1E362A]">octocat</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#62726B] font-medium">
                    <Star className="w-3 h-3 text-[#D27D56] fill-[#D27D56]" />
                    <span>2.4k stars</span>
                  </div>
                </div>
                {/* Mini Bars */}
                <div className="flex items-end gap-1 h-6 pl-1">
                  <span className="w-1 bg-[#D27D56]/40 h-2 rounded-t" />
                  <span className="w-1 bg-[#D27D56]/60 h-4 rounded-t" />
                  <span className="w-1 bg-[#D27D56] h-6 rounded-t" />
                </div>
              </div>

              {/* Floating Badge 2: Top Languages Donut Card */}
              <div className="absolute -top-6 right-2 sm:right-16 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-lg shadow-black/5 border border-[#ECE5DD] hidden sm:flex items-center gap-3.5 transition-transform hover:-translate-y-1">
                {/* Donut SVG */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#FAF7F2" strokeWidth="4.5" />
                    {/* TypeScript 42% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#234233"
                      strokeWidth="4.5"
                      strokeDasharray="36.9 88"
                      strokeDashoffset="0"
                    />
                    {/* JavaScript 28% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#98B294"
                      strokeWidth="4.5"
                      strokeDasharray="24.6 88"
                      strokeDashoffset="-36.9"
                    />
                    {/* Python 18% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#D27D56"
                      strokeWidth="4.5"
                      strokeDasharray="15.8 88"
                      strokeDashoffset="-61.5"
                    />
                    {/* Others 12% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#E5C388"
                      strokeWidth="4.5"
                      strokeDasharray="10.7 88"
                      strokeDashoffset="-77.3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-black text-[#1E362A]">4</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E362A] block mb-1">
                    Top Languages
                  </span>
                  <div className="grid grid-cols-2 gap-x-2.5 gap-y-0.5 text-[9px] text-[#5C6B64]">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#234233]" /> TypeScript <strong className="text-[#1E362A]">42%</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#98B294]" /> JavaScript <strong className="text-[#1E362A]">28%</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D27D56]" /> Python <strong className="text-[#1E362A]">18%</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E5C388]" /> Others <strong className="text-[#1E362A]">12%</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* The Laptop & Desk Workspace Mockup */}
              <div className="relative mx-auto max-w-[500px] mt-6 pt-3">
                {/* Desk Surface Shadow */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4/5 h-6 bg-[#234233]/10 blur-xl rounded-full pointer-events-none" />

                {/* Laptop Unit */}
                <div className="bg-[#1C2430] p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-slate-700/60 relative z-10">
                  {/* Laptop Screen Bezel */}
                  <div className="bg-[#0D121B] rounded-xl overflow-hidden border border-slate-800 text-slate-100 p-2 sm:p-3">
                    {/* Mock Dashboard Topbar */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500/80 inline-block" />
                          <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" />
                        </div>
                        <span className="font-bold text-[#A5BEA0] text-[10px] pl-1">StackPulse</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded text-[9px] text-slate-400 border border-slate-800">
                        <Search className="w-2.5 h-2.5 text-slate-500" />
                        <span>Search GitHub username...</span>
                      </div>
                    </div>

                    {/* Developer Profile Header inside screen */}
                    <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#234233] text-[#A5BEA0] flex items-center justify-center font-bold text-[10px]">
                          OC
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold text-white">octocat</span>
                            <span className="text-[9px] text-emerald-400">✓</span>
                          </div>
                          <span className="text-[8px] text-slate-400 block -mt-0.5">Open source enthusiast</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] text-slate-300">
                        <div className="text-center">
                          <span className="font-bold text-white block">48</span>
                          <span className="text-[8px] text-slate-400">Repos</span>
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-white block">2.4k</span>
                          <span className="text-[8px] text-slate-400">Stars</span>
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-white block">1.8k</span>
                          <span className="text-[8px] text-slate-400">Followers</span>
                        </div>
                      </div>
                    </div>

                    {/* Heatmap Grid preview */}
                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                      <div className="flex items-center justify-between text-[8px] text-slate-400 mb-1">
                        <span className="font-medium text-slate-300">Contribution Activity</span>
                        <span>Last 6 months</span>
                      </div>
                      {/* GitHub Heatmap Grid */}
                      <div className="grid grid-flow-col grid-rows-4 gap-0.5 sm:gap-1">
                        {Array.from({ length: 80 }).map((_, idx) => {
                          const greens = [
                            'bg-slate-800',
                            'bg-[#234233]',
                            'bg-[#2E5E43]',
                            'bg-[#3E805B]',
                            'bg-[#52A374]',
                          ];
                          // pseudo pattern
                          const color = idx % 5 === 0 ? greens[3] : idx % 3 === 0 ? greens[2] : idx % 2 === 0 ? greens[1] : greens[0];
                          return (
                            <span
                              key={idx}
                              className={`w-2 h-2 rounded-[2px] ${color}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Laptop Base Lip */}
                  <div className="h-2 w-20 bg-slate-600/50 mx-auto rounded-b-md mt-1" />
                </div>

                {/* Floating Badge 3: Total Contributions (bottom right) */}
                <div className="absolute -bottom-3 sm:-bottom-4 -right-2 sm:right-2 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-lg shadow-black/5 border border-[#ECE5DD] flex items-center gap-2.5 transition-transform hover:-translate-y-1">
                  <div>
                    <span className="text-[9px] font-bold text-[#62726B] block">Total Contributions</span>
                    <span className="text-xs font-black text-[#1E362A]">312 <span className="text-[10px] font-medium text-[#62726B]">this month</span></span>
                  </div>
                  <div className="flex items-end gap-1 h-5">
                    <span className="w-1 bg-[#D27D56]/30 h-2 rounded-t" />
                    <span className="w-1 bg-[#D27D56]/60 h-3 rounded-t" />
                    <span className="w-1 bg-[#D27D56] h-5 rounded-t" />
                  </div>
                </div>

                {/* Desk Accessories: Clean Code Books and GitHub Mug */}
                <div className="hidden sm:flex items-end justify-between px-6 pt-3 text-[10px] text-[#62726B]">
                  {/* Stacked Books */}
                  <div className="flex flex-col gap-0.5 pl-2">
                    <div className="px-2.5 py-0.5 rounded-sm bg-[#E8DFD3] border border-[#D5C9BA] text-[8px] font-semibold text-[#5A4E3E] shadow-sm">
                      Clean Code
                    </div>
                    <div className="px-3.5 py-0.5 rounded-sm bg-[#234233] text-white text-[8px] font-semibold shadow-sm">
                      GitHub
                    </div>
                    <div className="px-4 py-0.5 rounded-sm bg-[#D27D56] text-white text-[8px] font-semibold shadow-sm">
                      Open Source
                    </div>
                    <div className="px-5 py-0.5 rounded-sm bg-[#E2EBE0] text-[#1E362A] text-[8px] font-semibold border border-[#CAD9C6] shadow-sm">
                      Better Developers
                    </div>
                  </div>

                  {/* GitHub Coffee Mug */}
                  <div className="relative pr-4">
                    <div className="w-9 h-11 bg-white rounded-b-xl rounded-t-sm border border-[#E0D7CC] shadow-md flex items-center justify-center relative">
                      {/* GitHub Octocat logo on mug */}
                      <svg className="w-4 h-4 fill-[#1E362A]" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      {/* Handle */}
                      <span className="absolute -right-2 top-2.5 w-2.5 h-5 rounded-r-lg border-2 border-[#E0D7CC]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Proof Bar */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces"
                  alt="Developer avatar"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces"
                  alt="Developer avatar"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&h=96&fit=crop&crop=faces"
                  alt="Developer avatar"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces"
                  alt="Developer avatar"
                />
              </div>
              <div>
                <span className="text-sm font-black text-[#1E362A] block leading-tight">10K+</span>
                <span className="text-xs text-[#62726B]">Developers exploring with StackPulse</span>
              </div>
            </div>
          </div>

          {/* Right Column: Redesigned Elevated Login Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[420px] bg-white rounded-[32px] p-7 sm:p-9 shadow-[0_20px_50px_rgba(35,66,51,0.08)] border border-[#ECE5DC] relative">
              {/* Header Icon */}
              <div className="text-center mb-6">
                <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2D553E] to-[#1E3A2B] text-[#A5BEA0] shadow-md shadow-[#234233]/25 items-center justify-center mb-3.5">
                  <Activity className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#1E362A]">
                  Welcome back
                </h2>
                <p className="text-xs sm:text-sm text-[#62726B] mt-1">
                  Sign in to explore GitHub developer insights
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Notification Message */}
              {notice && (
                <div className="mb-5 p-3 rounded-xl bg-[#FAEDE7] border border-[#F3C4BA] flex items-start gap-2.5 text-[#A63C29] text-xs">
                  <AlertCircle className="w-4 h-4 text-[#D27D56] shrink-0 mt-0.5" />
                  <span>{notice}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C6B64] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A9992]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="developer@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD6] text-[#1E362A] placeholder-[#9CA9A2] text-sm focus:outline-none focus:border-[#234233] focus:ring-2 focus:ring-[#234233]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C6B64] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A9992]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD6] text-[#1E362A] placeholder-[#9CA9A2] text-sm focus:outline-none focus:border-[#234233] focus:ring-2 focus:ring-[#234233]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A9992] hover:text-[#1E362A] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        rememberMe
                          ? 'bg-[#234233] border-[#234233] text-white'
                          : 'bg-[#FAF7F2] border-[#D5CDBD]'
                      }`}
                    >
                      {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs text-[#5C6B64]">Keep me signed in</span>
                  </label>

                  <a
                    href="#forgot"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-[#D27D56] hover:text-[#BF6E48] transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-[#234233] hover:bg-[#1A3326] active:scale-[0.99] text-white text-sm font-bold shadow-lg shadow-[#234233]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8E2D9]" />
                </div>
                <span className="relative px-3 bg-white text-[10px] font-bold uppercase tracking-wider text-[#8A9992]">
                  Or continue with
                </span>
              </div>

              {/* Social Login Buttons (Side by Side) */}
              <div className="grid grid-cols-2 gap-3">
                {/* GitHub */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('GitHub')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#E8E2D9] text-xs font-semibold text-[#1E362A] flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span className="truncate">GitHub</span>
                </button>

                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('Google')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#E8E2D9] text-xs font-semibold text-[#1E362A] flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="truncate">Google</span>
                </button>
              </div>

              {/* Bottom Register Link */}
              <div className="mt-6 pt-5 border-t border-[#ECE5DD] text-center">
                <p className="text-xs text-[#62726B]">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-[#D27D56] hover:text-[#BF6E48] hover:underline transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Subtle) */}
        <footer className="py-4 text-center text-xs text-[#8A9992]">
          <span>© {new Date().getFullYear()} StackPulse. GitHub Developer Intelligence.</span>
        </footer>
      </div>
    </div>
  );
};
