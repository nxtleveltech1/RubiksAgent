'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MotionCommand } from '../../lib/types';

interface MotionDriverProps {
    commands: MotionCommand[];
    cubeRef?: React.RefObject<any>; // RubiksCubeHandle
    children?: React.ReactNode;
}

export const MotionDriver: React.FC<MotionDriverProps> = ({
    commands,
    cubeRef,
    children
}) => {
    const activeAnimations = useRef<Map<string, { start: number; duration: number; command: MotionCommand }>>(new Map());
    const globalRotationRef = useRef<THREE.Group>(null);

    useEffect(() => {
        const now = Date.now();
        commands.forEach((command) => {
            const key = `${command.target}-${command.axis}`;
            activeAnimations.current.set(key, {
                start: now,
                duration: command.duration,
                command
            });
        });
    }, [commands]);

    useFrame((state) => {
        if (!globalRotationRef.current) return;

        const time = state.clock.elapsedTime;
        const now = Date.now();

        // Process animations
        activeAnimations.current.forEach((anim, key) => {
            const { start, duration, command } = anim;
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / duration);

            // Simple easing (can be expanded)
            const eased = Math.sin(progress * Math.PI * 0.5);
            const value = command.value * eased;

            if (command.target === 'global') {
                if (command.axis === 'x') globalRotationRef.current!.rotation.x = value;
                if (command.axis === 'y') globalRotationRef.current!.rotation.y = value;
                if (command.axis === 'z') globalRotationRef.current!.rotation.z = value;
            } else {
                // Handle internal layer rotations if cubeRef is available
                // This requires the RubiksCube component to expose specific methods
            }

            // Cleanup finished animations
            if (progress >= 1) {
                activeAnimations.current.delete(key);
            }
        });

        // Idle motion if no active commands
        if (activeAnimations.current.size === 0) {
            globalRotationRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
        }
    });

    return (
        <group ref={globalRotationRef}>
            {children}
        </group>
    );
};
