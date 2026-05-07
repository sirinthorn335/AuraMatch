import { SEASON_PALETTES } from '../utils/seasonColors';
import type { Season, ColorSwatch } from '../types';

interface FashionWardrobeProps {
  season: Season;
}

const sectionDotColor: Record<string, string> = {
  best: 'bg-rose/70',
  avoid: 'bg-red-400/50',
  neutrals: 'bg-primary/60',
  accents: 'bg-peach/70',
};

export function FashionWardrobe({ season }: FashionWardrobeProps) {
  const palette = SEASON_PALETTES[season];
  if (!palette) return null;

  return (
    <div className="space-y-10">
      <Section title="สีที่แนะนำ" titleEn="Best Colors" dotKey="best">
        <div className="flex flex-wrap gap-2.5">
          {palette.fashion.best.map((color) => (
            <Swatch key={color.hex} color={color} />
          ))}
        </div>
      </Section>

      <Section title="สีที่ควรหลีกเลี่ยง" titleEn="Avoid" dotKey="avoid">
        <div className="flex flex-wrap gap-2.5">
          {palette.fashion.avoid.map((color) => (
            <Swatch key={color.hex} color={color} crossed />
          ))}
        </div>
      </Section>

      <Section title="สีพื้นฐาน" titleEn="Neutrals" dotKey="neutrals">
        <div className="flex flex-wrap gap-2.5">
          {palette.fashion.neutrals.map((color) => (
            <Swatch key={color.hex} color={color} />
          ))}
        </div>
      </Section>

      <Section title="สี アクセนต์" titleEn="Accents" dotKey="accents">
        <div className="flex flex-wrap gap-2.5">
          {palette.fashion.accents.map((color) => (
            <Swatch key={color.hex} color={color} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  titleEn,
  dotKey,
  children,
}: {
  title: string;
  titleEn: string;
  dotKey: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-2 h-2 rounded-full ${sectionDotColor[dotKey] || 'bg-primary/60'}`} />
        <h3 className="text-white/40 text-[10px] tracking-[0.25em] uppercase font-light font-cute">
          {title}{' '}
          <span className="text-white/25">{titleEn}</span>
        </h3>
      </div>
      {children}
    </div>
  );
}

function Swatch({
  color,
  crossed = false,
}: {
  color: ColorSwatch;
  crossed?: boolean;
}) {
  return (
    <div className="group/swatch flex flex-col items-center gap-2">
      <div className="relative">
        <div
          className="w-10 h-10 rounded-xl border border-white/[0.06] group-hover/swatch:border-white/20 group-hover/swatch:scale-110 group-hover/swatch:shadow-[0_6px_24px_rgba(0,0,0,0.3),0_0_16px_var(--glow)] transition-all duration-300 cursor-pointer"
          style={{ backgroundColor: color.hex, '--glow': color.hex + '50' } as React.CSSProperties}
          title={color.name}
        />
        {crossed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-7 h-px bg-red-400/30 rotate-45" />
          </div>
        )}
      </div>
      <span className="text-white/30 text-[10px] group-hover/swatch:text-white/60 transition-colors duration-200 font-light font-cute tracking-wide">
        {color.name}
      </span>
    </div>
  );
}
