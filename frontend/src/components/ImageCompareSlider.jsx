import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sliders } from 'lucide-react';

export default function ImageCompareSlider({ originalSrc, maskSrc, overlaySrc, alt = "Comparison" }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Comparison image can be overlay or binary mask
  const targetImage = overlaySrc || maskSrc;

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square max-w-xl mx-auto rounded-2xl overflow-hidden select-none border border-slate-700 shadow-2xl bg-slate-900 group cursor-ew-resize"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* Background (Detected Mask / Overlay) */}
      <img
        src={targetImage}
        alt="Predicted Water Mask"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      <span className="absolute bottom-3 right-3 z-10 px-2.5 py-1 text-xs font-mono font-bold bg-sky-950/80 text-sky-300 rounded border border-sky-600/40 backdrop-blur-sm">
        U-Net Mask
      </span>

      {/* Foreground (Original Satellite Image, clipped to slider position) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={originalSrc}
          alt="Original Satellite"
          className="absolute inset-0 w-full h-full object-contain"
        />
        <span className="absolute bottom-3 left-3 px-2.5 py-1 text-xs font-mono font-bold bg-slate-950/80 text-slate-300 rounded border border-slate-700 backdrop-blur-sm">
          Original RGB
        </span>
      </div>

      {/* Vertical Divider Bar */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(56,189,248,0.8)] pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle circle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">
          <Sliders className="w-4 h-4 rotate-90" />
        </div>
      </div>
    </div>
  );
}
