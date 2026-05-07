import { useState } from 'react';
import { SEASON_PALETTES } from '../utils/seasonColors';
import type { Season } from '../types';

interface BackgroundPreviewProps {
  season: Season;
  uploadedImageSrc?: string;
}

export function BackgroundPreview({ season, uploadedImageSrc }: BackgroundPreviewProps) {
  const palette = SEASON_PALETTES[season];
  if (!palette) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [opacity, setOpacity] = useState(80);
  const activeColor = palette.swatches[activeIndex];

  return (
    <div className="space-y-6">
      <div
        className="relative rounded-2xl overflow-hidden border border-white/[0.06] aspect-video flex items-center justify-center transition-colors duration-700"
        style={{ backgroundColor: activeColor ? hexToRgba(activeColor.hex, opacity / 100) : '#0a0812' }}
      >
        {uploadedImageSrc ? (
          <img src={uploadedImageSrc} alt="Preview" className="max-w-full max-h-full object-contain" />
        ) : (
          <p className="text-white/25 text-xs font-light font-cute tracking-wide">อัปโหลดรูปภาพเพื่อทดสอบพื้นหลัง</p>
        )}
      </div>

      {activeColor && (
        <div className="flex items-center justify-center gap-3">
          <div
            className="w-4 h-4 rounded-full border border-white/[0.08]"
            style={{ backgroundColor: activeColor.hex }}
          />
          <div className="text-center">
            <p className="text-white/60 text-[12px] font-light font-cute">{activeColor.name}</p>
            <p className="text-white/30 text-[11px] font-mono tracking-wider">{activeColor.hex}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {palette.swatches.map((color, index) => (
          <button
            key={color.hex}
            onClick={() => setActiveIndex(index)}
            className={`w-8 h-8 rounded-lg transition-all duration-200 ${
              index === activeIndex ? 'ring-1 ring-white/30 scale-110' : 'ring-0 hover:ring-1 hover:ring-white/12'
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
      </div>

      <div className="pt-2">
        <div className="flex justify-between text-[10px] mb-3">
          <span className="text-white/30 font-light font-cute tracking-[0.15em] uppercase">Opacity</span>
          <span className="text-white/50 font-light font-cute">{opacity}%</span>
        </div>
        <input type="range" min="20" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
      </div>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
