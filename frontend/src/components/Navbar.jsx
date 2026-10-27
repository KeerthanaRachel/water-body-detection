import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Waves, 
  Satellite, 
  LayoutDashboard, 
  UploadCloud, 
  History, 
  User, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck,
  Radio
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, serverOnline } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition">
              <Waves className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                AquaSat<span className="text-brand-400">.AI</span>
              </span>
              <span className="block text-[10px] tracking-wider text-slate-400 uppercase font-mono">
                Satellite Water-Body Segmentation
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/dashboard')
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/analyze"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/analyze')
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>New Analysis</span>
                </Link>

                <Link
                  to="/history"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/history')
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </Link>

                <Link
                  to="/profile"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/profile')
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                <Radio className={`w-3.5 h-3.5 ${serverOnline ? 'text-emerald-400 animate-ping' : 'text-red-400'}`} />
                <span>{serverOnline ? 'Inference Engine Ready' : 'Backend Connecting...'}</span>
              </div>
            )}
          </div>

          {/* User actions / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-200">{user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 rounded-lg shadow-md shadow-brand-500/20 transition transform active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <div className="px-3 py-2 mb-2 bg-slate-800/50 rounded-lg">
                <div className="text-sm font-medium text-slate-200">{user.name}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/analyze"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                <UploadCloud className="w-4 h-4" />
                <span>New Analysis</span>
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
