'use client';

// ============================================================
// Loading Screen Component
// Full-screen loading overlay during initial data fetch
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowStore } from '@/stores/workflowStore';

/**
 * LoadingScreen - Animated loading overlay
 * Shows while workflows are being fetched from GitHub
 */
export function LoadingScreen() {
    const { isLoading, workflows } = useWorkflowStore();

    // Only show on initial load
    const showLoading = isLoading && workflows.length === 0;

    return (
        <AnimatePresence>
            {showLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="fixed inset-0 z-[100] bg-[#0a0a1a] flex flex-col items-center justify-center"
                >
                    {/* Animated background gradients */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-500" />
                    </div>

                    {/* Loading content */}
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Animated logo */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative mb-8"
                        >
                            {/* Outer ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                className="w-24 h-24 rounded-full border-2 border-cyan-500/30"
                                style={{
                                    borderTopColor: '#00fff2',
                                    borderRightColor: 'transparent',
                                }}
                            />

                            {/* Inner ring */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-3 rounded-full border-2 border-purple-500/30"
                                style={{
                                    borderBottomColor: '#bd00ff',
                                    borderLeftColor: 'transparent',
                                }}
                            />

                            {/* Center icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
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
                            </div>
                        </motion.div>

                        {/* Text */}
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl font-bold text-white mb-2"
                        >
                            n8n Workflow Gallery
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-gray-400 text-sm"
                        >
                            Loading automation workflows...
                        </motion.p>

                        {/* Animated dots */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="flex gap-1 mt-4"
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                    className="w-2 h-2 rounded-full bg-cyan-500"
                                />
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
