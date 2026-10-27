import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ImageCompareSlider from '../components/ImageCompareSlider';
import { 
  Download, 
  ArrowLeft, 
  Clock, 
  Layers, 
  Percent, 
  Maximize2, 
  Cpu, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  Sliders,
  Eye
} from 'lucide-react';

export default function ResultPage() {
  const { id } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side-by-side' | 'overlay'
  const navigate = useNavigate();

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.predictions.get(id);
      setPrediction(data);
    } catch (err) {
      setError(err.message || 'Failed to load prediction result.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMask = () => {
    if (!prediction) return;
    const link = document.createElement('a');
    link.href = prediction.mask_path;
    link.download = `water_mask_${prediction.id.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Retrieving U-Net prediction telemetry...</p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Prediction Record Not Found</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {error || 'The requested prediction could not be found or you do not have permission to access it.'}
        </p>
        <div className="pt-2">
          <Link
            to="/history"
            className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to History</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <Link
            to="/history"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Back to History"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate max-w-md">
              {prediction.original_filename}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Record ID: {prediction.id}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadMask}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Binary Mask</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Water Coverage</span>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">
            {prediction.water_percentage.toFixed(2)}%
          </div>
          <p className="text-[10px] text-slate-500">Calculated from binary mask pixels</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Inference Runtime</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {prediction.processing_time_ms.toFixed(1)} ms
          </div>
          <p className="text-[10px] text-slate-500">Small U-Net forward pass</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Input Resolution</span>
          <div className="text-2xl font-extrabold text-sky-400 font-mono">
            {prediction.image_width} × {prediction.image_height}
          </div>
          <p className="text-[10px] text-slate-500">Resized to 128×128 tensor</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Analysis Timestamp</span>
          <div className="text-sm font-bold text-slate-200 mt-2 truncate">
            {new Date(prediction.created_at).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">UTC persistent record</p>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('slider')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'slider'
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Split Slider</span>
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'side-by-side'
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          Decision Threshold $\tau = 0.5$
        </span>
      </div>

      {/* Visualization Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        {viewMode === 'slider' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 text-center">
              Drag the slider handle horizontally across the tile to compare the optical satellite image and the predicted water mask.
            </p>
            <ImageCompareSlider
              originalSrc={prediction.image_path}
              maskSrc={prediction.mask_path}
              overlaySrc={prediction.overlay_path}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Original Satellite Imagery (RGB)</span>
                <span className="text-[11px] font-mono text-slate-500">{prediction.image_width}×{prediction.image_height}</span>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={prediction.image_path}
                  alt="Original Satellite"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Binary Mask */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300">Predicted Binary Water Mask ($\tau \ge 0.5$)</span>
                <span className="text-[11px] font-mono text-slate-500">128×128 Sigmoid Output</span>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={prediction.mask_path}
                  alt="Water Mask"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Specifications & Explanations */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-brand-400" />
          <span>Scientific & Methodological Validation</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The binary mask denotes segmented water bodies where the model's pixel-wise sigmoid output exceeded the 0.5 classification threshold (255 = water, 0 = land).
          Water coverage is calculated as: (Water Pixels / Total Pixels) &times; 100% = {prediction.water_percentage.toFixed(2)}%.
          In accordance with scientific remote sensing standards, geodetic coordinates or square-kilometre areas are not fabricated for unreferenced optical tiles.
        </p>
      </div>
    </div>
  );
}
