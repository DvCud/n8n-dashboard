'use client';

// ============================================================
// Particle Field Component
// Creates an animated particle background for the 3D scene
// Uses deterministic seeded random for React purity
// ============================================================

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
    count?: number;
    size?: number;
}

/**
 * Seeded pseudo-random number generator for deterministic randomness
 * This ensures React component purity (same input = same output)
 */
function seededRandom(seed: number): number {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
}

/**
 * ParticleField - Animated particle cloud
 * Creates a dreamy, floating particle effect for depth and atmosphere
 */
export function ParticleField({
    count = 1000,
    size = 0.03
}: ParticleFieldProps) {
    const pointsRef = useRef<THREE.Points>(null);
    const geometryRef = useRef<THREE.BufferGeometry>(null);
    const velocitiesRef = useRef<Float32Array | null>(null);
    // Store reset seeds for deterministic re-randomization
    const resetSeedsRef = useRef<Float32Array | null>(null);

    // Generate initial particle positions, velocities, and reset seeds using seeded random
    const { positions, colors, velocities, resetSeeds } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const resetSeeds = new Float32Array(count * 3);

        const colorPalette = [
            new THREE.Color('#00fff2'), // Cyan
            new THREE.Color('#bd00ff'), // Purple
            new THREE.Color('#0066ff'), // Blue
            new THREE.Color('#00ff6b'), // Green
        ];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const seed = i + 1; // Use index as base seed

            // Spherical distribution using seeded random
            const radius = 30 + seededRandom(seed) * 50;
            const theta = seededRandom(seed + 1000) * Math.PI * 2;
            const phi = Math.acos(2 * seededRandom(seed + 2000) - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Deterministic velocities for each particle
            velocities[i3] = (seededRandom(seed + 3000) - 0.5) * 0.01;
            velocities[i3 + 1] = (seededRandom(seed + 4000) - 0.5) * 0.01;
            velocities[i3 + 2] = (seededRandom(seed + 5000) - 0.5) * 0.01;

            // Pre-generate reset seeds for when particles need to be repositioned
            resetSeeds[i3] = seededRandom(seed + 6000);
            resetSeeds[i3 + 1] = seededRandom(seed + 7000);
            resetSeeds[i3 + 2] = seededRandom(seed + 8000);

            // Deterministic color from palette
            const colorIndex = Math.floor(seededRandom(seed + 9000) * colorPalette.length);
            const particleColor = colorPalette[colorIndex];
            colors[i3] = particleColor.r;
            colors[i3 + 1] = particleColor.g;
            colors[i3 + 2] = particleColor.b;
        }

        return { positions, colors, velocities, resetSeeds };
    }, [count]);

    // Store velocities and reset seeds in refs
    useEffect(() => {
        velocitiesRef.current = velocities;
        resetSeedsRef.current = resetSeeds;
    }, [velocities, resetSeeds]);

    // Setup geometry attributes
    useEffect(() => {
        if (geometryRef.current) {
            geometryRef.current.setAttribute(
                'position',
                new THREE.BufferAttribute(positions, 3)
            );
            geometryRef.current.setAttribute(
                'color',
                new THREE.BufferAttribute(colors, 3)
            );
        }
    }, [positions, colors]);

    // Animate particles
    useFrame((state) => {
        if (!pointsRef.current || !geometryRef.current || !velocitiesRef.current || !resetSeedsRef.current) return;

        const posAttr = geometryRef.current.attributes.position;
        if (!posAttr) return;

        const pos = posAttr.array as Float32Array;
        const vel = velocitiesRef.current;
        const seeds = resetSeedsRef.current;
        const time = state.clock.getElapsedTime();

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Apply velocity with sinusoidal modulation
            pos[i3] += vel[i3] + Math.sin(time * 0.5 + i) * 0.002;
            pos[i3 + 1] += vel[i3 + 1] + Math.cos(time * 0.3 + i) * 0.002;
            pos[i3 + 2] += vel[i3 + 2] + Math.sin(time * 0.4 + i) * 0.002;

            // Wrap particles that go too far using pre-computed seeds (deterministic)
            const distance = Math.sqrt(
                pos[i3] ** 2 + pos[i3 + 1] ** 2 + pos[i3 + 2] ** 2
            );

            if (distance > 80 || distance < 20) {
                // Reset using pre-computed deterministic values
                const radius = 30 + seeds[i3] * 40;
                const theta = seeds[i3 + 1] * Math.PI * 2;
                const phi = Math.acos(2 * seeds[i3 + 2] - 1);
                pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
                pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                pos[i3 + 2] = radius * Math.cos(phi);
            }
        }

        posAttr.needsUpdate = true;

        // Slow rotation of entire particle field
        pointsRef.current.rotation.y = time * 0.02;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry ref={geometryRef} />
            <pointsMaterial
                size={size}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}
