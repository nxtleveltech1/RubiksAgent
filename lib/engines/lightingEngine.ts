/**
 * Lighting Engine for AI Cube Avatar
 * Handles personality palettes and emotional overrides
 */

import { CubeState, EmotionOutput, PersonalityProfile, LightingState } from '../types';

export class LightingEngine {
    private currentLighting: LightingState;
    private personalityPalettes: Map<string, LightingState> = new Map();
    private emotionOverrides: Map<string, Partial<LightingState>> = new Map();
    private breathingPhase = 0;

    constructor() {
        this.currentLighting = this.createDefaultLightingState();
        this.initializePalettes();
    }

    public updateLighting(
        cubeState: CubeState,
        emotion: EmotionOutput,
        personality: PersonalityProfile,
        deltaTime: number = 16
    ): LightingState {
        // Base from personality
        const base = this.personalityPalettes.get(personality.dominant) || this.createDefaultLightingState();

        // Apply emotion override
        const emotionMod = this.applyEmotionOverrides(base, emotion);

        // Apply breathing
        this.breathingPhase += (deltaTime / 1000) * emotionMod.breathingSpeed * 2 * Math.PI;
        const breathingVal = Math.sin(this.breathingPhase) * emotionMod.breathingAmplitude;

        this.currentLighting = {
            ...emotionMod,
            glowIntensity: Math.max(0, emotionMod.glowIntensity + breathingVal)
        };

        return this.currentLighting;
    }

    private createDefaultLightingState(): LightingState {
        return {
            glowColor: [0.2, 0.6, 1.0],
            glowIntensity: 0.3,
            edgeColor: [1.0, 0.8, 0.4],
            textureType: 'metal',
            breathingSpeed: 1.0,
            breathingAmplitude: 0.1,
            moodColor: [0.3, 0.5, 0.8]
        };
    }

    private initializePalettes(): void {
        this.personalityPalettes.set('calmGenius', {
            glowColor: [0.1, 0.8, 0.9],
            glowIntensity: 0.4,
            edgeColor: [0.8, 0.9, 1.0],
            textureType: 'crystal',
            breathingSpeed: 0.6,
            breathingAmplitude: 0.05,
            moodColor: [0.2, 0.6, 0.8]
        });
        this.personalityPalettes.set('playful', {
            glowColor: [1.0, 0.3, 0.8],
            glowIntensity: 0.7,
            edgeColor: [1.0, 0.6, 0.2],
            textureType: 'neon',
            breathingSpeed: 1.5,
            breathingAmplitude: 0.2,
            moodColor: [0.9, 0.4, 0.7]
        });
        // ... other palettes
    }

    private applyEmotionOverrides(lighting: LightingState, emotion: EmotionOutput): LightingState {
        const override = this.emotionOverrides.get(emotion.emotion);
        if (!override) return lighting;
        return { ...lighting, ...override };
    }

    public getCurrentLighting(): LightingState {
        return { ...this.currentLighting };
    }
}

export const createLightingEngine = (): LightingEngine => {
    return new LightingEngine();
};
