import { useState, useRef, useCallback, useEffect } from 'react';
import { SEASON_PALETTES } from '../utils/seasonColors';
import { detectFace } from '../utils/faceDetection';
import type { ColorSwatch, Season } from '../types';

interface ColorTryOnProps {
  skinToneHex: string;
  paletteColors: ColorSwatch[];
  uploadedImageSrc?: string;
  season: Season;
}

type PlacementMode = 'lipstick' | 'blush' | 'eyeshadow' | 'foundation' | 'clothing';

// MediaPipe landmark indices
const LIP_FULL = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 0, 267, 269, 270, 409, 291, 375, 325];
const LEFT_CHEEK = [43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 103, 104, 105, 108, 109, 117, 118, 123, 126, 209];
const RIGHT_CHEEK = [273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 332, 333, 334, 337, 338, 346, 347, 352, 355, 429];
const LEFT_EYE_FULL = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
const RIGHT_EYE_FULL = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
// Upper eyelid landmarks (for eyeshadow on lid)
const LEFT_UPPER_LID = [249, 390, 373, 374, 380, 381, 382, 263];
const RIGHT_UPPER_LID = [163, 144, 145, 153, 154, 155, 133, 33];
const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
const CHIN_BOTTOM = [152, 148, 176, 149, 150, 136, 172];

const modeBlendMode: Record<PlacementMode, string> = {
  lipstick: 'multiply',
  blush: 'multiply',
  eyeshadow: 'soft-light',
  foundation: 'soft-light',
  clothing: 'soft-light',
};

const modeOpacity: Record<PlacementMode, number> = {
  lipstick: 65,
  blush: 30,
  eyeshadow: 45,
  foundation: 20,
  clothing: 45,
};

export function ColorTryOn({ uploadedImageSrc, season }: ColorTryOnProps) {
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<PlacementMode>('lipstick');
  const [selectedColor, setSelectedColor] = useState<ColorSwatch | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState<number | null>(null);
  const [landmarks, setLandmarks] = useState<Array<{ x: number; y: number }>>([]);
  const [detecting, setDetecting] = useState(false);
  const [dragOffsets, setDragOffsets] = useState<Record<PlacementMode, { dx: number; dy: number }>>({
    lipstick: { dx: 0, dy: 0 },
    blush: { dx: 0, dy: 0 },
    eyeshadow: { dx: 0, dy: 0 },
    foundation: { dx: 0, dy: 0 },
    clothing: { dx: 0, dy: 0 },
  });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const offsetStartRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const imageSrc = localImage || uploadedImageSrc || null;
  const hasFace = landmarks.length > 0;
  const effectiveOpacity = overlayOpacity ?? modeOpacity[activeMode];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLocalImage(event.target?.result as string);
      setSelectedColor(null);
      setLandmarks([]);
      setDragOffsets((prev) => ({ ...prev, [activeMode]: { dx: 0, dy: 0 } }));
    };
    reader.readAsDataURL(file);
  };

  // ─── Detect face when image changes ───
  useEffect(() => {
    if (!imageSrc) {
      setLandmarks([]);
      setDragOffsets((prev) => ({ ...prev, [activeMode]: { dx: 0, dy: 0 } }));
      return;
    }
    const img = new Image();
    img.onload = async () => {
      setDetecting(true);
      try {
        const lms = await detectFace(img);
        setLandmarks(lms);
        setDragOffsets((prev) => ({ ...prev, [activeMode]: { dx: 0, dy: 0 } }));
      } catch {
        setLandmarks([]);
        setDragOffsets((prev) => ({ ...prev, [activeMode]: { dx: 0, dy: 0 } }));
      } finally {
        setDetecting(false);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const palette = SEASON_PALETTES[season];
  const makeupColors = palette?.makeup || [];
  const fashionColors = palette?.fashion;

  const modeColors: ColorSwatch[] = (() => {
    switch (activeMode) {
      case 'lipstick':
        return makeupColors.find((m) => m.category === 'lipstick')?.colors || [];
      case 'blush':
        return makeupColors.find((m) => m.category === 'blush')?.colors || [];
      case 'eyeshadow':
        return makeupColors.find((m) => m.category === 'eyeshadow')?.colors || [];
      case 'foundation':
        return makeupColors.find((m) => m.category === 'foundation')?.colors || [];
      case 'clothing':
        return [...(fashionColors?.best || []), ...(fashionColors?.accents || []), ...(fashionColors?.neutrals || [])];
    }
  })();

  const modeButtons = [
    { key: 'lipstick' as PlacementMode, label: 'ลิปสติก', icon: '💄' },
    { key: 'blush' as PlacementMode, label: 'บลัชออน', icon: '🌸' },
    { key: 'eyeshadow' as PlacementMode, label: 'อายแชโดว์', icon: '👁️' },
    { key: 'foundation' as PlacementMode, label: 'รองพื้น', icon: '✨' },
    { key: 'clothing' as PlacementMode, label: 'เสื้อผ้า', icon: '👗' },
  ];

  const handleModeChange = (mode: PlacementMode) => {
    setActiveMode(mode);
    setOverlayOpacity(null);
    setDragOffsets((prev) => ({ ...prev, [mode]: { dx: 0, dy: 0 } }));
  };

  // ─── Drag to adjust overlay position ───
  const toViewBoxCoords = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!hasFace || !selectedColor) return;
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pt = toViewBoxCoords(e.clientX, e.clientY);
    dragStartRef.current = { x: pt.x, y: pt.y };
    offsetStartRef.current = { ...dragOffsets[activeMode] };
  }, [hasFace, selectedColor, toViewBoxCoords, activeMode, dragOffsets]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const pt = toViewBoxCoords(e.clientX, e.clientY);
    const dx = offsetStartRef.current.dx + (pt.x - dragStartRef.current.x);
    const dy = offsetStartRef.current.dy + (pt.y - dragStartRef.current.y);
    setDragOffsets((prev) => ({ ...prev, [activeMode]: { dx, dy } }));
  }, [toViewBoxCoords, activeMode]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // ─── Build SVG polygon points from landmarks ───
  const pts = (indices: number[]) =>
    indices
      .map((i) => landmarks[i])
      .filter(Boolean)
      .map((p) => `${p!.x * 100}%,${p!.y * 100}%`)
      .join(' ');

  // ─── Color overlay SVG ───
  function renderColorOverlay() {
    if (!hasFace || !selectedColor) return null;

    return (
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {activeMode === 'lipstick' && (
          <g opacity={effectiveOpacity / 100} transform={`translate(${dragOffsets.lipstick.dx}, ${dragOffsets.lipstick.dy})`}>
            <polygon
              points={LIP_FULL.map((i) => landmarks[i]).filter(Boolean).map((p) => `${p!.x * 100},${p!.y * 100}`).join(' ')}
              fill={selectedColor.hex}
              style={{ mixBlendMode: 'multiply' }}
            />
            {/* Inner lip for depth */}
            <polygon
              points={LIP_FULL.slice(0, 14).map((i) => landmarks[i]).filter(Boolean).map((p) => `${p!.x * 100},${p!.y * 100}`).join(' ')}
              fill={selectedColor.hex}
              opacity="0.6"
              style={{ mixBlendMode: 'color' }}
            />
          </g>
        )}

        {activeMode === 'blush' && (() => {
          const leftCheekPts = LEFT_CHEEK.map((i) => landmarks[i]).filter(Boolean);
          const rightCheekPts = RIGHT_CHEEK.map((i) => landmarks[i]).filter(Boolean);
          if (leftCheekPts.length === 0 && rightCheekPts.length === 0) return null;

          const calcCenter = (pts: typeof leftCheekPts) => ({
            x: pts.reduce((s, p) => s + p!.x, 0) / pts.length,
            y: pts.reduce((s, p) => s + p!.y, 0) / pts.length,
          });
          const calcRadius = (pts: typeof leftCheekPts, center: { x: number; y: number }) => {
            const maxDist = Math.max(...pts.map((p) => Math.sqrt((p!.x - center.x) ** 2 + (p!.y - center.y) ** 2)));
            return maxDist * 0.5;
          };

          return (
            <g opacity={effectiveOpacity / 100} transform={`translate(${dragOffsets.blush.dx}, ${dragOffsets.blush.dy})`}>
              {leftCheekPts.length > 0 && (() => {
                const center = calcCenter(leftCheekPts);
                const r = calcRadius(leftCheekPts, center);
                return (
                  <ellipse
                    cx={`${center.x * 100}%`}
                    cy={`${center.y * 100}%`}
                    rx={`${r * 100}%`}
                    ry={`${r * 80}%`}
                    fill={selectedColor.hex}
                    style={{ mixBlendMode: 'multiply' }}
                  />
                );
              })()}
              {rightCheekPts.length > 0 && (() => {
                const center = calcCenter(rightCheekPts);
                const r = calcRadius(rightCheekPts, center);
                return (
                  <ellipse
                    cx={`${center.x * 100}%`}
                    cy={`${center.y * 100}%`}
                    rx={`${r * 100}%`}
                    ry={`${r * 80}%`}
                    fill={selectedColor.hex}
                    style={{ mixBlendMode: 'multiply' }}
                  />
                );
              })()}
            </g>
          );
        })()}

        {activeMode === 'eyeshadow' && (
          <g opacity={effectiveOpacity / 100} transform={`translate(${dragOffsets.eyeshadow.dx}, ${dragOffsets.eyeshadow.dy})`}>
            <polygon
              points={LEFT_UPPER_LID.map((i) => landmarks[i]).filter(Boolean).map((p) => `${p!.x * 100},${p!.y * 100}`).join(' ')}
              fill={selectedColor.hex}
              style={{ mixBlendMode: 'soft-light' }}
            />
            <polygon
              points={RIGHT_UPPER_LID.map((i) => landmarks[i]).filter(Boolean).map((p) => `${p!.x * 100},${p!.y * 100}`).join(' ')}
              fill={selectedColor.hex}
              style={{ mixBlendMode: 'soft-light' }}
            />
          </g>
        )}

        {activeMode === 'foundation' && (
          <g opacity={effectiveOpacity / 100} transform={`translate(${dragOffsets.foundation.dx}, ${dragOffsets.foundation.dy})`}>
            <polygon
              points={FACE_OVAL.map((i) => landmarks[i]).filter(Boolean).map((p) => `${p!.x * 100},${p!.y * 100}`).join(' ')}
              fill={selectedColor.hex}
              style={{ mixBlendMode: 'color' }}
            />
          </g>
        )}

        {activeMode === 'clothing' && (
          <g opacity={effectiveOpacity / 100} transform={`translate(${dragOffsets.clothing.dx}, ${dragOffsets.clothing.dy})`}>
            {(() => {
              const chinPts = CHIN_BOTTOM.map((i) => landmarks[i]).filter(Boolean);
              if (chinPts.length === 0) return null;
              const chinCx = chinPts.reduce((s, p) => s + p!.x, 0) / chinPts.length;
              const chinCy = chinPts.reduce((s, p) => s + p!.y, 0) / chinPts.length;

              // Use face oval width for proportion
              const faceLeftX = landmarks[234] ? landmarks[234]!.x : 0.2;
              const faceRightX = landmarks[454] ? landmarks[454]!.x : 0.8;
              const faceWidth = faceRightX - faceLeftX;
              const leftShoulderX = faceLeftX - faceWidth * 0.15;
              const rightShoulderX = faceRightX + faceWidth * 0.15;
              const shoulderY = chinCy + faceWidth * 0.5;
              const bodyBottom = Math.min(chinCy + faceWidth * 1.2, 0.90);
              const leftBodyX = faceLeftX - faceWidth * 0.1;
              const rightBodyX = faceRightX + faceWidth * 0.1;

              const leftNeck = landmarks[172] ? landmarks[172]!.x : chinCx - faceWidth * 0.12;
              const rightNeck = landmarks[58] ? landmarks[58]!.x : chinCx + faceWidth * 0.12;
              const neckTopY = landmarks[172] ? landmarks[172]!.y : chinCy;

              const midNeckY = neckTopY + faceWidth * 0.08;
              const hemBottom = Math.min(bodyBottom + faceWidth * 0.12, 0.95);
              const leftSleeveTipX = leftShoulderX - faceWidth * 0.2;
              const rightSleeveTipX = rightShoulderX + faceWidth * 0.2;
              const sleeveTipY = shoulderY + faceWidth * 0.15;
              const armpitY = shoulderY + faceWidth * 0.3;

              // T-shirt polygon — clockwise, non-intersecting
              const clothingPts = [
                `${leftNeck * 100},${neckTopY * 100}`,
                `${chinCx * 100},${(neckTopY + midNeckY) / 2 * 100}`,
                `${rightNeck * 100},${neckTopY * 100}`,
                `${rightShoulderX * 100},${shoulderY * 100}`,
                `${rightSleeveTipX * 100},${sleeveTipY * 100}`,
                `${rightShoulderX * 100},${armpitY * 100}`,
                `${rightBodyX * 100},${bodyBottom * 100}`,
                `${rightBodyX * 100},${hemBottom * 100}`,
                `${leftBodyX * 100},${hemBottom * 100}`,
                `${leftBodyX * 100},${bodyBottom * 100}`,
                `${leftShoulderX * 100},${armpitY * 100}`,
                `${leftSleeveTipX * 100},${sleeveTipY * 100}`,
                `${leftShoulderX * 100},${shoulderY * 100}`,
              ].join(' ');

              return (
                <polygon
                  points={clothingPts}
                  fill={selectedColor.hex}
                  style={{ mixBlendMode: 'soft-light' }}
                />
              );
            })()}
          </g>
        )}
      </svg>
    );
  }

  // ─── Guide SVG ───
  function renderGuide() {
    if (!hasFace) return null;
    const guidePts = (indices: number[]) =>
      indices
        .map((i) => landmarks[i])
        .filter(Boolean)
        .map((p) => `${p!.x * 100},${p!.y * 100}`)
        .join(' ');

    return (
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {activeMode === 'lipstick' && (
          <g transform={`translate(${dragOffsets.lipstick.dx}, ${dragOffsets.lipstick.dy})`}>
            <polygon points={guidePts(LIP_FULL)} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" strokeDasharray="0.8,0.8" />
          </g>
        )}
        {activeMode === 'blush' && (() => {
          const leftPts = LEFT_CHEEK.map((i) => landmarks[i]).filter(Boolean);
          const rightPts = RIGHT_CHEEK.map((i) => landmarks[i]).filter(Boolean);
          const center = (pts: typeof leftPts) => ({ x: pts.reduce((s, p) => s + p!.x, 0) / pts.length, y: pts.reduce((s, p) => s + p!.y, 0) / pts.length });
          const radius = (pts: typeof leftPts, c: { x: number; y: number }) => Math.max(...pts.map((p) => Math.sqrt((p!.x - c.x) ** 2 + (p!.y - c.y) ** 2))) * 0.5;
          return (
            <g transform={`translate(${dragOffsets.blush.dx}, ${dragOffsets.blush.dy})`}>
              {leftPts.length > 0 && (() => { const c = center(leftPts); const r = radius(leftPts, c); return <ellipse cx={c.x * 100} cy={c.y * 100} rx={r * 100} ry={r * 80} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.3" strokeDasharray="0.8,0.8" />; })()}
              {rightPts.length > 0 && (() => { const c = center(rightPts); const r = radius(rightPts, c); return <ellipse cx={c.x * 100} cy={c.y * 100} rx={r * 100} ry={r * 80} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.3" strokeDasharray="0.8,0.8" />; })()}
            </g>
          );
        })()}
        {activeMode === 'eyeshadow' && (
          <g transform={`translate(${dragOffsets.eyeshadow.dx}, ${dragOffsets.eyeshadow.dy})`}>
            <polygon points={guidePts(LEFT_UPPER_LID)} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.3" strokeDasharray="0.8,0.8" />
            <polygon points={guidePts(RIGHT_UPPER_LID)} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.3" strokeDasharray="0.8,0.8" />
          </g>
        )}
        {activeMode === 'foundation' && (
          <g transform={`translate(${dragOffsets.foundation.dx}, ${dragOffsets.foundation.dy})`}>
            <polygon points={guidePts(FACE_OVAL)} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.3" strokeDasharray="0.8,0.8" />
          </g>
        )}
        {activeMode === 'clothing' && (() => {
          const chinPts2 = CHIN_BOTTOM.map((i) => landmarks[i]).filter(Boolean);
          if (chinPts2.length === 0) return null;
          const chinCx = chinPts2.reduce((s, p) => s + p!.x, 0) / chinPts2.length;
          const chinCy = chinPts2.reduce((s, p) => s + p!.y, 0) / chinPts2.length;
          const faceLeftX = landmarks[234] ? landmarks[234]!.x : 0.2;
          const faceRightX = landmarks[454] ? landmarks[454]!.x : 0.8;
          const faceWidth = faceRightX - faceLeftX;
          const leftShoulderX = faceLeftX - faceWidth * 0.15;
          const rightShoulderX = faceRightX + faceWidth * 0.15;
          const shoulderY = chinCy + faceWidth * 0.5;
          const bodyBottom = Math.min(chinCy + faceWidth * 1.2, 0.90);
          const leftBodyX = faceLeftX - faceWidth * 0.1;
          const rightBodyX = faceRightX + faceWidth * 0.1;
          const leftNeck = landmarks[172] ? landmarks[172]!.x : chinCx - faceWidth * 0.12;
          const rightNeck = landmarks[58] ? landmarks[58]!.x : chinCx + faceWidth * 0.12;
          const neckTopY = landmarks[172] ? landmarks[172]!.y : chinCy;
          const midNeckY = neckTopY + faceWidth * 0.08;
          const hemBottom = Math.min(bodyBottom + faceWidth * 0.12, 0.95);
          const leftSleeveTipX = leftShoulderX - faceWidth * 0.2;
          const rightSleeveTipX = rightShoulderX + faceWidth * 0.2;
          const sleeveTipY = shoulderY + faceWidth * 0.15;
          const armpitY = shoulderY + faceWidth * 0.3;
          const guidePts = [
            `${leftNeck * 100},${neckTopY * 100}`,
            `${chinCx * 100},${(neckTopY + midNeckY) / 2 * 100}`,
            `${rightNeck * 100},${neckTopY * 100}`,
            `${rightShoulderX * 100},${shoulderY * 100}`,
            `${rightSleeveTipX * 100},${sleeveTipY * 100}`,
            `${rightShoulderX * 100},${armpitY * 100}`,
            `${rightBodyX * 100},${bodyBottom * 100}`,
            `${rightBodyX * 100},${hemBottom * 100}`,
            `${leftBodyX * 100},${hemBottom * 100}`,
            `${leftBodyX * 100},${bodyBottom * 100}`,
            `${leftShoulderX * 100},${armpitY * 100}`,
            `${leftSleeveTipX * 100},${sleeveTipY * 100}`,
            `${leftShoulderX * 100},${shoulderY * 100}`,
          ].join(' ');
          return <g transform={`translate(${dragOffsets.clothing.dx}, ${dragOffsets.clothing.dy})`}><polygon points={guidePts} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" strokeDasharray="0.8,0.8" /></g>;
        })()}
      </svg>
    );
  }

  // ─── No image ───
  if (!imageSrc) {
    return (
      <label className="cursor-pointer flex flex-col items-center justify-center gap-5 p-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 group">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <svg className="w-7 h-7 text-rose/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </div>
        <div>
          <p className="text-white/60 text-sm font-light font-cute">อัปโหลดรูปภาพเพื่อเทียบสี</p>
          <p className="text-white/25 text-xs mt-1 font-light font-cute">JPG, PNG — ภาพที่เห็นใบหน้าชัดเจน</p>
        </div>
        <div className="mt-2 px-5 py-2 rounded-full bg-gradient-to-r from-rose/15 via-primary/15 to-sky/15 border border-white/[0.08] text-white/50 text-[11px] font-light font-cute tracking-wide group-hover:from-rose/20 group-hover:via-primary/20 group-hover:to-sky/20 transition-all duration-300">
          เลือกรูปภาพ
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
      </label>
    );
  }

  // ─── Has image ───
  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex gap-1 p-1 rounded-xl glass w-fit mx-auto flex-wrap justify-center">
        {modeButtons.map((mb) => (
          <button
            key={mb.key}
            onClick={() => handleModeChange(mb.key)}
            className={`px-3 py-2 rounded-lg text-[10px] tracking-wider transition-all duration-200 font-light font-cute ${
              activeMode === mb.key ? 'bg-white/[0.07] text-white/85' : 'text-white/30 hover:text-white/50'
            }`}
          >
            <span className="mr-1">{mb.icon}</span> {mb.label}
          </button>
        ))}
      </div>

      {/* Photo preview with SVG overlay */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-black/20"
        style={{ aspectRatio: '3/4', width: '100%', maxWidth: 340, margin: '0 auto' }}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Your photo"
          className="w-full h-full object-contain"
        />

        {/* Face detection loading */}
        {detecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-8 h-8 rounded-full border-2 border-rose/30 border-t-rose/60 animate-spin" />
          </div>
        )}

        {/* Guide overlay (dashed lines) */}
        {renderGuide()}

        {/* Color overlay — same SVG coordinate system as guides */}
        {renderColorOverlay()}

        {/* No face detected */}
        {!hasFace && !detecting && (
          <div className="absolute top-3 left-3 right-3 bg-amber-500/10 backdrop-blur-sm rounded-xl p-3 text-center border border-amber-500/20">
            <p className="text-amber-400/70 text-[11px] font-light font-cute">
              ไม่พบใบหน้า — กรุณาใช้ภาพที่เห็นใบหน้าชัดเจน
            </p>
          </div>
        )}

        {/* Selected color info */}
        {selectedColor && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <span className="text-white/70 text-[10px] font-light font-cute">{selectedColor.name}</span>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
              <span className="text-white/40 text-[9px] font-mono">{effectiveOpacity}%</span>
            </div>
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute top-10 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
        >
          <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
      </div>

      {/* Controls */}
      {selectedColor && (
        <div>
          <div className="flex justify-between text-[10px] mb-2">
            <span className="text-white/30 font-light font-cute tracking-[0.15em] uppercase">ความเข้มสี</span>
            <span className="text-white/50 font-light font-cute">{effectiveOpacity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            value={effectiveOpacity}
            onChange={(e) => setOverlayOpacity(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* Color palette grid */}
      <div>
        <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase text-center mb-4 font-light font-cute">
          {activeMode === 'lipstick' && 'ลิปสติก — เลือกสีเพื่อเทียบอัตโนมัติ'}
          {activeMode === 'blush' && 'บลัชออน — เลือกสีเพื่อเทียบอัตโนมัติ'}
          {activeMode === 'eyeshadow' && 'อายแชโดว์ — เลือกสีเพื่อเทียบอัตโนมัติ'}
          {activeMode === 'foundation' && 'รองพื้น — เลือกสีเพื่อเทียบอัตโนมัติ'}
          {activeMode === 'clothing' && 'เสื้อผ้า — เลือกสีเพื่อเทียบอัตโนมัติ'}
        </p>
        <div className="grid grid-cols-6 gap-2">
          {modeColors.map((color) => (
            <button
              key={color.hex}
              onClick={() => { setSelectedColor(color); setDragOffsets((prev) => ({ ...prev, [activeMode]: { dx: 0, dy: 0 } })); }}
              className={`group/swatch flex flex-col items-center gap-1.5 transition-all duration-200 ${
                selectedColor?.hex === color.hex ? 'scale-110 ring-2 ring-white/40 rounded-xl' : 'hover:scale-105'
              }`}
              title={color.name}
            >
              <div
                className={`w-full aspect-square rounded-xl border transition-all duration-200 ${
                  selectedColor?.hex === color.hex
                    ? 'border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                    : 'border-white/[0.06] group-hover/swatch:border-white/20'
                }`}
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-white/25 text-[9px] font-light font-cute tracking-wide truncate w-full text-center group-hover/swatch:text-white/50 transition-colors">
                {color.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
