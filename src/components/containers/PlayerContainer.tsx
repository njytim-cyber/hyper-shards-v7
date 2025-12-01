import React, { useEffect, useRef } from 'react';
import { WebTransportBridge } from '../../bridges/WebTransportBridge';
import { gameEngine } from '../../game/core/GameEngine';

export const PlayerContainer: React.FC = () => {
    const bridgeRef = useRef<WebTransportBridge | null>(null);

    useEffect(() => {
        // Initialize Bridge
        const bridge = new WebTransportBridge({
            url: 'https://localhost:4433/hyper-shards', // Example URL
            onDatagramReceived: (data) => {
                // Handle incoming position updates from other players
                // For now, we just log it or decode it
                // const view = new DataView(data.buffer);
                // const id = view.getUint32(0, true);
                // const x = view.getFloat32(4, true);
                // const y = view.getFloat32(8, true);
                // console.log(`Received update for ${id}: ${x}, ${y}`);
            }
        });

        bridge.connect();
        bridgeRef.current = bridge;

        // Hook into Game Loop for high-frequency updates
        const updateInterval = setInterval(() => {
            if (gameEngine.ship && !gameEngine.ship.dead) {
                // Create packet: ID (4) + X (4) + Y (4) + Rot (4) = 16 bytes
                const buffer = new ArrayBuffer(16);
                const view = new DataView(buffer);

                // Mock ID for local player
                view.setUint32(0, 1, true);
                view.setFloat32(4, gameEngine.ship.x, true);
                view.setFloat32(8, gameEngine.ship.y, true);
                view.setFloat32(12, gameEngine.ship.angle, true);

                bridge.sendDatagram(new Uint8Array(buffer));
            }
        }, 1000 / 60); // 60 Hz updates

        return () => {
            clearInterval(updateInterval);
            bridge.close();
        };
    }, []);

    return null; // Logic-only container, no UI
};
