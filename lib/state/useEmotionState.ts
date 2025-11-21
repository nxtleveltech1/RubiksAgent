import { create } from 'zustand';
import { EmotionOutput, AudioFeatures, EmotionStateData } from '../types';
import { createEmotionEngine, EmotionEngine } from '../engines/emotionEngine';

let emotionEngineInstance: EmotionEngine | null = null;

const getEmotionEngine = (): EmotionEngine => {
    if (!emotionEngineInstance) {
        emotionEngineInstance = createEmotionEngine();
    }
    return emotionEngineInstance;
};

interface EmotionStateStore extends EmotionStateData {
    updateEmotion: (audioFeatures: AudioFeatures) => EmotionOutput;
    reset: () => void;
}

export const useEmotionState = create<EmotionStateStore>((set, get) => ({
    currentEmotion: {
        emotion: 'calm',
        intensity: 0.5,
        stress: 0.2,
        energy: 0.3,
        confidence: 0.5
    },
    emotionHistory: [],
    processingAudio: false,

    updateEmotion: (audioFeatures: AudioFeatures) => {
        const engine = getEmotionEngine();
        const newEmotion = engine.analyzeEmotion(audioFeatures);
        const history = engine.getEmotionHistory();

        set({
            currentEmotion: newEmotion,
            emotionHistory: history
        });

        return newEmotion;
    },

    reset: () => {
        const engine = getEmotionEngine();
        engine.reset();
        set({
            currentEmotion: { emotion: 'calm', intensity: 0.5, stress: 0.2, energy: 0.3, confidence: 0.5 },
            emotionHistory: []
        });
    }
}));
