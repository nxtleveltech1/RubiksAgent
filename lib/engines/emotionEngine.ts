/**
 * Emotion Engine for AI Cube Avatar
 * Processes audio features and outputs emotional state
 */

import { AudioFeatures, EmotionOutput } from '../types';

export class EmotionEngine {
    private emotionHistory: EmotionOutput[] = [];
    private smoothingFactor = 0.7; // For smoothing emotion transitions
    private previousPitch: number | null = null;

    /**
     * Main emotion analysis function
     */
    public analyzeEmotion(audioFeatures: AudioFeatures): EmotionOutput {
        // Extract base emotion
        const baseEmotion = this.classifyBaseEmotion(audioFeatures);

        // Calculate emotion metrics
        const intensity = this.calculateIntensity(audioFeatures);
        const stress = this.calculateStress(audioFeatures);
        const energy = this.calculateEnergy(audioFeatures);
        const confidence = this.calculateConfidence(audioFeatures);

        const emotionOutput: EmotionOutput = {
            emotion: baseEmotion,
            intensity,
            stress,
            energy,
            confidence
        };

        // Smooth with history
        const smoothedEmotion = this.smoothEmotion(emotionOutput);

        // Store in history
        this.addToHistory(smoothedEmotion);

        return smoothedEmotion;
    }

    /**
     * Classify base emotion from audio features
     */
    private classifyBaseEmotion(features: AudioFeatures): EmotionOutput['emotion'] {
        const { volume, pitch, variability, spectralCentroid, attack } = features;

        // ANGRY: High volume + high attack
        if (volume > 0.75 && attack > 0.6) {
            return 'angry';
        }

        // SAD: Low volume + low pitch
        if (volume < 0.35 && pitch < 0.4) {
            return 'sad';
        }

        // EXCITED: High pitch variability + high pitch
        if (variability > 0.55 && pitch > 0.5) {
            return 'excited';
        }

        // CONFUSED: Irregular pitch + irregular rhythm
        if (variability > 0.4 && spectralCentroid < 0.3) {
            return 'confused';
        }

        // Default to calm
        return 'calm';
    }

    private calculateIntensity(features: AudioFeatures): number {
        const { volume, variability, energy } = features;
        return Math.min(1, Math.max(0, volume * 0.4 + variability * 0.3 + energy * 0.3));
    }

    private calculateStress(features: AudioFeatures): number {
        const { attack, variability } = features;
        return Math.min(1, Math.max(0, attack * 0.6 + variability * 0.4));
    }

    private calculateEnergy(features: AudioFeatures): number {
        const { volume, variability } = features;
        return Math.min(1, Math.max(0, volume * variability * 1.2));
    }

    private calculateConfidence(features: AudioFeatures): number {
        const { pitch } = features;
        const confidence = 1.0 - Math.abs(pitch - (this.previousPitch || pitch));
        this.previousPitch = pitch;
        return Math.min(1, Math.max(0, confidence));
    }

    private smoothEmotion(currentEmotion: EmotionOutput): EmotionOutput {
        if (this.emotionHistory.length === 0) return currentEmotion;

        const previousEmotion = this.emotionHistory[this.emotionHistory.length - 1];

        if (previousEmotion.emotion === currentEmotion.emotion) {
            return {
                emotion: currentEmotion.emotion,
                intensity: (previousEmotion.intensity * this.smoothingFactor) + (currentEmotion.intensity * (1 - this.smoothingFactor)),
                stress: (previousEmotion.stress * this.smoothingFactor) + (currentEmotion.stress * (1 - this.smoothingFactor)),
                energy: (previousEmotion.energy * this.smoothingFactor) + (currentEmotion.energy * (1 - this.smoothingFactor)),
                confidence: (previousEmotion.confidence * this.smoothingFactor) + (currentEmotion.confidence * (1 - this.smoothingFactor))
            };
        }

        return currentEmotion;
    }

    private addToHistory(emotion: EmotionOutput): void {
        this.emotionHistory.push({ ...emotion });
        if (this.emotionHistory.length > 10) {
            this.emotionHistory.shift();
        }
    }

    public getEmotionHistory(): EmotionOutput[] {
        return [...this.emotionHistory];
    }

    public getDominantEmotion(): EmotionOutput | null {
        return this.emotionHistory.length > 0 ? this.emotionHistory[this.emotionHistory.length - 1] : null;
    }

    public reset(): void {
        this.emotionHistory = [];
    }
}

export const createEmotionEngine = (): EmotionEngine => {
    return new EmotionEngine();
};
