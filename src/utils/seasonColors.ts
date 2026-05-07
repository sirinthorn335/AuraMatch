import type { SeasonColorPalette } from '../types';

export const SEASON_PALETTES: Record<string, SeasonColorPalette> = {
  spring: {
    season: 'spring',
    label: 'Spring — Warm & Bright',
    description:
      'โทนสีอุ่น สว่างสดใส เหมาะกับผิวที่มี undertone ออกเหลืองทอง ให้ลุคสดใสมีพลัง',
    undertone: 'warm',
    character: 'Warm, Light, Bright',
    swatches: [
      { name: 'Coral', hex: '#FF7F50' },
      { name: 'Peach', hex: '#FFDAB9' },
      { name: 'Warm Pink', hex: '#FF69B4' },
      { name: 'Golden Yellow', hex: '#FFD700' },
      { name: 'Ivory', hex: '#FFFFF0' },
      { name: 'Warm Green', hex: '#7CB342' },
      { name: 'Camel', hex: '#C19A6B' },
      { name: 'Light Aqua', hex: '#7FFFD4' },
    ],
    makeup: [
      {
        category: 'lipstick',
        colors: [
          { name: 'Coral Kiss', hex: '#FF7F50' },
          { name: 'Peach Sorbet', hex: '#FF9E7A' },
          { name: 'Warm Rose', hex: '#E8848C' },
          { name: 'Honey Nude', hex: '#C9956B' },
        ],
      },
      {
        category: 'blush',
        colors: [
          { name: 'Peach Blossom', hex: '#FFB6A3' },
          { name: 'Coral Blush', hex: '#FF8A80' },
          { name: 'Warm Apricot', hex: '#FFCC80' },
        ],
      },
      {
        category: 'eyeshadow',
        colors: [
          { name: 'Golden Sand', hex: '#E6C96B' },
          { name: 'Warm Bronze', hex: '#CD7F32' },
          { name: 'Peach Shimmer', hex: '#FFAB91' },
          { name: 'Champagne', hex: '#F7E7CE' },
        ],
      },
      {
        category: 'foundation',
        colors: [
          { name: 'Warm Ivory', hex: '#FFF5E1' },
          { name: 'Golden Beige', hex: '#F5D5A0' },
          { name: 'Honey', hex: '#EBBF8C' },
        ],
      },
    ],
    fashion: {
      best: [
        { name: 'Coral', hex: '#FF7F50' },
        { name: 'Peach', hex: '#FFDAB9' },
        { name: 'Warm Pink', hex: '#FF69B4' },
        { name: 'Golden Yellow', hex: '#FFD700' },
        { name: 'Aqua', hex: '#7FFFD4' },
        { name: 'Warm Green', hex: '#7CB342' },
      ],
      avoid: [
        { name: 'Black', hex: '#000000' },
        { name: 'Navy', hex: '#1B1B3A' },
        { name: 'Cool Gray', hex: '#6B6B6B' },
        { name: 'Fuchsia', hex: '#FF00FF' },
      ],
      neutrals: [
        { name: 'Ivory', hex: '#FFFFF0' },
        { name: 'Camel', hex: '#C19A6B' },
        { name: 'Warm Brown', hex: '#8B6914' },
        { name: 'Cream', hex: '#FFFDD0' },
      ],
      accents: [
        { name: 'Gold', hex: '#FFD700' },
        { name: 'Copper', hex: '#B87333' },
        { name: 'Light Coral', hex: '#F08080' },
      ],
    },
  },
  summer: {
    season: 'summer',
    label: 'Summer — Cool & Soft',
    description:
      'โทนสีเย็น นุ่มนวล อ่อนโยน เหมาะกับผิวที่มี undertone ออกชมพู ให้ลุคละมุน สบายตา',
    undertone: 'cool',
    character: 'Cool, Light, Soft',
    swatches: [
      { name: 'Pastel Pink', hex: '#FFB6C1' },
      { name: 'Lavender', hex: '#E6E6FA' },
      { name: 'Soft Blue', hex: '#ADD8E6' },
      { name: 'Rose', hex: '#E8848C' },
      { name: 'Mauve', hex: '#E0B0FF' },
      { name: 'Powder Blue', hex: '#B0E0E6' },
      { name: 'Dusty Rose', hex: '#DCAE96' },
      { name: 'Soft Gray', hex: '#BEBEBE' },
    ],
    makeup: [
      {
        category: 'lipstick',
        colors: [
          { name: 'Rose Petal', hex: '#E8848C' },
          { name: 'Mauve Dream', hex: '#C9A0DC' },
          { name: 'Berry Soft', hex: '#B76E79' },
          { name: 'Pink Nude', hex: '#E8B4B8' },
        ],
      },
      {
        category: 'blush',
        colors: [
          { name: 'Baby Pink', hex: '#FFB6C1' },
          { name: 'Dusty Rose', hex: '#DCAE96' },
          { name: 'Cool Plum', hex: '#C39BD3' },
        ],
      },
      {
        category: 'eyeshadow',
        colors: [
          { name: 'Lavender Mist', hex: '#E6E6FA' },
          { name: 'Soft Taupe', hex: '#B8A99A' },
          { name: 'Powder Blue', hex: '#B0E0E6' },
          { name: 'Rose Gold', hex: '#B76E79' },
        ],
      },
      {
        category: 'foundation',
        colors: [
          { name: 'Cool Porcelain', hex: '#FFF0ED' },
          { name: 'Rose Beige', hex: '#F0C8C0' },
          { name: 'Soft Sand', hex: '#E8D5C4' },
        ],
      },
    ],
    fashion: {
      best: [
        { name: 'Pastel Pink', hex: '#FFB6C1' },
        { name: 'Lavender', hex: '#E6E6FA' },
        { name: 'Soft Blue', hex: '#ADD8E6' },
        { name: 'Mauve', hex: '#E0B0FF' },
        { name: 'Dusty Rose', hex: '#DCAE96' },
        { name: 'Powder Blue', hex: '#B0E0E6' },
      ],
      avoid: [
        { name: 'Bright Orange', hex: '#FF6600' },
        { name: 'Mustard', hex: '#FFDB58' },
        { name: 'Warm Brown', hex: '#8B4513' },
        { name: 'Neon Colors', hex: '#FF0000' },
      ],
      neutrals: [
        { name: 'Soft Gray', hex: '#BEBEBE' },
        { name: 'Off White', hex: '#F5F5F0' },
        { name: 'Cool Navy', hex: '#2C3E6B' },
        { name: 'Charcoal', hex: '#36454F' },
      ],
      accents: [
        { name: 'Silver', hex: '#C0C0C0' },
        { name: 'Rose Gold', hex: '#B76E79' },
        { name: 'Platinum', hex: '#E5E4E2' },
      ],
    },
  },
  autumn: {
    season: 'autumn',
    label: 'Autumn — Warm & Deep',
    description:
      'โทนสีอุ่น ลึก เข้ม เหมาะกับผิวที่มี undertone ออกทองเข้ม ให้ลุคอบอุ่น มีเสน่ห์',
    undertone: 'warm',
    character: 'Warm, Deep, Muted',
    swatches: [
      { name: 'Terracotta', hex: '#E2725B' },
      { name: 'Olive', hex: '#708238' },
      { name: 'Burnt Orange', hex: '#CC5500' },
      { name: 'Warm Brown', hex: '#8B4513' },
      { name: 'Mustard', hex: '#FFDB58' },
      { name: 'Moss Green', hex: '#8A9A5B' },
      { name: 'Bronze', hex: '#CD7F32' },
      { name: 'Rust', hex: '#B7410E' },
    ],
    makeup: [
      {
        category: 'lipstick',
        colors: [
          { name: 'Brick Red', hex: '#8B3A3A' },
          { name: 'Terracotta', hex: '#E2725B' },
          { name: 'Burnt Sienna', hex: '#E97451' },
          { name: 'Warm Nude', hex: '#C19A6B' },
        ],
      },
      {
        category: 'blush',
        colors: [
          { name: 'Warm Copper', hex: '#DA8A67' },
          { name: 'Burnt Peach', hex: '#FF9966' },
          { name: 'Deep Rose', hex: '#B76E79' },
        ],
      },
      {
        category: 'eyeshadow',
        colors: [
          { name: 'Bronze', hex: '#CD7F32' },
          { name: 'Warm Brown', hex: '#8B4513' },
          { name: 'Olive Gold', hex: '#708238' },
          { name: 'Copper', hex: '#B87333' },
        ],
      },
      {
        category: 'foundation',
        colors: [
          { name: 'Warm Beige', hex: '#E8D5B7' },
          { name: 'Golden Honey', hex: '#D4A76A' },
          { name: 'Tan', hex: '#C19A6B' },
        ],
      },
    ],
    fashion: {
      best: [
        { name: 'Terracotta', hex: '#E2725B' },
        { name: 'Olive', hex: '#708238' },
        { name: 'Burnt Orange', hex: '#CC5500' },
        { name: 'Mustard', hex: '#FFDB58' },
        { name: 'Moss Green', hex: '#8A9A5B' },
        { name: 'Rust', hex: '#B7410E' },
      ],
      avoid: [
        { name: 'Pastel Pink', hex: '#FFB6C1' },
        { name: 'Baby Blue', hex: '#89CFF0' },
        { name: 'Bright White', hex: '#FFFFFF' },
        { name: 'Neon Green', hex: '#39FF14' },
      ],
      neutrals: [
        { name: 'Warm Brown', hex: '#8B4513' },
        { name: 'Camel', hex: '#C19A6B' },
        { name: 'Dark Olive', hex: '#556B2F' },
        { name: 'Charcoal Brown', hex: '#3E2723' },
      ],
      accents: [
        { name: 'Gold', hex: '#FFD700' },
        { name: 'Bronze', hex: '#CD7F32' },
        { name: 'Copper', hex: '#B87333' },
      ],
    },
  },
  winter: {
    season: 'winter',
    label: 'Winter — Cool & Clear',
    description:
      'โทนสีเย็น ชัดเจน เข้มข้น เหมาะกับผิวที่มี undertone ออกชมพู-แดง ให้ลุคโดดเด่น มีพลัง',
    undertone: 'cool',
    character: 'Cool, Deep, Clear',
    swatches: [
      { name: 'True Red', hex: '#FF0000' },
      { name: 'Black', hex: '#000000' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Emerald', hex: '#50C878' },
      { name: 'Fuchsia', hex: '#FF00FF' },
      { name: 'Ice Blue', hex: '#A5F2F3' },
      { name: 'Plum', hex: '#8E4585' },
      { name: 'Pure White', hex: '#FFFFFF' },
    ],
    makeup: [
      {
        category: 'lipstick',
        colors: [
          { name: 'True Red', hex: '#FF0000' },
          { name: 'Berry', hex: '#8B008B' },
          { name: 'Fuchsia', hex: '#FF00FF' },
          { name: 'Cool Pink', hex: '#FF1493' },
        ],
      },
      {
        category: 'blush',
        colors: [
          { name: 'Cool Pink', hex: '#FF69B4' },
          { name: 'Berry', hex: '#8B008B' },
          { name: 'Plum', hex: '#8E4585' },
        ],
      },
      {
        category: 'eyeshadow',
        colors: [
          { name: 'Silver', hex: '#C0C0C0' },
          { name: 'Charcoal', hex: '#36454F' },
          { name: 'Icy Blue', hex: '#A5F2F3' },
          { name: 'Black', hex: '#000000' },
        ],
      },
      {
        category: 'foundation',
        colors: [
          { name: 'Cool Porcelain', hex: '#FFF0ED' },
          { name: 'Cool Beige', hex: '#D4B8A8' },
          { name: 'Neutral Tan', hex: '#C19A6B' },
        ],
      },
    ],
    fashion: {
      best: [
        { name: 'True Red', hex: '#FF0000' },
        { name: 'Black', hex: '#000000' },
        { name: 'Navy', hex: '#000080' },
        { name: 'Emerald', hex: '#50C878' },
        { name: 'Fuchsia', hex: '#FF00FF' },
        { name: 'Plum', hex: '#8E4585' },
      ],
      avoid: [
        { name: 'Warm Orange', hex: '#FF8C00' },
        { name: 'Mustard', hex: '#FFDB58' },
        { name: 'Peach', hex: '#FFDAB9' },
        { name: 'Camel', hex: '#C19A6B' },
      ],
      neutrals: [
        { name: 'Black', hex: '#000000' },
        { name: 'Pure White', hex: '#FFFFFF' },
        { name: 'Navy', hex: '#000080' },
        { name: 'Charcoal', hex: '#36454F' },
      ],
      accents: [
        { name: 'Silver', hex: '#C0C0C0' },
        { name: 'Platinum', hex: '#E5E4E2' },
        { name: 'Diamond', hex: '#F8F8FF' },
      ],
    },
  },
};
