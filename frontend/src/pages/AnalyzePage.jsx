import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Sparkles, 
  ArrowRight,
  Info,
  X
} from 'lucide-react';

const MAX_FILE_SIZE_MB = 20;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (file) => {
    setError('');
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Unsupported file type (${file.type || 'unknown'}). Please upload a PNG, JPEG, or WebP image.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please upload a smaller image.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Read image dimensions
    const img = new Image();
    img.onload = () => {
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeMb: (file.size / (1024 * 1024)).toFixed(2),
      });
    };
    img.src = objectUrl;
  };

  const handleLoadSample = async (samplePath, filename) => {
    setError('');
    try {
      const response = await fetch(samplePath);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/png' });
      handleFile(file);
    } catch (err) {
      setError('Failed to load sample image.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageMeta(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError('');
    setCurrentStep('Uploading satellite image to inference service...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setTimeout(() => {
        setCurrentStep('Preprocessing RGB tensor (resizing to 128×128 & normalizing)...');
      }, 400);

      setTimeout(() => {
        setCurrentStep('Executing U-Net convolutional contracting & expansive inference...');
      }, 900);

      const result = await api.predictions.analyze(formData);

      setCurrentStep('Segmented mask successfully generated. Loading results...');
      setTimeout(() => {
        navigate(`/results/${result.id}`);
      }, 400);
    } catch (err) {
      setError(err.message || 'Inference failed. Check that the U-Net model service is running.');
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Satellite Image Water Analysis
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload an optical satellite tile. Our trained U-Net neural network will segment surface water bodies and quantify coverage.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!previewUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-brand-400 bg-brand-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Drag and drop your satellite image here
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Supported formats: PNG, JPEG, WebP (Max {MAX_FILE_SIZE_MB}MB)
              </p>
              <button
                type="button"
                className="mt-6 inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
              >
                <span>Browse Files</span>
              </button>

              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <p className="text-xs text-slate-400 mb-3">
                  Or test immediately with a calibrated sample satellite tile:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSample('/samples/sample_lake.png', 'sample_lake.png');
                    }}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-sky-950/80 text-sky-300 border border-sky-800/60 hover:bg-sky-900 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Load Sample Lake Tile</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSample('/samples/sample_river.png', 'sample_river.png');
                    }}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-brand-950/80 text-brand-300 border border-brand-800/60 hover:bg-brand-900 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    <span>Load Sample River Tile</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      {imageMeta ? `${imageMeta.width} × ${imageMeta.height} px • ${imageMeta.sizeMb} MB` : 'Inspecting metadata...'}
                    </p>
                  </div>
                </div>
                {!analyzing && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Remove image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Preview Canvas */}
              <div className="relative aspect-video max-h-[360px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Satellite Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Progress State or Action Button */}
              {analyzing ? (
                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 space-y-3">
                  <div className="flex items-center space-x-3 text-brand-300 text-sm font-medium">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                    <span>{currentStep}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-500 to-sky-400 h-1.5 w-full animate-pulse" />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAnalyze}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition transform active:scale-98"
                >
                  <Cpu className="w-5 h-5" />
                  <span>Analyze Satellite Image</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Technical Guidance Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Info className="w-4 h-4 text-brand-400" />
              <span>Inference Pipeline</span>
            </h3>
            <ul className="text-xs space-y-2.5 text-slate-400 leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="text-brand-400 font-bold">•</span>
                <span>The input image is resized to <strong>128 × 128</strong> pixels and normalized into $[0.0, 1.0]$.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-brand-400 font-bold">•</span>
                <span>The trained U-Net model predicts a continuous pixel-wise probability matrix.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-brand-400 font-bold">•</span>
                <span>A decision threshold of <strong>0.5</strong> isolates water bodies (1 = water, 0 = land).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-brand-400 font-bold">•</span>
                <span>Water coverage percentage is mathematically determined from total segmented pixels.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/80 space-y-2">
            <p className="font-semibold text-amber-300">Remote Sensing Note</p>
            <p className="leading-relaxed">
              Standard consumer satellite RGB tiles do not contain embedded GeoTIFF transform headers. Area calculations represent exact segmented image pixel percentages, adhering to scientific integrity standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
