import React from 'react';
import { Satellite, Shield, Cpu, Database, Code, Globe2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Project overview */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-100 font-semibold">
              <Satellite className="w-5 h-5 text-brand-400" />
              <span>AquaSat AI Platform</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated high-precision water-body segmentation from satellite imagery powered by a custom deep learning U-Net architecture.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              U-Net: 128×128 RGB → Sigmoid → Binary Water Mask
            </div>
          </div>

          {/* Column 2: Deep Learning Specs */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>ML Architecture</span>
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400 font-mono">
              <li>Framework: TensorFlow / Keras</li>
              <li>Input Res: 128 × 128 × 3 RGB</li>
              <li>Activation: Sigmoid ($\tau = 0.5$)</li>
              <li>Metric: Coverage % & IoU / Dice</li>
            </ul>
          </div>

          {/* Column 3: Full Stack Infrastructure */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full-Stack Engine</span>
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>FastAPI Async REST Backend</li>
              <li>PostgreSQL Persistence & Migrations</li>
              <li>HTTP-only Secure Cookie Auth</li>
              <li>Vite + React 18 + Tailwind CSS</li>
            </ul>
          </div>

          {/* Column 4: Ethical & Scientific Standard */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Scientific Rigor</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Water detection calculations strictly measure segmented pixel proportions. No geographic coordinate or real-world square kilometre fabrication without georeferenced metadata.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AquaSat AI — Water-Body Detection from Satellite Images.</p>
          <p className="mt-2 sm:mt-0 font-mono">
            Trained on Satellite Water Bodies Dataset | U-Net Inference v1.0
          </p>
        </div>
      </div>
    </footer>
  );
}
