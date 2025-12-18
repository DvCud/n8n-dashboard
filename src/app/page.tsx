'use client';

// ============================================================
// Main Dashboard Page
// Entry point for the 3D workflow visualization
// ============================================================

import dynamic from 'next/dynamic';
import { Navigation, DetailPanel, LoadingScreen } from '@/components/ui';

// Dynamically import the 3D Scene to avoid SSR issues with Three.js
const Scene = dynamic(
  () => import('@/components/3d/Scene').then((mod) => ({ default: mod.Scene })),
  {
    ssr: false,
    loading: () => null // LoadingScreen handles the loading state
  }
);

/**
 * Home Page - Main dashboard entry
 * Renders the 3D visualization with overlay UI components
 */
export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0a0a1a]">
      {/* Loading overlay */}
      <LoadingScreen />

      {/* 3D Canvas - fills entire viewport */}
      <Scene />

      {/* UI Overlay */}
      <div className="relative z-10">
        {/* Top navigation */}
        <Navigation />

        {/* Workflow detail panel (slides in from right) */}
        <DetailPanel />

        {/* Bottom info bar */}
        <footer className="fixed bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
          {/* Controls hint */}
          <div className="glass-panel rounded-xl px-4 py-2 pointer-events-auto">
            <p className="text-xs text-gray-400">
              <span className="text-cyan-400 font-medium">Drag</span> to rotate
              <span className="mx-2 text-gray-600">•</span>
              <span className="text-purple-400 font-medium">Scroll</span> to zoom
              <span className="mx-2 text-gray-600">•</span>
              <span className="text-green-400 font-medium">Click</span> to select
            </p>
          </div>

          {/* Credits */}
          <div className="glass-panel rounded-xl px-4 py-2 pointer-events-auto">
            <p className="text-xs text-gray-400">
              Powered by{' '}
              <a
                href="https://n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                n8n
              </a>
              {' '}automation
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
