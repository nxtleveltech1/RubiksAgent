import React from 'react';
import { motion } from 'framer-motion';

const AvatarSwitch = ({ mode, setMode }) => {
    const isSentient = mode === 'sentient';

    return (
        <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            gap: '1rem',
            background: 'rgba(10, 10, 10, 0.8)',
            padding: '0.5rem',
            borderRadius: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
        }}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('cube')}
                style={{
                    background: !isSentient ? '#00ffff' : 'transparent',
                    color: !isSentient ? '#000' : '#fff',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '1.5rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease'
                }}
            >
                CUBE
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('sentient')}
                style={{
                    background: isSentient ? '#00ffff' : 'transparent',
                    color: isSentient ? '#000' : '#fff',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '1.5rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                    boxShadow: isSentient ? '0 0 20px rgba(0, 255, 255, 0.5)' : 'none'
                }}
            >
                SENTIENT
            </motion.button>
        </div>
    );
};

export default AvatarSwitch;
