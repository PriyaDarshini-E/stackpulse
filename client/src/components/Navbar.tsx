import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  Activity, 
  Search, 
  GitCompare, 
  Bookmark, 
  FolderHeart, 
  LogOut, 
  Menu, 
  X,
  Zap
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Search },
    { name: 'Compare', path: '/compare', icon: GitCompare },
    { name: 'Pins', path: '/pins', icon: Bookmark },
    { name: 'Saved Comparisons', path: '/comparisons', icon: FolderHeart },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#070A12]/80 border-b border-slate-200/90 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo with animated glow */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
                  Stack<span className="bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">Pulse</span>
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400/90 -mt-0.5">
                GitHub Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      active
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User actions / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 shadow-sm hover:border-indigo-500/40 transition-all duration-200 group">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white flex items-center justify-center font-bold text-[11px] shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-medium text-slate-200 text-xs max-w-[220px] truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 border border-slate-200 dark:border-slate-800 hover:border-rose-500/30 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : !isAuthPage ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile Right: Menu */}
          <div className="flex md:hidden items-center gap-2">
            {(!isAuthPage || user) && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#0A0E1A]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          {user ? (
            <>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm shadow-indigo-500/25">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="truncate font-medium text-slate-200">{user.email}</span>
              </div>
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : !isAuthPage ? (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30"
              >
                Create Account
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </header>
  );
};
