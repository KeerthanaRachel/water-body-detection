import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-6 shadow-xl">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
      </div>
      <span className="text-xs font-mono font-semibold tracking-widest text-brand-400 uppercase">
        404 — Coordinates Uncharted
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-400 max-w-md mt-3 leading-relaxed">
        The satellite path you requested does not exist or has been shifted in orbit.
      </p>
      <div className="mt-8 flex items-center space-x-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition shadow-lg shadow-brand-500/20"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
        >
          <span>Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
