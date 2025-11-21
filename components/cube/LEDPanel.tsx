'use client';

import React from 'react';
import { PanelContent } from '../../lib/types';

interface LEDPanelProps {
    faceIndex: number;
    panelIndex: number;
    content: PanelContent;
}

export const LEDPanel: React.FC<LEDPanelProps> = ({ faceIndex, panelIndex, content }) => {
    // Calculate position based on face and panel index (simplified placeholder logic)
    // In a real implementation, this would map to specific 3D coordinates on the cube surface

    const getColorForShader = (name?: string) => {
        switch (name) {
            case 'glow': return '#00ffff';
            case 'ripple': return '#0088ff';
            case 'sparkle': return '#ffffff';
            case 'heatmap': return '#ff0000';
            case 'oracle': return '#8800ff';
            default: return '#000000';
        }
    };

    if (content.type === 'none') return null;

    return (
        <mesh position={[0, 0, 0]}> {/* Position would be dynamic */}
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial
                color={content.type === 'shader' ? getColorForShader(content.shaderName) : '#ffffff'}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
};
