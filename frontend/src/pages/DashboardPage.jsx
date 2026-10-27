import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Waves, 
  UploadCloud, 
  History, 
  BarChart2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Percent,
  ExternalLink
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.dashboard.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-brand-400">{user?.name || 'Researcher'}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Satellite water body monitoring dashboard and deep semantic segmentation overview.
          </p>
        </div>
        <div>
          <Link
            to="/analyze"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 shadow-lg shadow-brand-500/20 transition transform active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Analyze New Image</span>
          </Link>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="text-xs bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1 rounded-lg text-white font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Analyses */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Predictions</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {loading ? '...' : (stats?.total_predictions ?? 0)}
          </div>
          <p className="text-[11px] text-slate-400">Completed satellite inferences</p>
        </div>

        {/* Average Water Coverage */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Water Coverage</span>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-brand-300 font-mono">
            {loading ? '...' : `${stats?.avg_water_percentage?.toFixed(2) ?? '0.00'}%`}
          </div>
          <p className="text-[11px] text-slate-400">Calculated from binary masks ($\tau=0.5$)</p>
        </div>

        {/* Model Engine Status */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Inference Engine</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-400 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>U-Net 128×128</span>
          </div>
          <p className="text-[11px] text-slate-400">TensorFlow / Keras model loaded</p>
        </div>

        {/* Latest Activity */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Latest Activity</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-200 truncate">
            {loading ? '...' : (stats?.latest_prediction ? new Date(stats.latest_prediction.created_at).toLocaleDateString() : 'No analyses yet')}
          </div>
          <p className="text-[11px] text-slate-400">
            {stats?.latest_prediction ? `${stats.latest_prediction.original_filename}` : 'Upload your first tile'}
          </p>
        </div>
      </div>

      {/* Recent Predictions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Satellite Analyses</h2>
            <p className="text-xs text-slate-400">Your latest processed imagery and segmentation records</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Loading recent predictions...
          </div>
        ) : stats?.recent_predictions?.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Waves className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No predictions recorded yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload a satellite image to see real-time U-Net water body segmentation in action.
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-lg transition"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Start First Analysis</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.recent_predictions?.map((item) => (
              <Link
                key={item.id}
                to={`/results/${item.id}`}
                className="group p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-brand-500/50 transition flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="truncate pr-2">
                    <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-brand-400 transition">
                      {item.original_filename}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-950 text-sky-400 border border-sky-800">
                    {item.water_percentage.toFixed(1)}% water
                  </span>
                </div>

                {/* Thumbnail Previews */}
                <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 p-1">
                  <div className="relative aspect-video rounded overflow-hidden bg-slate-950">
                    <img
                      src={item.image_path}
                      alt="Original tile"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 left-1 px-1 text-[9px] bg-slate-950/80 text-slate-300 rounded font-mono">
                      RGB
                    </span>
                  </div>
                  <div className="relative aspect-video rounded overflow-hidden bg-slate-950">
                    <img
                      src={item.mask_path}
                      alt="Water mask"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 right-1 px-1 text-[9px] bg-sky-950/80 text-sky-300 rounded font-mono">
                      Mask
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="font-mono text-[11px]">
                    {item.image_width}×{item.image_height} • {item.processing_time_ms.toFixed(0)}ms
                  </span>
                  <span className="flex items-center space-x-1 text-brand-400 group-hover:translate-x-0.5 transition font-medium">
                    <span>View Result</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
