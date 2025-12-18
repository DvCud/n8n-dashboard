'use client';

// ============================================================
// Navigation Component
// Glassmorphic top navigation bar with view controls
// ============================================================

import { motion } from 'framer-motion';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { ViewMode } from '@/types/workflow';

/**
 * Navigation - Main header navigation
 * Features glassmorphic design with view mode toggle
 */
export function Navigation() {
    const { viewMode, setViewMode, workflows, isLoading, toggleAudio, settings } = useWorkflowStore();

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        >
            <div className="max-w-7xl mx-auto">
                <div className="glass-panel rounded-2xl px-6 py-3 flex items-center justify-between">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/30 to-purple-600/30 rounded-xl blur-md -z-10" />
                        </div>

                        <div>
                            <h1 className="text-lg font-bold text-white">n8n Workflows</h1>
                            <p className="text-xs text-gray-400">
                                {isLoading ? 'Loading...' : `${workflows.length} automation flows`}
                            </p>
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                        <ViewModeButton
                            mode="galaxy"
                            currentMode={viewMode}
                            onClick={() => setViewMode('galaxy')}
                            icon={
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="3" />
                                    <circle cx="4" cy="12" r="2" opacity="0.5" />
                                    <circle cx="20" cy="12" r="2" opacity="0.5" />
                                    <circle cx="12" cy="4" r="2" opacity="0.5" />
                                    <circle cx="12" cy="20" r="2" opacity="0.5" />
                                </svg>
                            }
                            label="Galaxy"
                        />
                        <ViewModeButton
                            mode="technical"
                            currentMode={viewMode}
                            onClick={() => setViewMode('technical')}
                            icon={
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                </svg>
                            }
                            label="Grid"
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        {/* Audio Toggle */}
                        <button
                            onClick={toggleAudio}
                            className={`p-2.5 rounded-xl transition-all duration-300 ${settings.audioEnabled
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'bg-white/5 text-gray-400 hover:text-white'
                                }`}
                            title={settings.audioEnabled ? 'Mute Audio' : 'Enable Audio'}
                        >
                            {settings.audioEnabled ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            )}
                        </button>

                        {/* GitHub Link */}
                        <a
                            href="https://github.com/DvCud/n8n-workflows"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                            title="View on GitHub"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

/**
 * ViewModeButton - Toggle button for view modes
 */
function ViewModeButton({
    mode,
    currentMode,
    onClick,
    icon,
    label,
}: {
    mode: ViewMode;
    currentMode: ViewMode;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    const isActive = mode === currentMode;

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive
                    ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
