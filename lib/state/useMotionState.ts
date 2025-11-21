import { create } from 'zustand';
import { MotionCommand, MotionStateData, CubeState, EmotionOutput, PersonalityProfile } from '../types';
import { createMotionCompiler, MotionCompiler } from '../engines/motionCompiler';

let motionCompilerInstance: MotionCompiler | null = null;

const getMotionCompiler = (): MotionCompiler => {
    if (!motionCompilerInstance) {
        motionCompilerInstance = createMotionCompiler();
    }
    return motionCompilerInstance;
};

interface MotionStateStore extends MotionStateData {
    updateMotions: (cubeState: CubeState, emotion: EmotionOutput, personality: PersonalityProfile) => MotionCommand[];
    reset: () => void;
}

export const useMotionState = create<MotionStateStore>((set, get) => ({
    activeCommands: [],
    queueLength: 0,
    lastUpdateTime: 0,

    updateMotions: (cubeState, emotion, personality) => {
        const compiler = getMotionCompiler();
        const commands = compiler.compileMotions(cubeState, emotion, personality);

        set({
            activeCommands: commands,
            queueLength: commands.length,
            lastUpdateTime: Date.now()
        });

        return commands;
    },

    reset: () => {
        getMotionCompiler().reset();
        set({ activeCommands: [], queueLength: 0 });
    }
}));
