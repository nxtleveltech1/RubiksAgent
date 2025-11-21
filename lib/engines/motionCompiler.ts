/**
 * Motion Compiler for AI Cube Avatar
 * Maps cube state, emotion, and personality to motion commands
 */

import { CubeState, EmotionOutput, PersonalityProfile, MotionCommand } from '../types';

export class MotionCompiler {
    private motionHistory: MotionCommand[][] = [];
    private commandQueue: MotionCommand[] = [];
    private listeningPatterns: Map<string, MotionCommand[]> = new Map();
    private thinkingPatterns: Map<string, MotionCommand[]> = new Map();
    private respondingPatterns: Map<string, MotionCommand[]> = new Map();
    private idlePatterns: Map<string, MotionCommand[]> = new Map();

    constructor() {
        this.initializePatterns();
    }

    public compileMotions(
        cubeState: CubeState,
        emotion: EmotionOutput,
        personality: PersonalityProfile
    ): MotionCommand[] {
        let baseCommands: MotionCommand[] = [];

        if (cubeState === 'listening') {
            baseCommands = this.listeningPatterns.get(emotion.emotion) || this.listeningPatterns.get('calm') || [];
        } else if (cubeState === 'thinking') {
            baseCommands = this.thinkingPatterns.get(personality.dominant) || this.thinkingPatterns.get('calmGenius') || [];
        } else if (cubeState === 'responding') {
            baseCommands = this.respondingPatterns.get(emotion.emotion) || this.respondingPatterns.get('calm') || [];
        } else {
            baseCommands = this.idlePatterns.get(personality.dominant) || this.idlePatterns.get('calmGenius') || [];
        }

        // Blend: Reflex (20%) + Expressive (60%) + Modifiers (20%)
        const reflexCommands = this.generateReflexResponse(emotion);
        const modifierCommands = this.generateModifiers(cubeState, emotion, personality);

        const blendedCommands = this.blendMotionCommands(
            reflexCommands,
            baseCommands,
            modifierCommands,
            0.2, 0.6, 0.2
        );

        const finalCommands = this.finalizeCommands(blendedCommands);

        this.motionHistory.push([...finalCommands]);
        if (this.motionHistory.length > 10) this.motionHistory.shift();
        this.commandQueue = [...finalCommands];

        return finalCommands;
    }

    private initializePatterns(): void {
        // Initialize sample patterns (simplified for brevity, would contain full library)
        this.listeningPatterns.set('excited', [
            { target: 'global', axis: 'y', value: 1.5, duration: 500, easing: 'easeOutBounce' },
            { target: 'V2', axis: 'z', value: 1.25, duration: 400, easing: 'easeInOutQuad' }
        ]);
        this.listeningPatterns.set('calm', [
            { target: 'global', axis: 'y', value: 0.4, duration: 2500, easing: 'easeInOutSine' }
        ]);

        this.thinkingPatterns.set('calmGenius', [
            { target: 'global', axis: 'y', value: 1.5, duration: 4000, easing: 'easeInOutSine' },
            { target: 'H1', axis: 'y', value: 0.75, duration: 3500, easing: 'easeInOutSine' }
        ]);

        this.respondingPatterns.set('angry', [
            { target: 'global', axis: 'y', value: 2.5, duration: 800, easing: 'easeOutCubic' },
            { target: 'H1', axis: 'y', value: -1.5, duration: 600, easing: 'easeOutCubic' }
        ]);

        this.idlePatterns.set('playful', [
            { target: 'global', axis: 'y', value: 0.75, duration: 3000, easing: 'easeInOutSine' },
            { target: 'V2', axis: 'z', value: 0.4, duration: 3500, easing: 'easeInOutSine' }
        ]);
    }

    private generateReflexResponse(emotion: EmotionOutput): MotionCommand[] {
        const { emotion: emotionType, intensity } = emotion;
        const commands: MotionCommand[] = [];

        if (emotionType === 'angry') {
            commands.push({ target: 'global', axis: 'x', value: -0.25 * intensity, duration: 300, easing: 'easeOutCubic' });
        } else if (emotionType === 'excited') {
            commands.push({ target: 'global', axis: 'y', value: 0.5 * intensity, duration: 200, easing: 'easeOutBounce' });
        }

        return commands;
    }

    private generateModifiers(cubeState: CubeState, emotion: EmotionOutput, personality: PersonalityProfile): MotionCommand[] {
        const commands: MotionCommand[] = [];
        if (cubeState === 'responding' && personality.empathetic > 0.5) {
            commands.push({ target: 'global', axis: 'x', value: 0.05 * personality.empathetic, duration: 800, easing: 'easeInOutSine' });
        }
        return commands;
    }

    private blendMotionCommands(
        reflex: MotionCommand[],
        expressive: MotionCommand[],
        modifier: MotionCommand[],
        wReflex: number,
        wExpressive: number,
        wModifier: number
    ): MotionCommand[] {
        const blended: MotionCommand[] = [];
        const map = new Map<string, MotionCommand>();
        const getKey = (c: MotionCommand) => `${c.target}-${c.axis}`;

        const add = (cmds: MotionCommand[], w: number) => {
            cmds.forEach(cmd => {
                const key = getKey(cmd);
                const existing = map.get(key);
                if (existing) {
                    map.set(key, {
                        ...cmd,
                        value: existing.value + (cmd.value * w),
                        duration: Math.max(existing.duration, cmd.duration)
                    });
                } else {
                    map.set(key, { ...cmd, value: cmd.value * w });
                }
            });
        };

        add(reflex, wReflex);
        add(expressive, wExpressive);
        add(modifier, wModifier);

        map.forEach(c => blended.push(c));
        return blended.length > 0 ? blended : expressive;
    }

    private finalizeCommands(commands: MotionCommand[]): MotionCommand[] {
        return commands.map(cmd => ({
            ...cmd,
            value: Math.max(-5.0, Math.min(5.0, cmd.value)),
            duration: Math.max(100, Math.min(10000, cmd.duration))
        }));
    }

    public reset(): void {
        this.motionHistory = [];
        this.commandQueue = [];
    }
}

export const createMotionCompiler = (): MotionCompiler => {
    return new MotionCompiler();
};
