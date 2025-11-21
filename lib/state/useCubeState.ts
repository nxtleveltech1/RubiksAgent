import { create } from 'zustand';
import { CubeState, EmotionOutput, PersonalityProfile } from '../types';

interface CubeStateStore {
    currentState: CubeState;
    updateState: (emotion: EmotionOutput, personality: PersonalityProfile) => CubeState;
}

export const useCubeState = create<CubeStateStore>((set) => ({
    currentState: 'idle',
    updateState: (emotion, personality) => {
        let newState: CubeState = 'idle';

        if (emotion.intensity > 0.6) {
            newState = 'responding';
        } else if (emotion.emotion === 'confused') {
            newState = 'thinking';
        } else if (emotion.intensity > 0.3) {
            newState = 'listening';
        }

        set({ currentState: newState });
        return newState;
    }
}));
