// ============================================================
// Zustand Store for Workflow Dashboard State Management
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WorkflowMetadata, ViewMode, AppSettings, CameraState } from '@/types/workflow';

/**
 * Main application store interface
 */
interface WorkflowStore {
    // Workflow data
    workflows: WorkflowMetadata[];
    isLoading: boolean;
    error: string | null;
    lastFetched: string | null;

    // Selection state
    selectedWorkflowId: string | null;
    hoveredWorkflowId: string | null;

    // View state
    viewMode: ViewMode;
    isDetailPanelOpen: boolean;

    // Camera state for 3D scene
    cameraState: CameraState;

    // Settings (persisted)
    settings: AppSettings;

    // Actions - Workflow data
    setWorkflows: (workflows: WorkflowMetadata[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Actions - Selection
    selectWorkflow: (id: string | null) => void;
    hoverWorkflow: (id: string | null) => void;

    // Actions - View
    setViewMode: (mode: ViewMode) => void;
    toggleDetailPanel: () => void;
    closeDetailPanel: () => void;

    // Actions - Camera
    setCameraState: (state: Partial<CameraState>) => void;
    resetCamera: () => void;

    // Actions - Settings
    updateSettings: (settings: Partial<AppSettings>) => void;
    toggleAudio: () => void;

    // Computed getters
    getSelectedWorkflow: () => WorkflowMetadata | undefined;
    getWorkflowsByCategory: (category: string) => WorkflowMetadata[];
}

/**
 * Default camera position - orbiting view of the galaxy
 */
const DEFAULT_CAMERA_STATE: CameraState = {
    position: [0, 15, 30],
    target: [0, 0, 0],
    zoom: 1,
};

/**
 * Default application settings
 */
const DEFAULT_SETTINGS: AppSettings = {
    audioEnabled: false,
    audioVolume: 0.3,
    particleDensity: 'medium',
    autoRotate: true,
    showLabels: true,
    theme: 'dark',
};

/**
 * Create the Zustand store with persistence for settings
 */
export const useWorkflowStore = create<WorkflowStore>()(
    persist(
        (set, get) => ({
            // Initial state
            workflows: [],
            isLoading: false,
            error: null,
            lastFetched: null,
            selectedWorkflowId: null,
            hoveredWorkflowId: null,
            viewMode: 'galaxy',
            isDetailPanelOpen: false,
            cameraState: DEFAULT_CAMERA_STATE,
            settings: DEFAULT_SETTINGS,

            // Workflow data actions
            setWorkflows: (workflows) =>
                set({
                    workflows,
                    lastFetched: new Date().toISOString(),
                    error: null,
                }),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error, isLoading: false }),

            // Selection actions
            selectWorkflow: (id) =>
                set({
                    selectedWorkflowId: id,
                    isDetailPanelOpen: id !== null,
                }),

            hoverWorkflow: (id) => set({ hoveredWorkflowId: id }),

            // View actions
            setViewMode: (viewMode) => set({ viewMode }),

            toggleDetailPanel: () =>
                set((state) => ({ isDetailPanelOpen: !state.isDetailPanelOpen })),

            closeDetailPanel: () =>
                set({ isDetailPanelOpen: false, selectedWorkflowId: null }),

            // Camera actions
            setCameraState: (state) =>
                set((prev) => ({
                    cameraState: { ...prev.cameraState, ...state },
                })),

            resetCamera: () => set({ cameraState: DEFAULT_CAMERA_STATE }),

            // Settings actions
            updateSettings: (newSettings) =>
                set((state) => ({
                    settings: { ...state.settings, ...newSettings },
                })),

            toggleAudio: () =>
                set((state) => ({
                    settings: {
                        ...state.settings,
                        audioEnabled: !state.settings.audioEnabled,
                    },
                })),

            // Computed getters
            getSelectedWorkflow: () => {
                const state = get();
                return state.workflows.find((w) => w.id === state.selectedWorkflowId);
            },

            getWorkflowsByCategory: (category) => {
                return get().workflows.filter((w) => w.category === category);
            },
        }),
        {
            name: 'n8n-dashboard-storage',
            storage: createJSONStorage(() => localStorage),
            // Only persist settings, not workflow data
            partialize: (state) => ({ settings: state.settings }),
        }
    )
);

/**
 * Selector hooks for optimized re-renders
 */
export const useSelectedWorkflow = () =>
    useWorkflowStore((state) =>
        state.workflows.find((w) => w.id === state.selectedWorkflowId)
    );

export const useWorkflows = () => useWorkflowStore((state) => state.workflows);
export const useViewMode = () => useWorkflowStore((state) => state.viewMode);
export const useSettings = () => useWorkflowStore((state) => state.settings);
export const useIsLoading = () => useWorkflowStore((state) => state.isLoading);
