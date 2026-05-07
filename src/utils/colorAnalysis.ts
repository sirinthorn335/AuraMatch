import type { RGB, HSL, SkinAnalysisResult, Season } from '../types';

// --- Color Space Conversion ---

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
      .toUpperCase()
  );
}

// --- Skin Detection (YCrCb-based) ---

export function isSkinPixel(r: number, g: number, b: number): boolean {
  // Convert RGB to YCrCb
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cr = r * 0.713 - g * 0.36 - b * 0.353 + 128;
  const cb = -r * 0.168 - g * 0.331 + b * 0.5 + 128;

  // Filter out extreme brightness/darkness
  if (r < 30 && g < 30 && b < 30) return false; // too dark
  if (r > 245 && g > 245 && b > 245) return false; // too bright

  // YCrCb skin range (empirical for most skin tones)
  return cr >= 132 && cr <= 175 && cb >= 77 && cb <= 127;
}

// --- Skin Color Extraction from Face Landmarks ---

const RIGHT_CHEEK = [
  43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 103, 104, 105, 108, 109, 117,
  118, 123, 126, 209,
];
const LEFT_CHEEK = [
  273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 332, 333, 334, 337,
  338, 346, 347, 352, 355, 429,
];

export function extractSkinColor(
  imageData: ImageData,
  landmarks: Array<{ x: number; y: number }>,
  width: number,
  height: number,
): SkinAnalysisResult {
  // Map landmarks to pixel coords
  const toPixel = (v: number, dim: number) => {
    // MediaPipe coords are normalized [0,1], but we use pixel coords from canvas
    // If landmarks are already pixels, use directly
    return v > 1 ? Math.round(v) : Math.round(v * dim);
  };

  const cheekLandmarks = [...RIGHT_CHEEK, ...LEFT_CHEEK]
    .map((i) => landmarks[i])
    .filter(Boolean);

  if (cheekLandmarks.length === 0) {
    throw new Error('No cheek landmarks found');
  }

  // Compute bounding box
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const lm of cheekLandmarks) {
    const px = toPixel(lm.x, width);
    const py = toPixel(lm.y, height);
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  // Add 30% padding
  const padX = Math.round((maxX - minX) * 0.3);
  const padY = Math.round((maxY - minY) * 0.3);
  minX = Math.max(0, minX - padX);
  minY = Math.max(0, minY - padY);
  maxX = Math.min(width - 1, maxX + padX);
  maxY = Math.min(height - 1, maxY + padY);

  // Extract pixels and filter skin
  const skinPixels: RGB[] = [];

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = (y * width + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];

      if (isSkinPixel(r, g, b)) {
        skinPixels.push({ r, g, b });
      }
    }
  }

  if (skinPixels.length === 0) {
    throw new Error('No skin pixels detected. Try better lighting.');
  }

  // Compute median RGB (robust against outliers)
  skinPixels.sort((a, b) => a.r - b.r);
  const medianR = skinPixels[Math.floor(skinPixels.length / 2)].r;
  skinPixels.sort((a, b) => a.g - b.g);
  const medianG = skinPixels[Math.floor(skinPixels.length / 2)].g;
  skinPixels.sort((a, b) => a.b - b.b);
  const medianB = skinPixels[Math.floor(skinPixels.length / 2)].b;

  const averageRGB: RGB = { r: medianR, g: medianG, b: medianB };
  const averageHSL = rgbToHsl(medianR, medianG, medianB);
  const skinToneHex = rgbToHex(medianR, medianG, medianB);

  // Determine undertone
  let undertone: 'warm' | 'cool' | 'neutral';
  const { h, s } = averageHSL;

  if (h >= 30 && h <= 60) {
    undertone = 'warm';
  } else if ((h >= 330 && h <= 360) || (h >= 0 && h <= 15)) {
    undertone = 'cool';
  } else if (h >= 15 && h <= 30) {
    // Transition zone: check R vs B ratio
    undertone = medianR > medianB ? 'warm' : 'cool';
  } else {
    // Neutral fallback
    undertone = medianR > medianB ? 'warm' : 'cool';
  }

  // Determine value (lightness)
  let value: 'light' | 'medium' | 'deep';
  if (averageHSL.l > 65) {
    value = 'light';
  } else if (averageHSL.l > 45) {
    value = 'medium';
  } else {
    value = 'deep';
  }

  // Determine chroma (saturation)
  let chroma: 'bright' | 'soft' | 'muted';
  if (averageHSL.s > 45) {
    chroma = 'bright';
  } else if (averageHSL.s > 30) {
    chroma = 'soft';
  } else {
    chroma = 'muted';
  }

  return { averageRGB, averageHSL, undertone, value, chroma, skinToneHex };
}

// --- Season Classification ---

export function classifySeason(
  analysis: SkinAnalysisResult,
): { season: Season; confidence: number } {
  const { undertone, value, chroma } = analysis;

  // Decision tree: undertone + value -> season
  let season: Season;

  if (undertone === 'warm') {
    if (value === 'light' || (value === 'medium' && chroma === 'bright')) {
      season = 'spring';
    } else {
      season = 'autumn';
    }
  } else {
    // cool
    if (value === 'light' || (value === 'medium' && chroma === 'soft')) {
      season = 'summer';
    } else {
      season = 'winter';
    }
  }

  const confidence = computeConfidence(analysis);

  return { season, confidence };
}

export function computeConfidence(analysis: SkinAnalysisResult): number {
  let confidence = 70;
  const { s, l } = analysis.averageHSL;

  // High saturation = clearer undertone signal
  if (s > 40) confidence += 15;
  else if (s < 25) confidence -= 10;

  // Medium lightness = most reliable range
  if (l >= 35 && l <= 70) {
    confidence += 10;
  } else if (l < 20 || l > 85) {
    confidence -= 15;
  }

  return Math.max(30, Math.min(100, Math.round(confidence)));
}
