'use client';

// ============================================================
// Galaxy View - 3D Workflow Visualization
// Displays workflow cards orbiting in a galaxy-like formation
// ============================================================

import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorkflowStore } from '@/stores/workflowStore';
import { fetchAllWorkflows, calculateGalaxyPositions } from '@/lib/api';
import { WorkflowCard3D } from './WorkflowCard3D';
import type { WorkflowMetadata } from '@/types/workflow';
import * as THREE from 'three';

/**
 * Category color mapping for visual distinction
 */
const CATEGORY_COLORS: Record<string, string> = {
    ai: '#00fff2',       // Cyan for AI/ML
    seo: '#ff6b00',      // Orange for SEO
    hr: '#bd00ff',       // Purple for HR
    'lead-gen': '#00ff6b', // Green for lead generation
    monitoring: '#ff0066', // Pink for monitoring
    data: '#0066ff',     // Blue for data
    other: '#ffffff',    // White for uncategorized
};

/**
 * GalaxyView - Container component for all workflow cards
 */
export function GalaxyView() {
    const { workflows, setWorkflows, setLoading, setError, viewMode } = useWorkflowStore();

    // Fetch workflows on mount
    useEffect(() => {
        async function loadWorkflows() {
            setLoading(true);
            try {
                const data = await fetchAllWorkflows();
                const positioned = calculateGalaxyPositions(data);
                setWorkflows(positioned);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to load workflows');
            }
        }

        if (workflows.length === 0) {
            loadWorkflows();
        }
    }, [setWorkflows, setLoading, setError, workflows.length]);

    // Create central orb geometry
    const centralGeometry = useMemo(() => {
        return new THREE.IcosahedronGeometry(2, 2);
    }, []);

    if (viewMode === 'technical') {
        return <TechnicalGridView workflows={workflows} />;
    }

    return (
        <group>
            {/* Central glowing orb */}
            <mesh geometry={centralGeometry}>
                <meshStandardMaterial
                    color="#0066ff"
                    emissive="#0066ff"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.6}
                    wireframe
                />
            </mesh>

            {/* Inner energy sphere */}
            <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial
                    color="#00fff2"
                    emissive="#00fff2"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Orbital rings */}
            {[8, 11, 14].map((radius, i) => (
                <mesh key={radius} rotation={[Math.PI / 2, 0, i * 0.3]}>
                    <torusGeometry args={[radius, 0.02, 8, 100]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.15}
                        emissive="#00fff2"
                        emissiveIntensity={0.2}
                    />
                </mesh>
            ))}

            {/* Workflow cards */}
            {workflows.map((workflow, index) => (
                <WorkflowCard3D
                    key={workflow.id}
                    workflow={workflow}
                    color={CATEGORY_COLORS[workflow.category] || '#ffffff'}
                    index={index}
                />
            ))}

            {/* Category labels */}
            <CategoryLabels />
        </group>
    );
}

/**
 * TechnicalGridView - Alternative flat grid layout
 */
function TechnicalGridView({ workflows }: { workflows: WorkflowMetadata[] }) {
    const cols = 4;
    const spacing = 5;

    return (
        <group position={[-((cols - 1) * spacing) / 2, 0, 0]}>
            {workflows.map((workflow, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;

                return (
                    <WorkflowCard3D
                        key={workflow.id}
                        workflow={{
                            ...workflow,
                            position: {
                                x: col * spacing,
                                y: 0,
                                z: row * spacing - (Math.ceil(workflows.length / cols) * spacing) / 2,
                            },
                        }}
                        color={CATEGORY_COLORS[workflow.category] || '#ffffff'}
                        index={index}
                    />
                );
            })}
        </group>
    );
}

/**
 * CategoryLabels - 3D text labels for workflow categories
 */
function CategoryLabels() {
    const { settings } = useWorkflowStore();

    if (!settings.showLabels) return null;

    const labels = [
        { text: 'AI / ML', position: [12, 4, 0] as [number, number, number], color: '#00fff2' },
        { text: 'SEO', position: [6, 4, 10] as [number, number, number], color: '#ff6b00' },
        { text: 'HR', position: [-6, 4, 10] as [number, number, number], color: '#bd00ff' },
        { text: 'Lead Gen', position: [-12, 4, 0] as [number, number, number], color: '#00ff6b' },
        { text: 'Monitoring', position: [-6, 4, -10] as [number, number, number], color: '#ff0066' },
        { text: 'Data', position: [6, 4, -10] as [number, number, number], color: '#0066ff' },
    ];

    return (
        <>
            {labels.map((label) => (
                <mesh key={label.text} position={label.position}>
                    <sphereGeometry args={[0.15, 8, 8]} />
                    <meshStandardMaterial
                        color={label.color}
                        emissive={label.color}
                        emissiveIntensity={2}
                    />
                </mesh>
            ))}
        </>
    );
}
