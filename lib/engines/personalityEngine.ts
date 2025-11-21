/**
 * Personality Engine for AI Cube Avatar
 * Computes personality profiles based on emotion output
 */

import { EmotionOutput, PersonalityProfile } from '../types';

export class PersonalityEngine {
    private personalityHistory: PersonalityProfile[] = [];
    private blendingSpeed = 0.8;

    public computePersonality(
        emotionOutput: EmotionOutput,
        previousProfile?: PersonalityProfile
    ): PersonalityProfile {
        // Generate base personality from emotion
        const baseProfile = this.emotionToPersonality(emotionOutput);

        // Normalize to ensure all traits sum to 1
        const normalizedProfile = this.normalizeProfile(baseProfile);

        // Determine dominant trait
        const dominant = this.findDominantTrait(normalizedProfile);

        const finalProfile: PersonalityProfile = {
            ...normalizedProfile,
            dominant
        };

        // Blend with previous profile if provided
        if (previousProfile) {
            const blendedProfile = this.blendWithPrevious(finalProfile, previousProfile);
            this.addToHistory(blendedProfile);
            return blendedProfile;
        }

        this.addToHistory(finalProfile);
        return finalProfile;
    }

    private emotionToPersonality(emotion: EmotionOutput): Omit<PersonalityProfile, 'dominant'> {
        const { emotion: emotionType, intensity, energy, stress, confidence } = emotion;

        let profile: Omit<PersonalityProfile, 'dominant'> = {
            calmGenius: 0.2,
            playful: 0.2,
            oracle: 0.2,
            confident: 0.2,
            empathetic: 0.2
        };

        switch (emotionType) {
            case 'calm':
                profile.calmGenius += 0.3 * intensity;
                profile.confident += 0.2 * confidence;
                profile.empathetic += 0.1 * energy;
                break;
            case 'excited':
                profile.playful += 0.4 * intensity;
                profile.confident += 0.2 * energy;
                profile.oracle += 0.1 * confidence;
                break;
            case 'angry':
                profile.confident += 0.3 * intensity;
                profile.empathetic -= 0.2 * stress;
                profile.playful -= 0.1 * intensity;
                break;
            case 'sad':
                profile.empathetic += 0.3 * (1 - energy);
                profile.calmGenius += 0.2 * (1 - stress);
                profile.confident -= 0.2 * intensity;
                break;
            case 'confused':
                profile.calmGenius += 0.2 * (1 - confidence);
                profile.oracle += 0.3 * confidence;
                profile.confident -= 0.2 * intensity;
                break;
        }

        // Ensure bounds
        Object.keys(profile).forEach(key => {
            profile[key as keyof typeof profile] = Math.max(0, Math.min(1, profile[key as keyof typeof profile]));
        });

        return profile;
    }

    private normalizeProfile(profile: Omit<PersonalityProfile, 'dominant'>): Omit<PersonalityProfile, 'dominant'> {
        const traits = ['calmGenius', 'playful', 'oracle', 'confident', 'empathetic'] as const;
        const sum = traits.reduce((acc, trait) => acc + profile[trait], 0);

        if (sum === 0) {
            const equalValue = 1 / traits.length;
            return traits.reduce((acc, trait) => {
                acc[trait] = equalValue;
                return acc;
            }, {} as Omit<PersonalityProfile, 'dominant'>);
        }

        return traits.reduce((acc, trait) => {
            acc[trait] = profile[trait] / sum;
            return acc;
        }, {} as Omit<PersonalityProfile, 'dominant'>);
    }

    private findDominantTrait(profile: Omit<PersonalityProfile, 'dominant'>): PersonalityProfile['dominant'] {
        const traits = ['calmGenius', 'playful', 'oracle', 'confident', 'empathetic'] as const;
        let maxTrait = traits[0];
        let maxValue = profile[traits[0]];

        for (const trait of traits) {
            if (profile[trait] > maxValue) {
                maxValue = profile[trait];
                maxTrait = trait;
            }
        }
        return maxTrait;
    }

    private blendWithPrevious(current: PersonalityProfile, previous: PersonalityProfile): PersonalityProfile {
        const traits = ['calmGenius', 'playful', 'oracle', 'confident', 'empathetic'] as const;

        const blended = traits.reduce((acc, trait) => {
            acc[trait] = (previous[trait] * (1 - this.blendingSpeed)) + (current[trait] * this.blendingSpeed);
            return acc;
        }, {} as Omit<PersonalityProfile, 'dominant'>);

        const dominant = this.findDominantTrait(blended);

        return { ...blended, dominant };
    }

    private addToHistory(profile: PersonalityProfile): void {
        this.personalityHistory.push({ ...profile });
        if (this.personalityHistory.length > 10) {
            this.personalityHistory.shift();
        }
    }

    public getPersonalityHistory(): PersonalityProfile[] {
        return [...this.personalityHistory];
    }

    public getCurrentProfile(): PersonalityProfile | null {
        return this.personalityHistory.length > 0 ? this.personalityHistory[this.personalityHistory.length - 1] : null;
    }

    public reset(): void {
        this.personalityHistory = [];
    }
}

export const createPersonalityEngine = (): PersonalityEngine => {
    return new PersonalityEngine();
};
