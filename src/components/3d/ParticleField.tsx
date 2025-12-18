'use client';

// ============================================================
// Particle Field Component
// Creates an animated particle background for the 3D scene
// ============================================================

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
    count?: number;
    size?: number;
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

    // Generate initial particle positions and velocities
    const { positions, colors, velocities } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        const colorPalette = [
            new THREE.Color('#00fff2'), // Cyan
            new THREE.Color('#bd00ff'), // Purple
            new THREE.Color('#0066ff'), // Blue
            new THREE.Color('#00ff6b'), // Green
        ];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Spherical distribution
            const radius = 30 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Random velocities for each particle
            velocities[i3] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

            // Random color from palette
            const particleColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i3] = particleColor.r;
            colors[i3 + 1] = particleColor.g;
            colors[i3 + 2] = particleColor.b;
        }

        return { positions, colors, velocities };
    }, [count]);

    // Store velocities in ref
    useEffect(() => {
        velocitiesRef.current = velocities;
    }, [velocities]);

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
        if (!pointsRef.current || !geometryRef.current || !velocitiesRef.current) return;

        const posAttr = geometryRef.current.attributes.position;
        if (!posAttr) return;

        const pos = posAttr.array as Float32Array;
        const vel = velocitiesRef.current;
        const time = state.clock.getElapsedTime();

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Apply velocity with sinusoidal modulation
            pos[i3] += vel[i3] + Math.sin(time * 0.5 + i) * 0.002;
            pos[i3 + 1] += vel[i3 + 1] + Math.cos(time * 0.3 + i) * 0.002;
            pos[i3 + 2] += vel[i3 + 2] + Math.sin(time * 0.4 + i) * 0.002;

            // Wrap particles that go too far
            const distance = Math.sqrt(
                pos[i3] ** 2 + pos[i3 + 1] ** 2 + pos[i3 + 2] ** 2
            );

            if (distance > 80 || distance < 20) {
                // Reset to random position in shell
                const radius = 30 + Math.random() * 40;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
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
