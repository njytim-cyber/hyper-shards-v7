import React, { useState } from 'react';
import { ParticleSystemView } from '../../views/ParticleSystemView';

export const ParticleContainer: React.FC = () => {
    const [particleCount] = useState(1000);
    const [color] = useState<[number, number, number, number]>([0.0, 1.0, 1.0, 1.0]); // Cyan

    return (
        <div id="particle-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            <ParticleSystemView particleCount={particleCount} color={color} />
        </div>
    );
};
