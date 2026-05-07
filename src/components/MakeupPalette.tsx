import { SEASON_PALETTES } from '../utils/seasonColors';
import type { Season, MakeupRecommendation } from '../types';

interface MakeupPaletteProps {
  season: Season;
}

const categoryAccent: Record<string, string> = {
  lipstick: 'bg-rose/70',
  blush: 'bg-peach/70',
  eyeshadow: 'bg-primary/70',
  foundation: 'bg-sky/70',
};

export function MakeupPalette({ season }: MakeupPaletteProps) {
  const palette = SEASON_PALETTES[season];
  if (!palette) return null;

  return (
    <div className="space-y-10">
      {palette.makeup.map((item: MakeupRecommendation) => (
        <div key={item.category} className="group">
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-2 h-2 rounded-full ${categoryAccent[item.category] || 'bg-primary/70'}`} />
            <h3 className="text-white/40 text-[10px] tracking-[0.25em] uppercase font-light font-cute">
              {getCategoryLabel(item.category)}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {item.colors.map((color) => (
              <Swatch key={color.hex} color={color} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    lipstick: 'ลิปสติก',
    blush: 'บลัชออน',
    eyeshadow: 'อายแชโดว์',
    foundation: 'รองพื้น',
  };
  return labels[category] || category;
}

function Swatch({ color }: { color: { name: string; hex: string } }) {
  return (
    <div className="group/swatch flex flex-col items-center gap-2">
      <div
        className="w-11 h-11 rounded-xl border border-white/[0.06] group-hover/swatch:border-white/20 group-hover/swatch:scale-110 group-hover/swatch:shadow-[0_6px_24px_rgba(0,0,0,0.3),0_0_16px_var(--glow)] transition-all duration-300 cursor-pointer"
        style={{ backgroundColor: color.hex, '--glow': color.hex + '50' } as React.CSSProperties}
        title={color.name}
      />
      <span className="text-white/30 text-[10px] group-hover/swatch:text-white/60 transition-colors duration-200 font-light font-cute tracking-wide">
        {color.name}
      </span>
    </div>
  );
}
