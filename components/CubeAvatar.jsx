import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Edges } from '@react-three/drei';

const CubeAvatar = () => {
    const meshRef = useRef();

    useFrame((state, delta) => {
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.y += delta * 0.2;
    });

    return (
        <group>
            <Box ref={meshRef} args={[2, 2, 2]}>
                <meshStandardMaterial color="#111" transparent opacity={0.9} roughness={0.1} metalness={0.8} />
                <Edges color="#00ffff" threshold={15} />
            </Box>
            <pointLight position={[10, 10, 10]} intensity={10} color="#00ffff" />
            <ambientLight intensity={0.5} />
        </group>
    );
};

export default CubeAvatar;
