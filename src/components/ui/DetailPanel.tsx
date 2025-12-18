'use client';

// ============================================================
// Detail Panel Component
// Slide-out panel showing selected workflow details
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowStore, useSelectedWorkflow } from '@/stores/workflowStore';

/**
 * Category display names and colors
 */
const CATEGORY_INFO: Record<string, { label: string; color: string }> = {
    ai: { label: 'AI / Machine Learning', color: '#00fff2' },
    seo: { label: 'SEO & Marketing', color: '#ff6b00' },
    hr: { label: 'Human Resources', color: '#bd00ff' },
    'lead-gen': { label: 'Lead Generation', color: '#00ff6b' },
    monitoring: { label: 'System Monitoring', color: '#ff0066' },
    data: { label: 'Data Processing', color: '#0066ff' },
    other: { label: 'General', color: '#ffffff' },
};

/**
 * DetailPanel - Workflow information sidebar
 * Slides in from right when a workflow is selected
 */
export function DetailPanel() {
    const { isDetailPanelOpen, closeDetailPanel } = useWorkflowStore();
    const selectedWorkflow = useSelectedWorkflow();

    return (
        <AnimatePresence>
            {isDetailPanelOpen && selectedWorkflow && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={closeDetailPanel}
                    />

                    {/* Panel */}
                    <motion.aside
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-hidden"
                    >
                        <div className="h-full glass-panel-solid m-4 rounded-2xl flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Category badge */}
                                        <div
                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
                                            style={{
                                                backgroundColor: `${CATEGORY_INFO[selectedWorkflow.category]?.color}20`,
                                                color: CATEGORY_INFO[selectedWorkflow.category]?.color,
                                            }}
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: CATEGORY_INFO[selectedWorkflow.category]?.color }}
                                            />
                                            {CATEGORY_INFO[selectedWorkflow.category]?.label}
                                        </div>

                                        <h2 className="text-xl font-bold text-white leading-tight">
                                            {selectedWorkflow.name}
                                        </h2>
                                    </div>

                                    {/* Close button */}
                                    <button
                                        onClick={closeDetailPanel}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Description */}
                                <section>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        Description
                                    </h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {selectedWorkflow.description}
                                    </p>
                                </section>

                                {/* Stats Grid */}
                                <section className="grid grid-cols-2 gap-3">
                                    <StatCard
                                        label="Nodes"
                                        value={selectedWorkflow.nodeCount.toString()}
                                        icon={
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                        }
                                    />
                                    <StatCard
                                        label="Size"
                                        value={`${(selectedWorkflow.size / 1024).toFixed(1)}KB`}
                                        icon={
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        }
                                    />
                                </section>

                                {/* Node Types */}
                                <section>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        Node Types Used
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedWorkflow.nodeTypes.slice(0, 10).map((type) => {
                                            const cleanType = type
                                                .replace('n8n-nodes-base.', '')
                                                .replace('@n8n/n8n-nodes-langchain.', '');
                                            return (
                                                <span
                                                    key={type}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300 font-mono"
                                                >
                                                    {cleanType}
                                                </span>
                                            );
                                        })}
                                        {selectedWorkflow.nodeTypes.length > 10 && (
                                            <span className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-500">
                                                +{selectedWorkflow.nodeTypes.length - 10} more
                                            </span>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-white/10">
                                <div className="flex gap-3">
                                    <a
                                        href={selectedWorkflow.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                        </svg>
                                        View on GitHub
                                    </a>
                                    <a
                                        href={selectedWorkflow.rawUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                                        title="Download JSON"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

/**
 * StatCard - Small stat display card
 */
function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
                <div className="text-cyan-400">{icon}</div>
                <div>
                    <p className="text-lg font-bold text-white">{value}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                </div>
            </div>
        </div>
    );
}
