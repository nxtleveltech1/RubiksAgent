import { create } from 'zustand';
import { LEDState, CubeState, EmotionOutput, PersonalityProfile } from '../types';
import { createLEDEngine, LEDEngine } from '../engines/ledEngine';

let ledEngineInstance: LEDEngine | null = null;

const getLEDEngine = (): LEDEngine => {
    if (!ledEngineInstance) ledEngineInstance = createLEDEngine();
    return ledEngineInstance;
};

interface LEDStateStore {
    currentLEDState: LEDState;
    updateLEDs: (cubeState: CubeState, emotion: EmotionOutput, personality: PersonalityProfile) => void;
    getCurrentLEDState: () => LEDState;
}

export const useLEDState = create<LEDStateStore>((set, get) => ({
    currentLEDState: getLEDEngine().getCurrentLEDState(),

    updateLEDs: (cubeState, emotion, personality) => {
        const engine = getLEDEngine();
        const newState = engine.updateLEDs(cubeState, emotion, personality);
        set({ currentLEDState: newState });
    },

    getCurrentLEDState: () => get().currentLEDState
}));
