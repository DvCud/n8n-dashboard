// ============================================================
// Type definitions for n8n Workflow Dashboard
// ============================================================

/**
 * Represents a single node within an n8n workflow
 * Nodes are the building blocks of automation - triggers, actions, etc.
 */
export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters?: Record<string, unknown>;
  typeVersion?: number;
  credentials?: Record<string, { id: string; name: string }>;
  notesInFlow?: boolean;
}

/**
 * Connection between two nodes in a workflow
 */
export interface WorkflowConnection {
  node: string;
  type: string;
  index: number;
}

/**
 * Complete n8n workflow structure as stored in JSON files
 */
export interface N8nWorkflow {
  name: string;
  nodes: WorkflowNode[];
  connections?: Record<string, Record<string, WorkflowConnection[][]>>;
  active?: boolean;
  settings?: Record<string, unknown>;
  versionId?: string;
  id?: string;
}

/**
 * Processed workflow metadata for dashboard display
 * This is the format used throughout the frontend
 */
export interface WorkflowMetadata {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  nodeTypes: string[];
  category: WorkflowCategory;
  githubUrl: string;
  rawUrl: string;
  size: number;
  lastUpdated: string;
  // 3D positioning (computed on client)
  position?: {
    x: number;
    y: number;
    z: number;
  };
  // UI state
  isSelected?: boolean;
  isHovered?: boolean;
}

/**
 * Workflow categories for grouping in the galaxy view
 */
export type WorkflowCategory = 
  | 'ai'        // AI/ML workflows (Gemini, Claude, etc.)
  | 'seo'       // SEO and marketing
  | 'hr'        // Human resources
  | 'data'      // Data processing
  | 'lead-gen'  // Lead generation
  | 'monitoring'// System monitoring
  | 'other';    // Uncategorized

/**
 * View mode for the dashboard
 */
export type ViewMode = 'galaxy' | 'technical';

/**
 * Camera state for 3D navigation
 */
export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

/**
 * Application settings stored in local storage
 */
export interface AppSettings {
  audioEnabled: boolean;
  audioVolume: number;
  particleDensity: 'low' | 'medium' | 'high';
  autoRotate: boolean;
  showLabels: boolean;
  theme: 'dark' | 'darker';
}

/**
 * GitHub repository file metadata from API
 */
export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
