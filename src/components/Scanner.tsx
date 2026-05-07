import { useState, useEffect, useRef, useCallback } from 'react';
import { useCamera } from '../hooks/useCamera';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { extractSkinColor } from '../utils/colorAnalysis';
import type { SkinAnalysisResult } from '../types';

interface ScannerProps {
  onAnalyze: (result: SkinAnalysisResult) => void;
  onManualPick: (image: HTMLImageElement) => void;
  onImageCapture?: (imageSrc: string) => void;
}

const RIGHT_CHEEK = [43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 103, 104, 105, 108, 109, 117, 118, 123, 126, 209];
const LEFT_CHEEK = [273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 332, 333, 334, 337, 338, 346, 347, 352, 355, 429];

export function Scanner({ onAnalyze, onManualPick, onImageCapture }: ScannerProps) {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [faceFound, setFaceFound] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [noFaceTimeout, setNoFaceTimeout] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noFaceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { videoRef, isReady, error: cameraError, startCamera, stopCamera, captureFrame } = useCamera();
  const { landmarks, isLoaded, isDetecting, detectImage, detectVideo } = useFaceDetection();

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
      return () => stopCamera();
    }
  }, [mode, startCamera, stopCamera]);

  useEffect(() => {
    if (mode === 'camera' && isReady && videoRef.current) {
      const runDetection = async () => { await detectVideo(videoRef.current!); };
      runDetection();
    }
  }, [mode, isReady, detectVideo, videoRef]);

  useEffect(() => {
    if (uploadedImage && !isDetecting) { detectImage(uploadedImage); }
  }, [uploadedImage, detectImage, isDetecting]);

  useEffect(() => {
    setFaceFound(landmarks.length > 0);
    if (landmarks.length === 0 && (uploadedImage || isReady)) {
      noFaceTimerRef.current = setTimeout(() => { setNoFaceTimeout(true); }, 3000);
    } else {
      setNoFaceTimeout(false);
      if (noFaceTimerRef.current) clearTimeout(noFaceTimerRef.current);
    }
  }, [landmarks, uploadedImage, isReady]);

  const drawOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, lms: Array<{ x: number; y: number }>) => {
      ctx.fillStyle = 'rgba(249,168,212,0.5)';
      for (const lm of lms) {
        const px = lm.x > 1 ? lm.x : lm.x * width;
        const py = lm.y > 1 ? lm.y : lm.y * height;
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
      if (lms.length > 0) {
        const cheekIndices = [...RIGHT_CHEEK, ...LEFT_CHEEK];
        const cheekPoints = cheekIndices.map((i) => lms[i]).filter(Boolean).map((lm) => ({ x: lm.x > 1 ? lm.x : lm.x * width, y: lm.y > 1 ? lm.y : lm.y * height }));
        if (cheekPoints.length > 0) {
          ctx.strokeStyle = 'rgba(249,168,212,0.6)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          for (const pt of cheekPoints) { minX = Math.min(minX, pt.x); minY = Math.min(minY, pt.y); maxX = Math.max(maxX, pt.x); maxY = Math.max(maxY, pt.y); }
          const padX = (maxX - minX) * 0.3;
          const padY = (maxY - minY) * 0.3;
          ctx.strokeRect(minX - padX, minY - padY, maxX - minX + padX * 2, maxY - minY + padY * 2);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(249,168,212,0.7)';
          ctx.font = '12px Kanit, system-ui, sans-serif';
          ctx.fillText('Sampling...', minX, minY - padY - 8);
        }
      }
    },
    [],
  );

  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (mode === 'camera' && isReady && videoRef.current && overlayCanvasRef.current && landmarks.length > 0) {
      const canvas = overlayCanvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawOverlay(ctx, canvas.width, canvas.height, landmarks);
      }
    }
  }, [landmarks, mode, isReady, videoRef, drawOverlay]);

  const handleAnalyze = useCallback(() => {
    if (analyzing) return;
    setAnalyzing(true);
    if (mode === 'camera' && captureFrame) {
      const frame = captureFrame();
      if (frame && landmarks.length > 0) {
        const ctx = frame.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, frame.width, frame.height);
          const result = extractSkinColor(imageData, landmarks, frame.width, frame.height);
          onAnalyze(result);
          if (onImageCapture) onImageCapture(frame.toDataURL());
        }
      }
    } else if (uploadedImage && landmarks.length > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = uploadedImage.naturalWidth;
      canvas.height = uploadedImage.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(uploadedImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = extractSkinColor(imageData, landmarks, canvas.width, canvas.height);
        onAnalyze(result);
        if (onImageCapture) onImageCapture(uploadedImage.src);
      }
    }
    setAnalyzing(false);
  }, [analyzing, mode, captureFrame, uploadedImage, landmarks, onAnalyze, onImageCapture]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => { setUploadedImage(img); setFaceFound(false); };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-in">
      <button
        onClick={() => { stopCamera(); setUploadedImage(null); setFaceFound(false); }}
        className="mb-6 text-white/35 hover:text-white/60 text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 font-light font-cute"
      >
        ← กลับ
      </button>

      <div className="flex gap-1 p-1 rounded-xl glass mb-6 w-fit mx-auto">
        <button
          onClick={() => { setMode('camera'); setUploadedImage(null); setFaceFound(false); }}
          className={`px-5 py-2 rounded-lg text-[10px] tracking-[0.2em] uppercase transition-all duration-300 font-light font-cute ${mode === 'camera' ? 'bg-white/[0.07] text-white/85' : 'text-white/35 hover:text-white/55'}`}
        >
          Camera
        </button>
        <button
          onClick={() => { setMode('upload'); stopCamera(); setUploadedImage(null); setFaceFound(false); }}
          className={`px-5 py-2 rounded-lg text-[10px] tracking-[0.2em] uppercase transition-all duration-300 font-light font-cute ${mode === 'upload' ? 'bg-white/[0.07] text-white/85' : 'text-white/35 hover:text-white/55'}`}
        >
          Upload
        </button>
      </div>

      {cameraError && (
        <div className="mb-4 p-3 rounded-xl border border-red-500/[0.12] bg-red-500/[0.04] text-red-400/80 text-xs font-light font-cute">{cameraError}</div>
      )}

      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-black/20 aspect-video">
        {mode === 'camera' && (
          <div className="relative w-full h-full">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
            <canvas ref={overlayCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            {!isReady && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-rose/20 border-t-rose/60 animate-spin" />
              </div>
            )}
          </div>
        )}

        {mode === 'upload' && !uploadedImage && (
          <label className="cursor-pointer flex flex-col items-center justify-center gap-4 p-12 text-center h-full">
            <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center">
              <svg className="w-6 h-6 text-white/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-white/50 text-sm font-light font-cute">อัปโหลดรูปภาพ</p>
              <p className="text-white/25 text-xs mt-1 font-light font-cute">JPG, PNG</p>
            </div>
            <input type="file" accept="image/jpeg,image/png" onChange={handleUpload} className="hidden" />
          </label>
        )}

        {mode === 'upload' && uploadedImage && (
          <div className="relative w-full h-full">
            <img src={uploadedImage.src} alt="Uploaded" className="w-full h-full object-contain" />
            {landmarks.length > 0 && <LandmarkOverlay landmarks={landmarks} width={uploadedImage.naturalWidth} height={uploadedImage.naturalHeight} />}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {noFaceTimeout && !faceFound && (
        <div className="mt-6 p-4 rounded-xl border border-amber-500/[0.12] bg-amber-500/[0.04]">
          <p className="text-amber-400/70 text-xs mb-3 font-light font-cute">ไม่พบใบหน้าในภาพ กรุณาเลือกจุดสีผิวด้วยตนเอง</p>
          <button onClick={() => { if (uploadedImage) onManualPick(uploadedImage); }} className="px-4 py-2 rounded-lg border border-amber-500/[0.15] text-amber-400/70 text-xs hover:bg-amber-500/[0.05] transition-colors duration-200 font-light font-cute">
            เปิด Color Picker
          </button>
        </div>
      )}

      <div className="mt-5 flex items-center justify-center gap-2 h-5">
        {faceFound && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose animate-pulse" />
            <p className="text-rose/65 text-[11px] font-cute tracking-wide">พบใบหน้า — พร้อมวิเคราะห์</p>
          </div>
        )}
        {isDetecting && !faceFound && (
          <p className="text-white/30 text-[11px] font-cute tracking-wide">กำลังตรวจจับใบหน้า...</p>
        )}
        {!faceFound && !isDetecting && mode === 'upload' && !noFaceTimeout && (
          <p className="text-white/30 text-[11px] font-cute tracking-wide">กำลังประมวลผล...</p>
        )}
      </div>

      {faceFound && (
        <div className="mt-6 text-center">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="group inline-flex items-center gap-2 px-9 py-3.5 rounded-full bg-gradient-to-r from-rose/15 via-primary/15 to-sky/15 border border-white/[0.1] text-white/90 text-[13px] font-light font-cute tracking-wide hover:border-rose/30 hover:text-white transition-all duration-500 disabled:opacity-30 hover:shadow-[0_0_50px_rgba(249,168,212,0.08)]"
          >
            {analyzing ? 'กำลังวิเคราะห์...' : 'วิเคราะห์โทนสีผิว'}
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function LandmarkOverlay({ landmarks, width, height }: { landmarks: Array<{ x: number; y: number }>; width: number; height: number }) {
  const cheekIndices = [...RIGHT_CHEEK, ...LEFT_CHEEK];
  const cheekPoints = cheekIndices.map((i) => landmarks[i]).filter(Boolean);
  if (cheekPoints.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const lm of cheekPoints) {
    const px = lm.x > 1 ? lm.x : lm.x * width;
    const py = lm.y > 1 ? lm.y : lm.y * height;
    minX = Math.min(minX, px); minY = Math.min(minY, py); maxX = Math.max(maxX, px); maxY = Math.max(maxY, py);
  }
  const padX = (maxX - minX) * 0.3;
  const padY = (maxY - minY) * 0.3;

  return (
    <div className="absolute inset-0">
      <div
        className="absolute border border-rose/50 rounded-lg"
        style={{ left: `${((minX - padX) / width) * 100}%`, top: `${((minY - padY) / height) * 100}%`, width: `${((maxX - minX + padX * 2) / width) * 100}%`, height: `${((maxY - minY + padY * 2) / height) * 100}%` }}
      >
        <div className="absolute -top-5 left-0 text-rose/60 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap font-light font-cute">
          Sampling skin tone
        </div>
      </div>
    </div>
  );
}
