import { useState, useRef, useCallback } from 'react';
import { rgbToHex, rgbToHsl } from '../utils/colorAnalysis';
import type { RGB, SkinAnalysisResult } from '../types';

interface ColorPickerProps {
  image: HTMLImageElement;
  onConfirm: (result: SkinAnalysisResult) => void;
  onBack: () => void;
}

export function ColorPicker({ image, onConfirm, onBack }: ColorPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const magnifierRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [colorAtCursor, setColorAtCursor] = useState<RGB | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = Math.round((e.clientX - rect.left) * scaleX);
      const y = Math.round((e.clientY - rect.top) * scaleY);

      setCursorPos({ x, y });

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        setColorAtCursor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      }

      if (magnifierRef.current) {
        magnifierRef.current.style.left = `${e.clientX - rect.left}px`;
        magnifierRef.current.style.top = `${e.clientY - rect.top}px`;
      }
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (!colorAtCursor) return;

    const { r, g, b } = colorAtCursor;
    const hsl = rgbToHsl(r, g, b);
    const undertone = r > b ? 'warm' : 'cool';
    const value = hsl.l > 65 ? 'light' : hsl.l > 45 ? 'medium' : 'deep';
    const chroma = hsl.s > 45 ? 'bright' : hsl.s > 30 ? 'soft' : 'muted';

    const result: SkinAnalysisResult = {
      averageRGB: { r, g, b },
      averageHSL: hsl,
      undertone,
      value,
      chroma,
      skinToneHex: rgbToHex(r, g, b),
    };

    onConfirm(result);
  }, [colorAtCursor, onConfirm]);

  return (
    <div className="w-full max-w-xl mx-auto animate-in">
      <button
        onClick={onBack}
        className="mb-6 text-white/35 hover:text-white/60 text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 font-light font-cute"
      >
        ← กลับ
      </button>

      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-black/20">
        <canvas
          ref={canvasRef}
          width={image.naturalWidth}
          height={image.naturalHeight}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setCursorPos(null);
            setColorAtCursor(null);
          }}
        />

        {cursorPos && colorAtCursor && (
          <div
            ref={magnifierRef}
            className="pointer-events-none absolute w-16 h-16 -ml-8 -mt-8 rounded-full border border-white/20 overflow-hidden shadow-lg"
            style={{
              backgroundImage: `url(${image.src})`,
              backgroundSize: `${image.naturalWidth * 3}px ${image.naturalHeight * 3}px`,
              backgroundPosition: `${-cursorPos.x * 3 + 32}px ${-cursorPos.y * 3 + 32}px`,
            }}
          />
        )}
      </div>

      {colorAtCursor && cursorPos && (
        <div className="mt-6 p-5 rounded-2xl glass-strong">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl border border-white/[0.08]"
              style={{ backgroundColor: rgbToHex(colorAtCursor.r, colorAtCursor.g, colorAtCursor.b) }}
            />
            <div>
              <p className="text-white/85 font-mono text-sm tracking-wider">
                {rgbToHex(colorAtCursor.r, colorAtCursor.g, colorAtCursor.b)}
              </p>
              <p className="text-white/35 text-xs font-light font-mono">
                RGB({colorAtCursor.r}, {colorAtCursor.g}, {colorAtCursor.b})
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-rose/15 via-primary/15 to-sky/15 border border-white/[0.1] text-white/85 text-[13px] font-light font-cute tracking-wide hover:border-rose/25 hover:text-white transition-all duration-300"
          >
            ใช้สีนี้เพื่อวิเคราะห์
          </button>
        </div>
      )}

      <p className="mt-4 text-white/25 text-xs text-center font-light font-cute tracking-wide">
        คลิกที่บริเวณแก้มหรือหน้าผากเพื่อเลือกสีผิว
      </p>
    </div>
  );
}
