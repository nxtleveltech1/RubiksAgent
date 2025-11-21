export type CubeState = 'idle' | 'listening' | 'thinking' | 'responding';

export interface AudioFeatures {
  volume: number;
  pitch: number;
  variability: number;
  spectralCentroid: number;
  energy: number;
  attack: number;
}

export interface EmotionOutput {
  emotion: 'angry' | 'sad' | 'excited' | 'confused' | 'calm';
  intensity: number; // 0-1
  stress: number;    // 0-1
  energy: number;    // 0-1
  confidence: number; // 0-1
}

export interface PersonalityProfile {
  calmGenius: number;
  playful: number;
  oracle: number;
  confident: number;
  empathetic: number;
  dominant: 'calmGenius' | 'playful' | 'oracle' | 'confident' | 'empathetic';
}

export interface MotionCommand {
  target: 'global' | 'H1' | 'H2' | 'H3' | 'V1' | 'V2' | 'V3';
  axis: 'x' | 'y' | 'z';
  value: number; // Rotation amount in radians
  duration: number; // ms
  easing: string;
}

export interface LightingState {
  glowColor: [number, number, number];
  glowIntensity: number;
  edgeColor: [number, number, number];
  textureType: 'metal' | 'crystal' | 'neon' | 'mystical' | 'soft';
  breathingSpeed: number;
  breathingAmplitude: number;
  moodColor: [number, number, number];
}

export interface PanelContent {
  type: 'none' | 'shader' | 'image' | 'video';
  shaderName?: string;
  src?: string;
  syncMode?: 'tile' | 'face' | 'global';
}

export interface LEDState {
  face0: PanelContent[];
  face1: PanelContent[];
  face2: PanelContent[];
  face3: PanelContent[];
  face4: PanelContent[];
  face5: PanelContent[];
}

export interface EmotionStateData {
  currentEmotion: EmotionOutput;
  emotionHistory: EmotionOutput[];
  processingAudio: boolean;
}

export interface PersonalityStateData {
  currentProfile: PersonalityProfile;
  previousProfile: PersonalityProfile;
  blendProgress: number;
}

export interface MotionStateData {
  activeCommands: MotionCommand[];
  queueLength: number;
  lastUpdateTime: number;
}
