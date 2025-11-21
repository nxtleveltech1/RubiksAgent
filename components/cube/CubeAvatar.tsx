'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

// Stores
import { useCubeState } from '../../lib/state/useCubeState';
import { useEmotionState } from '../../lib/state/useEmotionState';
import { usePersonalityState } from '../../lib/state/usePersonalityState';
import { useMotionState } from '../../lib/state/useMotionState';
import { useLightingState } from '../../lib/state/useLightingState';
import { useLEDState } from '../../lib/state/useLEDState';

// Components
import { MotionDriver } from './MotionDriver';
// import { RubiksCube } from '../rubiks-cube'; // Assumed existing
// import { LEDPanel } from './LEDPanel'; // Assumed existing or to be created

// Mock Audio Features for demo
const mockAudio = () => ({
    volume: Math.random(),
    pitch: Math.random(),
    variability: Math.random(),
    spectralCentroid: Math.random(),
    energy: Math.random(),
    attack: Math.random()
});

const CubeScene = () => {
    const { updateState } = useCubeState();
    const { updateEmotion } = useEmotionState();
    const { updatePersonality } = usePersonalityState();
    const { updateMotions } = useMotionState();
    const { updateLighting, getCurrentLighting } = useLightingState();
    const { updateLEDs, getCurrentLEDState } = useLEDState();

    const cubeRef = useRef(null);

    useFrame((state, delta) => {
        // 1. Process Audio (Mock for now)
        const audioFeatures = mockAudio();

        // 2. Update Engines Pipeline
        const emotion = updateEmotion(audioFeatures);
        const personality = updatePersonality(emotion);
        const cubeState = updateState(emotion, personality);
        const motions = updateMotions(cubeState, emotion, personality);

        updateLighting(cubeState, emotion, personality, delta * 1000);
        updateLEDs(cubeState, emotion, personality);
    });

    const lighting = getCurrentLighting();
    const ledState = getCurrentLEDState();
    const motions = useMotionState(s => s.activeCommands);

    return (
        <>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} color={lighting.glowColor} intensity={lighting.glowIntensity} />

            <MotionDriver commands={motions} cubeRef={cubeRef}>
                {/* Placeholder for actual RubiksCube component */}
                <mesh ref={cubeRef}>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color={lighting.moodColor} />
                </mesh>
            </MotionDriver>
        </>
    );
};

export const CubeAvatar = () => {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas camera={{ position: [5, 5, 5] }}>
                <CubeScene />
                <OrbitControls />
            </Canvas>
        </div>
    );
};

export default CubeAvatar;
