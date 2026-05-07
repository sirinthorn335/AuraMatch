export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export interface SkinAnalysisResult {
  averageRGB: RGB;
  averageHSL: HSL;
  undertone: 'warm' | 'cool' | 'neutral';
  value: 'light' | 'medium' | 'deep';
  chroma: 'bright' | 'soft' | 'muted';
  skinToneHex: string;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonResult {
  season: Season;
  label: string;
  description: string;
  confidence: number;
  analysis: SkinAnalysisResult;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface MakeupRecommendation {
  category: 'lipstick' | 'blush' | 'eyeshadow' | 'foundation';
  colors: ColorSwatch[];
}

export interface FashionRecommendation {
  best: ColorSwatch[];
  avoid: ColorSwatch[];
  neutrals: ColorSwatch[];
  accents: ColorSwatch[];
}

export interface SeasonColorPalette {
  season: Season;
  label: string;
  description: string;
  undertone: 'warm' | 'cool';
  character: string;
  swatches: ColorSwatch[];
  makeup: MakeupRecommendation[];
  fashion: FashionRecommendation;
}

export type AppState = 'idle' | 'scanning' | 'analyzing' | 'result' | 'manual-pick';
