'use client';

// ============================================================
// 3D Workflow Card Component
// Interactive card representing a single workflow in the galaxy
// ============================================================

import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, RoundedBox, Html } from '@react-three/drei';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { WorkflowMetadata } from '@/types/workflow';
import * as THREE from 'three';

interface WorkflowCard3DProps {
    workflow: WorkflowMetadata;
    color: string;
    index: number;
}

/**
 * WorkflowCard3D - Individual workflow visualization
 * Features:
 * - Glassmorphic card appearance
 * - Neon edge glow effect
 * - Hover scaling and rotation
 * - Click to select
 * - Floating animation
 */
export function WorkflowCard3D({ workflow, color, index }: WorkflowCard3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    const { selectWorkflow, hoverWorkflow, selectedWorkflowId } = useWorkflowStore();

    const [isHovered, setIsHovered] = useState(false);

    const isSelected = selectedWorkflowId === workflow.id;

    // Position from calculated galaxy coordinates
    const position = useMemo(() => {
        if (workflow.position) {
            return [workflow.position.x, workflow.position.y, workflow.position.z] as [number, number, number];
        }
        return [0, 0, 0] as [number, number, number];
    }, [workflow.position]);

    // Animation frame - floating and rotation effects
    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.getElapsedTime();

        // Floating animation
        const floatOffset = Math.sin(time * 0.5 + index * 0.5) * 0.3;
        groupRef.current.position.y = (workflow.position?.y || 0) + floatOffset;

        // Subtle rotation
        groupRef.current.rotation.y = Math.sin(time * 0.2 + index) * 0.1;

        // Scale on hover/select
        const targetScale = isSelected ? 1.3 : isHovered ? 1.15 : 1;
        groupRef.current.scale.lerp(
            new THREE.Vector3(targetScale, targetScale, targetScale),
            0.1
        );

        // Glow intensity
        if (glowRef.current) {
            const glowMaterial = glowRef.current.material as THREE.MeshStandardMaterial;
            const targetIntensity = isSelected ? 3 : isHovered ? 2 : 0.8;
            glowMaterial.emissiveIntensity = THREE.MathUtils.lerp(
                glowMaterial.emissiveIntensity,
                targetIntensity,
                0.1
            );
        }
    });

    // Handle interactions
    const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setIsHovered(true);
        hoverWorkflow(workflow.id);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        setIsHovered(false);
        hoverWorkflow(null);
        document.body.style.cursor = 'default';
    };

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        selectWorkflow(isSelected ? null : workflow.id);
    };

    // Truncate workflow name for display
    const displayName = workflow.name.length > 25
        ? workflow.name.slice(0, 22) + '...'
        : workflow.name;

    return (
        <group
            ref={groupRef}
            position={[position[0], position[1], position[2]]}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
        >
            {/* Main card body - glassmorphic effect */}
            <RoundedBox args={[3.5, 2, 0.15]} radius={0.1} smoothness={4}>
                <meshPhysicalMaterial
                    color="#0a0a1a"
                    roughness={0.1}
                    metalness={0.2}
                    transparent
                    opacity={0.85}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    envMapIntensity={0.5}
                />
            </RoundedBox>

            {/* Neon edge glow */}
            <mesh ref={glowRef} position={[0, 0, -0.1]}>
                <planeGeometry args={[3.7, 2.2]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Border frame */}
            <lineSegments position={[0, 0, 0.08]}>
                <edgesGeometry args={[new THREE.BoxGeometry(3.5, 2, 0.01)]} />
                <lineBasicMaterial color={color} transparent opacity={0.8} />
            </lineSegments>

            {/* Workflow name */}
            <Text
                position={[0, 0.5, 0.1]}
                fontSize={0.2}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={3}
                textAlign="center"
            >
                {displayName}
            </Text>

            {/* Node count indicator */}
            <group position={[0, -0.3, 0.1]}>
                <Text
                    fontSize={0.12}
                    color="#888888"
                    anchorX="center"
                    anchorY="middle"
                >
                    {workflow.nodeCount} nodes
                </Text>
            </group>

            {/* Category badge */}
            <group position={[-1.3, 0.7, 0.1]}>
                <mesh>
                    <circleGeometry args={[0.12, 16]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={1.5}
                    />
                </mesh>
            </group>

            {/* Node particles around card */}
            <NodeParticles count={Math.min(workflow.nodeCount, 15)} color={color} />

            {/* Hover tooltip with HTML */}
            {isHovered && (
                <Html
                    position={[0, -1.5, 0]}
                    center
                    distanceFactor={10}
                    style={{
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <div className="px-3 py-1.5 rounded-lg bg-black/80 border border-white/20 backdrop-blur-sm">
                        <p className="text-xs text-cyan-400 font-mono">
                            Click to view details
                        </p>
                    </div>
                </Html>
            )}
        </group>
    );
}

/**
 * NodeParticles - Small orbiting particles representing workflow nodes
 */
function NodeParticles({ count, color }: { count: number; color: string }) {
    const particlesRef = useRef<THREE.Points>(null);
    const geometryRef = useRef<THREE.BufferGeometry>(null);

    // Generate particle positions
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 2 + Math.random() * 0.5;
            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 1;
            pos[i * 3 + 2] = Math.sin(angle) * radius;
        }
        return pos;
    }, [count]);

    // Setup geometry
    useEffect(() => {
        if (geometryRef.current && count > 0) {
            geometryRef.current.setAttribute(
                'position',
                new THREE.BufferAttribute(positions, 3)
            );
        }
    }, [positions, count]);

    // Animate particles
    useFrame((state) => {
        if (!particlesRef.current) return;
        particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    });

    if (count === 0) return null;

    return (
        <points ref={particlesRef}>
            <bufferGeometry ref={geometryRef} />
            <pointsMaterial
                size={0.06}
                color={color}
                transparent
                opacity={0.7}
                sizeAttenuation
            />
        </points>
    );
}
