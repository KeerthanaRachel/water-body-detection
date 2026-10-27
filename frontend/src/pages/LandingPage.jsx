import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Waves, 
  Satellite, 
  Cpu, 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  FileCheck2,
  Sparkles,
  Zap,
  Globe2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-24 py-10">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        {/* Glow backdrop */}
        <div className="absolute inset-x-0 -top-20 -z-10 flex justify-center overflow-hidden pointer-events-none">
          <div className="w-[60rem] h-[30rem] bg-gradient-to-tr from-brand-600/20 via-sky-500/20 to-transparent blur-3xl rounded-full" />
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Deep Learning Remote Sensing • Small U-Net Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          High-Precision <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">Water-Body Detection</span> from Satellite Imagery
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An end-to-end full-stack platform deploying deep semantic segmentation to detect, map, and measure water resources with pixel-level mathematical accuracy.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 shadow-xl shadow-brand-500/25 transition transform active:scale-95"
          >
            <span>Launch Satellite Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-base font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            <span>Sign In to Dashboard</span>
          </Link>
        </div>

        {/* Live Architecture Visual */}
        <div className="mt-16 max-w-4xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
              <div className="flex items-center space-x-2 text-brand-400 font-semibold text-sm">
                <Satellite className="w-4 h-4" />
                <span>1. Optical Sensor Ingestion</span>
              </div>
              <p className="text-xs text-slate-400">
                Accepts multi-spectral RGB satellite tiles (PNG, JPEG). Standardizes input resolution to 128×128 with [0, 1] normalization.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
              <div className="flex items-center space-x-2 text-sky-400 font-semibold text-sm">
                <Layers className="w-4 h-4" />
                <span>2. Small U-Net Segmentation</span>
              </div>
              <p className="text-xs text-slate-400">
                Encoder extracts spatial hierarchy; decoder reconstructs fine shoreline boundaries via skip-connections and sigmoid activations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
                <BarChart3 className="w-4 h-4" />
                <span>3. Quantified Water Mask</span>
              </div>
              <p className="text-xs text-slate-400">
                Applies exact 0.5 decision threshold to compute precise surface water coverage percentage without fabricated spatial estimates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Learning Technical Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Designed for Remote Sensing & Environmental Science
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Surface water monitoring is vital for flood detection, reservoir capacity tracking, and ecological preservation. AquaSat AI combines computer vision rigor with production cloud architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-brand-500/50 transition">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Lightweight U-Net</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optimized 4-stage convolutional autoencoder with double conv blocks, batch normalization, max pooling, and transpose convolutions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-brand-500/50 transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Real Model Checkpoint</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trained on satellite water body masks using Dice & Binary Cross-Entropy loss functions. True inference results, zero mock data.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-brand-500/50 transition">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Sub-Second Latency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Async Python FastAPI prediction pipeline preloads TensorFlow weights in memory for near-instant inference responses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-brand-500/50 transition">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Full-Stack Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Session-based HTTP-only cookies, strictly enforced ownership policies, bcrypt password hashing, and ACID PostgreSQL storage.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to analyze satellite imagery with deep learning?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Create an account or sign in to test the actual U-Net model with satellite images, download binary water masks, and track historical telemetry.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 transition shadow-lg shadow-brand-600/30"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
