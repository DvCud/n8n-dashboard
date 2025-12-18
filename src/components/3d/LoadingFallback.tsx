'use client';

// ============================================================
// Loading Fallback for 3D Scene
// Displayed while Three.js assets are loading
// ============================================================

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * LoadingFallback - 3D loading indicator
 * Shows an animated ring while the main scene loads
 */
export function LoadingFallback() {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!ringRef.current) return;
        ringRef.current.rotation.z = state.clock.getElapsedTime() * 2;
        ringRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.2;
    });

    return (
        <group>
            {/* Background glow */}
            <ambientLight intensity={0.3} color="#0066ff" />

            {/* Animated loading ring */}
            <mesh ref={ringRef}>
                <torusGeometry args={[2, 0.1, 8, 32, Math.PI * 1.5]} />
                <meshStandardMaterial
                    color="#00fff2"
                    emissive="#00fff2"
                    emissiveIntensity={2}
                />
            </mesh>

            {/* Center orb */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial
                    color="#0066ff"
                    emissive="#0066ff"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </group>
    );
}
