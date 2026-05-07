import { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Scanner } from './components/Scanner';
import { ColorPicker } from './components/ColorPicker';
import { ResultDashboard } from './components/ResultDashboard';
import { classifySeason, computeConfidence } from './utils/colorAnalysis';
import type { AppState, SkinAnalysisResult, SeasonResult } from './types';

/* ═══════════════════════════════════════
   Flower SVG Decorations
   ═══════════════════════════════════════ */

function FlowerCherry({ className = '' }: { className?: string }) {
  return (
    <svg className={`flower-sway ${className}`} viewBox="0 0 60 60" fill="none">
      <path d="M30 55 C30 45, 28 35, 30 28" stroke="rgba(249,168,212,0.45)" strokeWidth="0.8" />
      <ellipse cx="27" cy="40" rx="3" ry="1.5" fill="rgba(212,247,122,0.25)" transform="rotate(-30, 27, 40)" />
      <ellipse cx="33" cy="36" rx="3" ry="1.5" fill="rgba(212,247,122,0.2)" transform="rotate(25, 33, 36)" />
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse key={i} cx="30" cy="22" rx="4" ry="7" fill="rgba(249,168,212,0.28)" stroke="rgba(249,168,212,0.35)" strokeWidth="0.5" transform={`rotate(${angle}, 30, 28)`} />
      ))}
      <circle cx="30" cy="28" r="2.5" fill="rgba(253,186,116,0.4)" />
      <circle cx="30" cy="28" r="1" fill="rgba(253,186,116,0.6)" />
    </svg>
  );
}

function FlowerSimple({ className = '' }: { className?: string }) {
  return (
    <svg className={`flower-slow ${className}`} viewBox="0 0 50 50" fill="none">
      <path d="M25 48 C25 38, 26 30, 25 22" stroke="rgba(125,211,252,0.35)" strokeWidth="0.8" />
      {[0, 90, 180, 270].map((angle, i) => (
        <ellipse key={i} cx="25" cy="16" rx="3.5" ry="6" fill="rgba(125,211,252,0.22)" stroke="rgba(125,211,252,0.3)" strokeWidth="0.5" transform={`rotate(${angle}, 25, 22)`} />
      ))}
      <circle cx="25" cy="22" r="2" fill="rgba(249,168,212,0.35)" />
    </svg>
  );
}

function FlowerDaisy({ className = '' }: { className?: string }) {
  return (
    <svg className={`flower-sway ${className}`} viewBox="0 0 70 70" fill="none">
      <path d="M35 68 C35 55, 33 42, 35 32" stroke="rgba(212,247,122,0.35)" strokeWidth="0.8" />
      <path d="M33 50 C28 48, 24 52, 26 56" stroke="rgba(212,247,122,0.25)" strokeWidth="0.6" fill="none" />
      <path d="M37 45 C42 43, 46 47, 44 51" stroke="rgba(212,247,122,0.2)" strokeWidth="0.6" fill="none" />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse key={i} cx="35" cy="22" rx="3" ry="8" fill="rgba(249,168,212,0.18)" stroke="rgba(196,164,232,0.3)" strokeWidth="0.5" transform={`rotate(${angle}, 35, 32)`} />
      ))}
      <circle cx="35" cy="32" r="3.5" fill="rgba(253,186,116,0.35)" />
      <circle cx="35" cy="32" r="1.5" fill="rgba(253,186,116,0.55)" />
    </svg>
  );
}

function FlowerBud({ className = '' }: { className?: string }) {
  return (
    <svg className={`flower-slow ${className}`} viewBox="0 0 40 50" fill="none">
      <path d="M20 50 C20 42, 19 35, 20 28" stroke="rgba(196,164,232,0.35)" strokeWidth="0.8" />
      <ellipse cx="17" cy="38" rx="2.5" ry="1.2" fill="rgba(212,247,122,0.22)" transform="rotate(-25, 17, 38)" />
      <ellipse cx="20" cy="24" rx="3" ry="5" fill="rgba(249,168,212,0.22)" stroke="rgba(249,168,212,0.3)" strokeWidth="0.5" />
      <ellipse cx="18" cy="25" rx="2.5" ry="4.5" fill="rgba(249,168,212,0.18)" transform="rotate(-15, 18, 25)" />
      <ellipse cx="22" cy="25" rx="2.5" ry="4.5" fill="rgba(249,168,212,0.14)" transform="rotate(15, 22, 25)" />
      <circle cx="20" cy="20" r="1" fill="rgba(253,186,116,0.5)" />
    </svg>
  );
}

function FlowerPetal({ className = '' }: { className?: string }) {
  return (
    <svg className={`flower-fall ${className}`} viewBox="0 0 30 30" fill="none">
      <ellipse cx="15" cy="15" rx="4" ry="8" fill="rgba(249,168,212,0.2)" stroke="rgba(249,168,212,0.25)" strokeWidth="0.5" transform="rotate(25, 15, 15)" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   Leaf SVG Decorations
   ═══════════════════════════════════════ */

function LeafSmall({ className = '' }: { className?: string }) {
  return (
    <svg className={`leaf-sway ${className}`} viewBox="0 0 40 40" fill="none">
      {/* Leaf shape */}
      <path d="M20 36 C20 36, 8 28, 8 18 C8 8, 20 4, 20 4 C20 4, 32 8, 32 18 C32 28, 20 36, 20 36Z" fill="rgba(212,247,122,0.15)" stroke="rgba(212,247,122,0.25)" strokeWidth="0.6" />
      {/* Vein */}
      <path d="M20 36 L20 8" stroke="rgba(212,247,122,0.2)" strokeWidth="0.4" />
      {/* Side veins */}
      <path d="M20 28 L14 22" stroke="rgba(212,247,122,0.12)" strokeWidth="0.3" />
      <path d="M20 28 L26 22" stroke="rgba(212,247,122,0.12)" strokeWidth="0.3" />
      <path d="M20 22 L15 17" stroke="rgba(212,247,122,0.12)" strokeWidth="0.3" />
      <path d="M20 22 L25 17" stroke="rgba(212,247,122,0.12)" strokeWidth="0.3" />
      {/* Stem */}
      <path d="M20 36 L20 40" stroke="rgba(212,247,122,0.2)" strokeWidth="0.5" />
    </svg>
  );
}

function LeafRound({ className = '' }: { className?: string }) {
  return (
    <svg className={`leaf-slow ${className}`} viewBox="0 0 50 50" fill="none">
      {/* Round leaf */}
      <ellipse cx="25" cy="20" rx="12" ry="16" fill="rgba(212,247,122,0.12)" stroke="rgba(212,247,122,0.2)" strokeWidth="0.5" />
      {/* Vein center */}
      <path d="M25 36 L25 6" stroke="rgba(212,247,122,0.18)" strokeWidth="0.4" />
      {/* Side veins */}
      <path d="M25 30 L17 24" stroke="rgba(212,247,122,0.1)" strokeWidth="0.3" />
      <path d="M25 30 L33 24" stroke="rgba(212,247,122,0.1)" strokeWidth="0.3" />
      <path d="M25 22 L18 16" stroke="rgba(212,247,122,0.1)" strokeWidth="0.3" />
      <path d="M25 22 L32 16" stroke="rgba(212,247,122,0.1)" strokeWidth="0.3" />
      {/* Stem */}
      <path d="M25 36 L25 44" stroke="rgba(212,247,122,0.15)" strokeWidth="0.5" />
    </svg>
  );
}

function LeafLong({ className = '' }: { className?: string }) {
  return (
    <svg className={`leaf-sway ${className}`} viewBox="0 0 30 60" fill="none">
      {/* Long leaf shape */}
      <path d="M15 58 C15 58, 4 45, 4 30 C4 15, 15 2, 15 2 C15 2, 26 15, 26 30 C26 45, 15 58, 15 58Z" fill="rgba(180,230,100,0.1)" stroke="rgba(180,230,100,0.2)" strokeWidth="0.5" />
      {/* Vein */}
      <path d="M15 58 L15 6" stroke="rgba(180,230,100,0.18)" strokeWidth="0.4" />
      {/* Side veins */}
      <path d="M15 48 L9 40" stroke="rgba(180,230,100,0.08)" strokeWidth="0.3" />
      <path d="M15 48 L21 40" stroke="rgba(180,230,100,0.08)" strokeWidth="0.3" />
      <path d="M15 38 L8 30" stroke="rgba(180,230,100,0.08)" strokeWidth="0.3" />
      <path d="M15 38 L22 30" stroke="rgba(180,230,100,0.08)" strokeWidth="0.3" />
      <path d="M15 28 L10 22" stroke="rgba(180,230,100,0.08)" strokeWidth="0.3" />
      <path d="M15 28 L20 22" stroke="rgba(180,230,100,0.08)" strokeWidth="0.3" />
    </svg>
  );
}

function LeafFall({ className = '' }: { className?: string }) {
  return (
    <svg className={`leaf-fall ${className}`} viewBox="0 0 30 30" fill="none">
      <path d="M15 28 C15 28, 5 22, 5 14 C5 6, 15 2, 15 2 C15 2, 25 6, 25 14 C25 22, 15 28, 15 28Z" fill="rgba(212,247,122,0.12)" stroke="rgba(212,247,122,0.18)" strokeWidth="0.4" />
      <path d="M15 28 L15 6" stroke="rgba(212,247,122,0.12)" strokeWidth="0.3" />
    </svg>
  );
}

function LeafCluster({ className = '' }: { className?: string }) {
  return (
    <svg className={`leaf-slow ${className}`} viewBox="0 0 80 60" fill="none">
      {/* Main leaf */}
      <path d="M40 56 C40 56, 22 44, 22 28 C22 12, 40 4, 40 4 C40 4, 58 12, 58 28 C58 44, 40 56, 40 56Z" fill="rgba(212,247,122,0.12)" stroke="rgba(212,247,122,0.2)" strokeWidth="0.5" />
      <path d="M40 56 L40 8" stroke="rgba(212,247,122,0.15)" strokeWidth="0.3" />
      {/* Small leaf left */}
      <path d="M20 50 C20 50, 10 42, 10 34 C10 26, 20 22, 20 22 C20 22, 30 26, 30 34 C30 42, 20 50, 20 50Z" fill="rgba(212,247,122,0.08)" stroke="rgba(212,247,122,0.15)" strokeWidth="0.4" />
      {/* Small leaf right */}
      <path d="M60 46 C60 46, 50 38, 50 30 C50 22, 60 18, 60 18 C60 18, 70 22, 70 30 C70 38, 60 46, 60 46Z" fill="rgba(212,247,122,0.06)" stroke="rgba(212,247,122,0.12)" strokeWidth="0.4" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   Sunlight Effect
   ═══════════════════════════════════════ */

function Sunlight() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sun glow */}
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-radial from-yellow/15 via-orange/8 to-transparent" />
      <div className="absolute -top-10 -right-10 w-[200px] h-[200px] rounded-full bg-yellow/[0.12] blur-[60px]" />

      {/* Sun rays */}
      <div className="absolute top-0 right-[10%] w-[600px] h-[800px] origin-top-right">
        {[0, 15, 30, 45, 60, 75].map((angle, i) => (
          <div
            key={i}
            className="absolute top-0 right-0 w-[2px] h-full origin-top-right sun-ray"
            style={{
              transform: `rotate(${angle}deg)`,
              background: `linear-gradient(180deg, rgba(253,186,116,${0.06 - i * 0.008}) 0%, transparent 80%)`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Warm light wash */}
      <div className="absolute -top-40 right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-radial from-yellow/[0.04] via-orange/[0.02] to-transparent blur-[80px]" />
      <div className="absolute top-[5%] right-[5%] w-[300px] h-[300px] rounded-full bg-gradient-radial from-yellow/[0.06] to-transparent blur-[40px]" />
    </div>
  );
}

/* ═══════════════════════════════════════
   Second Sunlight (bottom-left accent)
   ═══════════════════════════════════════ */

function SunlightAccent() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-radial from-peach/[0.06] via-rose/[0.03] to-transparent blur-[80px]" />
      <div className="absolute bottom-[-10%] left-[15%] w-[300px] h-[300px] rounded-full bg-gradient-radial from-peach/[0.08] to-transparent blur-[50px]" />
    </div>
  );
}

/* ═══════════════════════════════════════
   Main App
   ═══════════════════════════════════════ */

function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<SeasonResult | null>(null);
  const [manualImage, setManualImage] = useState<HTMLImageElement | null>(null);
  const uploadedImageSrcRef = useRef<string>('');

  const handleAnalyze = useCallback((analysis: SkinAnalysisResult) => {
    const { season } = classifySeason(analysis);
    const confidence = computeConfidence(analysis);
    setResult({ season, label: '', description: '', confidence, analysis });
    setAppState('result');
  }, []);

  const handleImageCapture = useCallback((imageSrc: string) => {
    uploadedImageSrcRef.current = imageSrc;
  }, []);

  const handleManualPick = useCallback((image: HTMLImageElement) => {
    setManualImage(image);
    uploadedImageSrcRef.current = image.src;
    setAppState('manual-pick');
  }, []);

  const handleManualConfirm = useCallback(
    (analysis: SkinAnalysisResult) => { handleAnalyze(analysis); },
    [handleAnalyze],
  );

  const handleTryAgain = useCallback(() => {
    setResult(null);
    setManualImage(null);
    uploadedImageSrcRef.current = '';
    setAppState('idle');
  }, []);

  return (
    <div className="min-h-screen bg-surface-dark text-white bg-mesh">
      {/* Animated floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[15%] w-[650px] h-[650px] rounded-full bg-rose/[0.14] blur-[130px] float" />
        <div className="absolute top-[25%] right-[-8%] w-[550px] h-[550px] rounded-full bg-sky/[0.12] blur-[120px] float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[5%] left-[5%] w-[600px] h-[600px] rounded-full bg-peach/[0.12] blur-[130px] float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-[45%] left-[35%] w-[450px] h-[450px] rounded-full bg-lime/[0.08] blur-[110px] float" style={{ animationDelay: '6s' }} />
        <div className="absolute top-[10%] left-[55%] w-[400px] h-[400px] rounded-full bg-primary/[0.12] blur-[100px] float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] rounded-full bg-violet/[0.10] blur-[120px] float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[55%] left-[70%] w-[300px] h-[300px] rounded-full bg-coral/[0.08] blur-[100px] float" style={{ animationDelay: '5s' }} />
        <div className="absolute top-[8%] left-[35%] w-[250px] h-[250px] rounded-full bg-rose/[0.10] blur-[90px] float" style={{ animationDelay: '7s' }} />
        <div className="absolute bottom-[30%] right-[35%] w-[280px] h-[280px] rounded-full bg-sky/[0.09] blur-[95px] float" style={{ animationDelay: '3.5s' }} />
      </div>

      {/* ─── Sunlight Effects ─── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top-right sun */}
        <Sunlight />
        {/* Bottom-left warm accent */}
        <SunlightAccent />
      </div>

      {/* ─── Flower & Leaf Decorations ─── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Flowers */}
        <div className="absolute -top-2 -left-4 w-32 h-32 color-breathe">
          <FlowerCherry className="w-full h-full" />
        </div>
        <div className="absolute top-16 -right-4 w-28 h-28 color-breathe" style={{ animationDelay: '2s' }}>
          <FlowerSimple className="w-full h-full" />
        </div>
        <div className="absolute bottom-20 -left-6 w-36 h-36 color-breathe" style={{ animationDelay: '1s' }}>
          <FlowerDaisy className="w-full h-full" />
        </div>
        <div className="absolute bottom-10 -right-4 w-28 h-28 color-breathe" style={{ animationDelay: '3s' }}>
          <FlowerCherry className="w-full h-full" />
        </div>
        <div className="absolute top-1/2 -left-2 w-20 h-24 color-breathe" style={{ animationDelay: '1.5s' }}>
          <FlowerBud className="w-full h-full" />
        </div>
        <div className="absolute top-1/3 -right-2 w-20 h-20 color-breathe" style={{ animationDelay: '4s' }}>
          <FlowerSimple className="w-full h-full" />
        </div>

        {/* ─── Leaves ─── */}
        {/* Top-left — small leaf */}
        <div className="absolute top-[8%] left-[8%] w-16 h-16 color-breathe" style={{ animationDelay: '1s' }}>
          <LeafSmall className="w-full h-full" />
        </div>
        {/* Top-right — long leaf near sun */}
        <div className="absolute top-[20%] right-[12%] w-12 h-24 color-breathe" style={{ animationDelay: '2.5s' }}>
          <LeafLong className="w-full h-full" />
        </div>
        {/* Mid-left — cluster */}
        <div className="absolute top-[40%] left-[5%] w-24 h-20 color-breathe" style={{ animationDelay: '0.5s' }}>
          <LeafCluster className="w-full h-full" />
        </div>
        {/* Mid-right — round leaf */}
        <div className="absolute top-[50%] right-[8%] w-14 h-14 color-breathe" style={{ animationDelay: '3.5s' }}>
          <LeafRound className="w-full h-full" />
        </div>
        {/* Bottom-left — small leaf */}
        <div className="absolute bottom-[35%] left-[8%] w-14 h-14 color-breathe" style={{ animationDelay: '2s' }}>
          <LeafSmall className="w-full h-full" />
        </div>
        {/* Bottom-right — long leaf */}
        <div className="absolute bottom-[15%] right-[12%] w-10 h-20 color-breathe" style={{ animationDelay: '4s' }}>
          <LeafLong className="w-full h-full" />
        </div>
        {/* Bottom center — cluster */}
        <div className="absolute bottom-[45%] left-[45%] w-20 h-16 color-breathe" style={{ animationDelay: '1.8s' }}>
          <LeafCluster className="w-full h-full" />
        </div>

        {/* Falling petals */}
        <div className="absolute top-[15%] left-[20%] w-6 h-6"><FlowerPetal className="w-full h-full" /></div>
        <div className="absolute top-[35%] right-[25%] w-5 h-5"><FlowerPetal className="w-full h-full" /></div>
        <div className="absolute top-[60%] left-[15%] w-5 h-5"><FlowerPetal className="w-full h-full" /></div>
        <div className="absolute top-[75%] right-[20%] w-4 h-4"><FlowerPetal className="w-full h-full" /></div>
        <div className="absolute top-[45%] left-[70%] w-4 h-4"><FlowerPetal className="w-full h-full" /></div>
        <div className="absolute top-[20%] left-[55%] w-5 h-5"><FlowerPetal className="w-full h-full" /></div>
        <div className="absolute top-[80%] left-[40%] w-4 h-4"><FlowerPetal className="w-full h-full" /></div>

        {/* Falling leaves */}
        <div className="absolute top-[25%] left-[35%] w-5 h-5"><LeafFall className="w-full h-full" /></div>
        <div className="absolute top-[50%] right-[35%] w-4 h-4"><LeafFall className="w-full h-full" /></div>
        <div className="absolute top-[70%] left-[55%] w-4 h-4"><LeafFall className="w-full h-full" /></div>
        <div className="absolute top-[40%] right-[50%] w-5 h-5"><LeafFall className="w-full h-full" /></div>
      </div>

      <div className="relative z-10">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose/40 via-sky/30 via-peach/25 to-transparent" />

        <Header />

        <main className="px-6 pb-20">
          {appState === 'idle' && (
            <div className="max-w-xl mx-auto text-center pt-20 md:pt-28 animate-in-up relative">
              {/* Floral corner decorations */}
              <div className="absolute -top-6 -left-10 w-20 h-20">
                <FlowerBud className="w-full h-full" />
              </div>
              <div className="absolute -top-4 -right-10 w-16 h-16">
                <FlowerPetal className="w-full h-full" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-color mb-12 border border-rose/15 shimmer-border">
                <span className="w-1.5 h-1.5 rounded-full bg-rose animate-pulse" />
                <p className="text-rose text-[10px] tracking-[0.25em] uppercase font-medium">
                  AI-Powered Analysis
                </p>
              </div>

              {/* Hero */}
              <div className="mb-16">
                <h2 className="text-[2.5rem] md:text-[4rem] font-extralight text-white mb-7 leading-[1.15] tracking-tight">
                  <span className="font-cute">ค้นพบ</span>
                  <br />
                  <span className="font-normal bg-gradient-to-r from-rose via-peach via-primary to-sky bg-clip-text text-transparent font-cute bg-[length:200%_auto] animate-[mesh-shift_6s_ease_infinite]">
                    โทนสีที่
                  </span>
                  <br />
                  <span className="font-normal bg-gradient-to-r from-sky via-primary to-rose bg-clip-text text-transparent font-cute bg-[length:200%_auto] animate-[mesh-shift_8s_ease_infinite]">
                    เหมาะกับคุณ
                  </span>
                </h2>
                <p className="text-white/55 text-[15px] leading-[2] max-w-sm mx-auto font-cute font-light">
                  ใช้ระบบประมวลผลภาพวิเคราะห์
                  <br />
                  Personal Color ของคุณ
                  <br />
                  เพื่อแนะนำสีที่เข้ากับโทนผิวอย่างแม่นยำ
                </p>
              </div>

              {/* CTA */}
              <div className="relative inline-block">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose/30 via-primary/30 to-sky/30 blur-xl color-breathe" />
                <button
                  onClick={() => setAppState('scanning')}
                  className="relative group inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-rose/20 via-primary/20 to-sky/20 border border-white/[0.15] text-white text-[14px] font-light tracking-wide hover:border-rose/40 hover:text-white transition-all duration-500 hover:shadow-[0_0_80px_rgba(249,168,212,0.12),0_0_120px_rgba(125,211,252,0.08)] hover:from-rose/25 hover:via-primary/25 hover:to-sky/25"
                >
                  <span className="font-cute font-medium">เริ่มต้นวิเคราะห์</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center gap-3 mt-24 mb-8">
                <div className="w-10 h-px bg-gradient-to-r from-transparent to-rose/30" />
                <FlowerPetal className="w-5 h-5 color-breathe" />
                <div className="w-10 h-px bg-gradient-to-l from-transparent to-sky/30" />
              </div>

              {/* Feature hints */}
              <div className="grid grid-cols-3 gap-10 text-center">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                      </svg>
                    ),
                    label: 'AI Scanner',
                    accent: 'group-hover:text-rose',
                    bg: 'group-hover:bg-rose/[0.08]',
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.147 6.355a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                      </svg>
                    ),
                    label: 'Makeup Guide',
                    accent: 'group-hover:text-sky',
                    bg: 'group-hover:bg-sky/[0.08]',
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    ),
                    label: 'Fashion Tips',
                    accent: 'group-hover:text-peach',
                    bg: 'group-hover:bg-peach/[0.08]',
                  },
                ].map((feature, i) => (
                  <div key={i} className="space-y-3 group">
                    <div className={`w-12 h-12 mx-auto rounded-2xl glass flex items-center justify-center text-white/40 transition-all duration-500 ${feature.accent} ${feature.bg}`}>
                      {feature.icon}
                    </div>
                    <p className="text-white/45 text-[11px] font-cute tracking-wide group-hover:text-white/65 transition-colors duration-300">
                      {feature.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {appState === 'scanning' && (
            <Scanner onAnalyze={handleAnalyze} onManualPick={handleManualPick} onImageCapture={handleImageCapture} />
          )}

          {appState === 'analyzing' && (
            <div className="max-w-xl mx-auto text-center py-32 animate-in">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose/40 via-primary/40 to-sky/40 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-1 rounded-full bg-gradient-to-r from-sky/35 via-peach/35 to-rose/35 animate-spin" style={{ animationDuration: '2.5s', animationDirection: 'reverse' }} />
                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary/30 via-rose/30 to-lime/30 animate-spin" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-4 rounded-full bg-white/[0.05]" />
                <div className="absolute inset-[45%] rounded-full bg-gradient-to-r from-rose to-sky" />
              </div>
              <p className="text-white/65 text-[14px] font-cute font-light tracking-wide">กำลังวิเคราะห์โทนสีผิว...</p>
            </div>
          )}

          {appState === 'manual-pick' && manualImage && (
            <ColorPicker image={manualImage} onConfirm={handleManualConfirm} onBack={() => setAppState('scanning')} />
          )}

          {appState === 'result' && result && (
            <ResultDashboard result={result} uploadedImageSrc={uploadedImageSrcRef.current} onTryAgain={handleTryAgain} />
          )}
        </main>

        <footer className="py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-rose/30" />
            <FlowerPetal className="w-4 h-4 color-breathe" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-sky/30" />
          </div>
          <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-light font-cute">
            AuraMatch — Personal Color Analysis
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
