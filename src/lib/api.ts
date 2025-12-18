// ============================================================
// API Client for fetching workflow data from GitHub
// ============================================================

import type { WorkflowMetadata, GitHubFile, N8nWorkflow, WorkflowCategory } from '@/types/workflow';

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'DvCud';
const REPO_NAME = 'n8n-workflows';
// Base URL for raw content (used for future direct file access)
const _RAW_CONTENT_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main`;

/**
 * Determine workflow category based on name keywords
 */
function categorizeWorkflow(name: string): WorkflowCategory {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('ai') || lowerName.includes('gemini') || lowerName.includes('claude') || lowerName.includes('agent')) {
        return 'ai';
    }
    if (lowerName.includes('seo') || lowerName.includes('keyword')) {
        return 'seo';
    }
    if (lowerName.includes('hr') || lowerName.includes('job') || lowerName.includes('resume') || lowerName.includes('helpdesk')) {
        return 'hr';
    }
    if (lowerName.includes('lead') || lowerName.includes('roofing') || lowerName.includes('scraper')) {
        return 'lead-gen';
    }
    if (lowerName.includes('monitor') || lowerName.includes('sre') || lowerName.includes('alert')) {
        return 'monitoring';
    }
    if (lowerName.includes('sql') || lowerName.includes('data') || lowerName.includes('tax') || lowerName.includes('research')) {
        return 'data';
    }

    return 'other';
}

/**
 * Extract a description from the workflow JSON
 * Looks for sticky notes or uses first few node names
 */
function extractDescription(workflow: N8nWorkflow): string {
    // Look for sticky notes with descriptions
    const stickyNote = workflow.nodes.find(
        (node) => node.type === 'n8n-nodes-base.stickyNote' && node.parameters?.content
    );

    if (stickyNote && stickyNote.parameters?.content) {
        const content = String(stickyNote.parameters.content);
        // Clean up markdown and get first line
        const cleaned = content
            .replace(/[#*]/g, '')
            .split('\n')
            .filter((line) => line.trim().length > 10)
            .slice(0, 2)
            .join(' ')
            .trim();

        if (cleaned.length > 20) {
            return cleaned.length > 200 ? cleaned.slice(0, 200) + '...' : cleaned;
        }
    }

    // Fallback: list main node types
    const uniqueTypes = [...new Set(
        workflow.nodes
            .map((n) => n.type.replace('n8n-nodes-base.', '').replace('@n8n/n8n-nodes-langchain.', ''))
            .filter((t) => t !== 'stickyNote')
    )];

    return `Workflow with ${workflow.nodes.length} nodes: ${uniqueTypes.slice(0, 5).join(', ')}`;
}

/**
 * Get list of unique node types in a workflow
 */
function getNodeTypes(workflow: N8nWorkflow): string[] {
    return [...new Set(
        workflow.nodes
            .map((n) => n.type)
            .filter((t) => !t.includes('stickyNote'))
    )];
}

/**
 * Fetch repository contents (list of files)
 */
export async function fetchRepositoryContents(): Promise<GitHubFile[]> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents`,
        {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        }
    );

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const files: GitHubFile[] = await response.json();

    // Filter to only JSON workflow files
    return files.filter(
        (file) => file.type === 'file' && file.name.endsWith('.json')
    );
}

/**
 * Fetch and parse a single workflow JSON file
 */
export async function fetchWorkflowContent(downloadUrl: string): Promise<N8nWorkflow> {
    const response = await fetch(downloadUrl, {
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch workflow: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetch all workflows and transform to metadata format
 */
export async function fetchAllWorkflows(): Promise<WorkflowMetadata[]> {
    const files = await fetchRepositoryContents();

    const workflowPromises = files.map(async (file): Promise<WorkflowMetadata | null> => {
        try {
            const workflow = await fetchWorkflowContent(file.download_url);

            return {
                id: file.sha,
                name: workflow.name || file.name.replace('.json', ''),
                description: extractDescription(workflow),
                nodeCount: workflow.nodes.length,
                nodeTypes: getNodeTypes(workflow),
                category: categorizeWorkflow(workflow.name || file.name),
                githubUrl: file.html_url,
                rawUrl: file.download_url,
                size: file.size,
                lastUpdated: new Date().toISOString(),
            };
        } catch (error) {
            console.error(`Failed to parse workflow ${file.name}:`, error);
            return null;
        }
    });

    const results = await Promise.all(workflowPromises);
    return results.filter((w): w is WorkflowMetadata => w !== null);
}

/**
 * Calculate 3D positions for workflows in galaxy layout
 * Uses spherical coordinates with category-based clustering
 */
export function calculateGalaxyPositions(workflows: WorkflowMetadata[]): WorkflowMetadata[] {
    const categoryAngles: Record<WorkflowCategory, number> = {
        ai: 0,
        seo: Math.PI / 3,
        hr: (2 * Math.PI) / 3,
        'lead-gen': Math.PI,
        monitoring: (4 * Math.PI) / 3,
        data: (5 * Math.PI) / 3,
        other: Math.PI / 6,
    };

    const categoryRadius: Record<WorkflowCategory, number> = {
        ai: 12,
        seo: 10,
        hr: 11,
        'lead-gen': 9,
        monitoring: 13,
        data: 14,
        other: 8,
    };

    // Group by category
    const grouped = workflows.reduce((acc, w) => {
        if (!acc[w.category]) acc[w.category] = [];
        acc[w.category].push(w);
        return acc;
    }, {} as Record<string, WorkflowMetadata[]>);

    return workflows.map((workflow, index) => {
        const categoryWorkflows = grouped[workflow.category] || [];
        const indexInCategory = categoryWorkflows.indexOf(workflow);
        const categoryCount = categoryWorkflows.length;

        // Base angle for category + offset for each workflow in category
        const baseAngle = categoryAngles[workflow.category] || 0;
        const angleSpread = Math.PI / 4; // 45 degrees spread per category
        const angleOffset = categoryCount > 1
            ? (indexInCategory / (categoryCount - 1) - 0.5) * angleSpread
            : 0;

        const angle = baseAngle + angleOffset;
        const radius = categoryRadius[workflow.category] || 10;

        // Add some vertical variation based on node count
        const yOffset = (workflow.nodeCount / 20 - 0.5) * 4;

        // Add slight randomness for organic feel
        const noise = (Math.sin(index * 12.9898) * 43758.5453) % 1;

        return {
            ...workflow,
            position: {
                x: Math.cos(angle) * radius + noise * 2,
                y: yOffset + noise,
                z: Math.sin(angle) * radius + noise * 2,
            },
        };
    });
}
