/**
 * LED Panel Engine for AI Cube Avatar
 * Manages 54 LED panels
 */

import { CubeState, EmotionOutput, PersonalityProfile, LEDState, PanelContent } from '../types';

export class LEDEngine {
    private currentLEDState: LEDState;

    constructor() {
        this.currentLEDState = this.createDefaultLEDState();
    }

    public updateLEDs(
        cubeState: CubeState,
        emotion: EmotionOutput,
        personality: PersonalityProfile
    ): LEDState {
        // Simplified logic: Set pattern based on state
        let shaderName = 'glow';
        let syncMode: 'global' | 'tile' | 'face' = 'global';

        if (cubeState === 'listening') {
            shaderName = 'ripple';
            syncMode = 'tile';
        } else if (cubeState === 'thinking') {
            shaderName = 'oracle';
            syncMode = 'face';
        } else if (cubeState === 'responding') {
            shaderName = 'sparkle';
            syncMode = 'global';
        }

        // Personality overrides
        if (personality.dominant === 'playful') shaderName = 'sparkle';
        if (personality.dominant === 'calmGenius') shaderName = 'heatmap';

        // Apply to all faces
        const content: PanelContent = { type: 'shader', shaderName, syncMode };
        const face = Array(9).fill(content);

        this.currentLEDState = {
            face0: face,
            face1: face,
            face2: face,
            face3: face,
            face4: face,
            face5: face
        };

        return this.currentLEDState;
    }

    private createDefaultLEDState(): LEDState {
        const empty = Array(9).fill({ type: 'none' });
        return {
            face0: empty, face1: empty, face2: empty, face3: empty, face4: empty, face5: empty
        };
    }

    public getCurrentLEDState(): LEDState {
        return { ...this.currentLEDState };
    }
}

export const createLEDEngine = (): LEDEngine => {
    return new LEDEngine();
};
