import { create } from 'zustand';
import { LightingState, CubeState, EmotionOutput, PersonalityProfile } from '../types';
import { createLightingEngine, LightingEngine } from '../engines/lightingEngine';

let lightingEngineInstance: LightingEngine | null = null;

const getLightingEngine = (): LightingEngine => {
    if (!lightingEngineInstance) lightingEngineInstance = createLightingEngine();
    return lightingEngineInstance;
};

interface LightingStateStore {
    currentLighting: LightingState;
    updateLighting: (cubeState: CubeState, emotion: EmotionOutput, personality: PersonalityProfile, delta: number) => void;
    getCurrentLighting: () => LightingState;
}

export const useLightingState = create<LightingStateStore>((set, get) => ({
    currentLighting: getLightingEngine().getCurrentLighting(),

    updateLighting: (cubeState, emotion, personality, delta) => {
        const engine = getLightingEngine();
        const newLighting = engine.updateLighting(cubeState, emotion, personality, delta);
        set({ currentLighting: newLighting });
    },

    getCurrentLighting: () => get().currentLighting
}));
