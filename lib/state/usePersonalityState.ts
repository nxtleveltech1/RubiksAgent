import { create } from 'zustand';
import { PersonalityProfile, PersonalityStateData, EmotionOutput } from '../types';
import { createPersonalityEngine, PersonalityEngine } from '../engines/personalityEngine';

let personalityEngineInstance: PersonalityEngine | null = null;

const getPersonalityEngine = (): PersonalityEngine => {
    if (!personalityEngineInstance) {
        personalityEngineInstance = createPersonalityEngine();
    }
    return personalityEngineInstance;
};

interface PersonalityStateStore extends PersonalityStateData {
    updatePersonality: (emotion: EmotionOutput) => PersonalityProfile;
    reset: () => void;
}

export const usePersonalityState = create<PersonalityStateStore>((set, get) => ({
    currentProfile: {
        calmGenius: 0.3, playful: 0.2, oracle: 0.2, confident: 0.15, empathetic: 0.15, dominant: 'calmGenius'
    },
    previousProfile: {
        calmGenius: 0.3, playful: 0.2, oracle: 0.2, confident: 0.15, empathetic: 0.15, dominant: 'calmGenius'
    },
    blendProgress: 1.0,

    updatePersonality: (emotion: EmotionOutput) => {
        const engine = getPersonalityEngine();
        const { currentProfile } = get();

        const newProfile = engine.computePersonality(emotion, currentProfile);

        set({
            previousProfile: { ...currentProfile },
            currentProfile: newProfile,
            blendProgress: 0
        });

        return newProfile;
    },

    reset: () => {
        getPersonalityEngine().reset();
        // Reset logic...
    }
}));
