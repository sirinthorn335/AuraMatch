import { useState } from 'react';
import { SEASON_PALETTES } from '../utils/seasonColors';
import { MakeupPalette } from './MakeupPalette';
import { FashionWardrobe } from './FashionWardrobe';
import { BackgroundPreview } from './BackgroundPreview';
import { ColorTryOn } from './ColorTryOn';
import type { SeasonResult, Season } from '../types';

interface ResultDashboardProps {
  result: SeasonResult;
  uploadedImageSrc?: string;
  onTryAgain: () => void;
}

type Tab = 'makeup' | 'fashion' | 'background' | 'tryon';

const seasonAccent: Record<Season, string> = {
  spring: '#f97316',
  summer: '#a78bfa',
  autumn: '#b45309',
  winter: '#06b6d4',
};

const seasonEmoji: Record<Season, string> = {
  spring: '🌸',
  summer: '🌊',
  autumn: '🍂',
  winter: '❄️',
};

export function ResultDashboard({
  result,
  uploadedImageSrc,
  onTryAgain,
}: ResultDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('makeup');
  const palette = SEASON_PALETTES[result.season];
  const accent = seasonAccent[result.season];
  const swatches = palette?.swatches || [];

  return (
    <div className="w-full max-w-xl mx-auto animate-in-up">
      {/* Season Reveal */}
      <div className="text-center mb-14">
        <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-8 font-light font-cute">
          Your Personal Color
        </p>

        <div className="inline-block mb-5">
          <div
            className="px-12 py-5 rounded-3xl border relative overflow-hidden"
            style={{
              borderColor: `${accent}40`,
              backgroundColor: `${accent}12`,
              boxShadow: `0 0 100px ${accent}20, 0 20px 40px rgba(0,0,0,0.2)`,
            }}
          >
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background: `radial-gradient(ellipse at 30% 50%, ${accent}35 0%, transparent 70%)`,
              }}
            />
            <div className="relative">
              <div className="text-2xl mb-2">{seasonEmoji[result.season]}</div>
              <h2
                className="text-3xl md:text-4xl font-extralight tracking-tight font-serif"
                style={{ color: accent }}
              >
                {palette?.label.split(' — ')[0]}
              </h2>
              <p className="text-white/55 text-[11px] mt-2 tracking-[0.2em] uppercase font-light font-cute">
                {palette?.label.split(' — ')[1]}
              </p>
            </div>
          </div>
        </div>

        {/* Color swatches strip */}
        {swatches.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {swatches.slice(0, 8).map((swatch) => (
              <div
                key={swatch.hex}
                className="w-5 h-5 rounded-full border border-white/[0.08]"
                style={{ backgroundColor: swatch.hex }}
                title={swatch.name}
              />
            ))}
          </div>
        )}

        <p className="text-white/40 text-[13px] font-cute font-light max-w-sm mx-auto leading-[1.9]">
          {palette?.description}
        </p>
      </div>

      {/* Confidence + Skin Tone */}
      <div className="flex items-center gap-8 px-2 mb-12">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] mb-2.5">
            <span className="text-white/30 font-light tracking-wider uppercase font-cute">Confidence</span>
            <span className="font-cute font-medium" style={{ color: accent, fontSize: '11px' }}>{result.confidence}%</span>
          </div>
          <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${result.confidence}%`,
                background: `linear-gradient(90deg, ${accent}90, ${accent})`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border border-white/[0.08] shadow-[0_0_12px_rgba(0,0,0,0.3)]"
            style={{ backgroundColor: result.analysis.skinToneHex }}
          />
          <div>
            <p className="text-white/30 text-[10px] font-light tracking-wider uppercase font-cute">Skin Tone</p>
            <p className="text-white/45 text-[11px] font-mono">{result.analysis.skinToneHex}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <div className="w-12 h-px bg-gradient-to-r from-transparent to-rose/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-rose/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/35" />
        <div className="w-1.5 h-1.5 rounded-full bg-sky/40" />
        <div className="w-12 h-px bg-gradient-to-l from-transparent to-sky/30" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl glass mb-8 border border-white/[0.05]">
        <TabButton label="เครื่องสำอาง" active={activeTab === 'makeup'} onClick={() => setActiveTab('makeup')} accent="rose" />
        <TabButton label="เสื้อผ้า" active={activeTab === 'fashion'} onClick={() => setActiveTab('fashion')} accent="sky" />
        <TabButton label="เทียบสี" active={activeTab === 'tryon'} onClick={() => setActiveTab('tryon')} accent="peach" />
        <TabButton label="พื้นหลัง" active={activeTab === 'background'} onClick={() => setActiveTab('background')} accent="peach" />
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'makeup' && <MakeupPalette season={result.season} />}
        {activeTab === 'fashion' && <FashionWardrobe season={result.season} />}
        {activeTab === 'tryon' && (
          <ColorTryOn
            skinToneHex={result.analysis.skinToneHex}
            paletteColors={[...palette.fashion.best, ...palette.fashion.accents, ...palette.fashion.neutrals]}
            uploadedImageSrc={uploadedImageSrc}
            season={result.season}
          />
        )}
        {activeTab === 'background' && (
          <BackgroundPreview season={result.season} uploadedImageSrc={uploadedImageSrc} />
        )}
      </div>

      {/* Try Again */}
      <div className="text-center mt-14 pb-8">
        <button
          onClick={onTryAgain}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/[0.06] text-white/30 text-[11px] tracking-[0.2em] uppercase hover:border-white/[0.12] hover:text-white/55 transition-all duration-300 font-light font-cute"
        >
          วิเคราะห์อีกครั้ง
        </button>
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent: string;
}) {
  const activeColor = accent === 'rose' ? 'bg-rose/[0.08] text-rose' : accent === 'sky' ? 'bg-sky/[0.08] text-sky' : 'bg-peach/[0.08] text-peach';
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-lg text-[11px] font-light tracking-wider font-cute transition-all duration-300 ${
        active ? activeColor : 'text-white/25 hover:text-white/45'
      }`}
    >
      {label}
    </button>
  );
}
