import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Waves, Mail, Lock, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@satellite-lab.org');
    setPassword('DemoPassword123!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/20 mb-4">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Sign in to AquaSat AI
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Enter your credentials to access your satellite analysis history
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@satellite-lab.org"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 transition shadow-lg shadow-brand-500/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center space-x-1.5 text-xs text-brand-400/80 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-lg border border-brand-500/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Account Credentials</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
