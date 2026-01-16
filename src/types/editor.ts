export type HeadingLevel = 'p' | 'h1' | 'h2' | 'h3';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type FontFamily = 'sans' | 'serif' | 'mono';

export interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface DocumentSettings {
  fontFamily: FontFamily;
  fontSize: number;
  textColor: string;
  textAlign: TextAlign;
  lineHeight: number;
  headingLevel: HeadingLevel;
}

export interface PageSettings {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  orientation: 'portrait' | 'landscape';
}

export const FONT_FAMILIES: { value: FontFamily; label: string; className: string }[] = [
  { value: 'sans', label: 'Inter', className: 'font-sans' },
  { value: 'serif', label: 'Merriweather', className: 'font-serif' },
  { value: 'mono', label: 'Roboto Mono', className: 'font-mono' },
];

export const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

export const TEXT_COLORS = [
  '#1a1a2e',
  '#16213e',
  '#0f4c75',
  '#3282b8',
  '#e94560',
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#96ceb4',
  '#ffeaa7',
  '#dfe6e9',
  '#636e72',
];
