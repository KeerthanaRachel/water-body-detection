import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  History as HistoryIcon, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  Loader2, 
  UploadCloud, 
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Percent
} from 'lucide-react';

export default function HistoryPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, filename: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.predictions.list();
      setPredictions(data.items || data || []);
    } catch (err) {
      setError(err.message || 'Failed to load prediction history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      await api.predictions.delete(deleteModal.id);
      setPredictions((prev) => prev.filter((item) => item.id !== deleteModal.id));
      setDeleteModal({ open: false, id: null, filename: '' });
    } catch (err) {
      setError(err.message || 'Failed to delete prediction record.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredPredictions = predictions.filter((item) =>
    item.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Prediction History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, inspect, and manage your previous satellite water body segmentations.
          </p>
        </div>
        <Link
          to="/analyze"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 shadow-md shadow-brand-500/20 transition"
        >
          <UploadCloud className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchHistory}
            className="text-xs bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1 rounded-lg text-white font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredPredictions.length} of {predictions.length} records
        </div>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading historical predictions...</p>
        </div>
      ) : filteredPredictions.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
            <HistoryIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">No prediction records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? 'No analyses match your search criteria.' : 'You have not uploaded any satellite tiles yet.'}
          </p>
          {!searchQuery && (
            <Link
              to="/analyze"
              className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Perform First Segmentation</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPredictions.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="truncate pr-2">
                  <h3 className="text-sm font-semibold text-white truncate" title={item.original_filename}>
                    {item.original_filename}
                  </h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800 shrink-0">
                  {item.water_percentage.toFixed(1)}%
                </span>
              </div>

              {/* Side-by-side Thumbnail Preview */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 rounded-xl p-1.5 border border-slate-800">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-900 relative">
                  <img
                    src={item.image_path}
                    alt="RGB Tile"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 left-1 px-1 text-[9px] bg-slate-950/80 text-slate-300 rounded font-mono">
                    RGB
                  </span>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-900 relative">
                  <img
                    src={item.mask_path}
                    alt="Water Mask"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 right-1 px-1 text-[9px] bg-sky-950/80 text-sky-300 rounded font-mono">
                    Mask
                  </span>
                </div>
              </div>

              {/* Metadata & Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {item.image_width}×{item.image_height} • {item.processing_time_ms.toFixed(0)}ms
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setDeleteModal({ open: true, id: item.id, filename: item.original_filename })}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/results/${item.id}`}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Prediction Record?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-200">"{deleteModal.filename}"</strong>? This will permanently remove the record and generated mask images from storage.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModal({ open: false, id: null, filename: '' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 flex items-center space-x-2 transition"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
