'use client';

// ============================================================
// Main 3D Scene Component
// Wraps the Three.js canvas with all necessary providers
// ============================================================

import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useWorkflowStore } from '@/stores/workflowStore';
import { GalaxyView } from './GalaxyView';
import { ParticleField } from './ParticleField';
import { LoadingFallback } from './LoadingFallback';

/**
 * SceneContent - The actual 3D scene content
 * Separated for proper Suspense boundaries
 */
function SceneContent() {
    const { settings, viewMode } = useWorkflowStore();
    const controlsRef = useRef(null);

    return (
        <>
            {/* Main camera with perspective view */}
            <PerspectiveCamera
                makeDefault
                position={[0, 15, 30]}
                fov={60}
                near={0.1}
                far={1000}
            />

            {/* Orbit controls for user interaction */}
            <OrbitControls
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={settings.autoRotate && viewMode === 'galaxy'}
                autoRotateSpeed={0.3}
                minDistance={10}
                maxDistance={80}
                maxPolarAngle={Math.PI * 0.85}
                dampingFactor={0.05}
                enableDamping
            />

            {/* Lighting system */}
            <ambientLight intensity={0.2} color="#1a1a3e" />
            <pointLight position={[20, 20, 20]} intensity={0.8} color="#00fff2" />
            <pointLight position={[-20, -10, -20]} intensity={0.5} color="#bd00ff" />
            <pointLight position={[0, 30, 0]} intensity={0.4} color="#0066ff" />

            {/* Starfield background */}
            <Stars
                radius={150}
                depth={80}
                count={3000}
                factor={4}
                saturation={0}
                fade
                speed={0.5}
            />

            {/* Dynamic particle field */}
            <ParticleField count={settings.particleDensity === 'high' ? 2000 : settings.particleDensity === 'medium' ? 1000 : 500} />

            {/* Main workflow visualization */}
            <GalaxyView />

            {/* Post-processing effects */}
            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.2}
                    luminanceSmoothing={0.9}
                    intensity={0.8}
                    mipmapBlur
                />
                <Vignette eskil={false} offset={0.1} darkness={0.8} />
            </EffectComposer>
        </>
    );
}

/**
 * Scene - Main exportable component
 * Sets up the Three.js canvas with proper configuration
 */
export function Scene() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                    stencil: false,
                }}
                dpr={[1, 2]} // Responsive DPR
                shadows={false} // Disable shadows for performance
                style={{ background: '#0a0a1a' }}
            >
                <Suspense fallback={<LoadingFallback />}>
                    <SceneContent />
                </Suspense>
            </Canvas>
        </div>
    );
}
