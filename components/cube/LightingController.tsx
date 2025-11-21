'use client';

import React from 'react';
import { useLightingState } from '../../lib/state/useLightingState';

export const LightingController: React.FC = () => {
    const { currentLighting } = useLightingState();
    const { glowColor, glowIntensity, edgeColor, moodColor } = currentLighting;

    return (
        <group>
            {/* Main ambient glow */}
            <ambientLight intensity={0.2} />

            {/* Dynamic mood lighting */}
            <pointLight
                position={[10, 10, 10]}
                color={glowColor}
                intensity={glowIntensity}
                distance={20}
                decay={2}
            />

            <pointLight
                position={[-10, -10, -10]}
                color={moodColor}
                intensity={glowIntensity * 0.5}
                distance={20}
                decay={2}
            />

            {/* Rim lighting for edges */}
            <spotLight
                position={[0, 10, 0]}
                color={edgeColor}
                intensity={glowIntensity * 0.8}
                angle={0.5}
                penumbra={1}
            />
        </group>
    );
};
