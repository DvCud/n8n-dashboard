// ============================================================
// API Route: Fetch Workflows
// GET /api/workflows - Returns all workflows with Supabase caching
// ============================================================

import { NextResponse } from 'next/server';
import { fetchAllWorkflows, calculateGalaxyPositions } from '@/lib/api';
import { getCachedWorkflows, cacheWorkflows, getCacheMetadata } from '@/lib/supabase';
import type { WorkflowMetadata } from '@/types/workflow';

// Cache control: revalidate every 5 minutes
export const revalidate = 300;

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION_MS = 5 * 60 * 1000;

export async function GET() {
    try {
        // Check if Supabase is configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const useSupabase = supabaseUrl && supabaseUrl.length > 0 && !supabaseUrl.includes('your-project');

        let workflows: WorkflowMetadata[] = [];
        let source = 'github';

        if (useSupabase) {
            // Try to get cached data from Supabase
            const { lastUpdated } = await getCacheMetadata();

            const cacheExpired = !lastUpdated ||
                (Date.now() - new Date(lastUpdated).getTime()) > CACHE_DURATION_MS;

            if (!cacheExpired) {
                // Use cached data
                const cached = await getCachedWorkflows();
                if (cached.length > 0) {
                    workflows = cached.map(w => ({
                        id: w.id,
                        name: w.name,
                        description: w.description,
                        nodeCount: w.node_count,
                        nodeTypes: w.node_types,
                        category: w.category as WorkflowMetadata['category'],
                        githubUrl: w.github_url,
                        rawUrl: w.raw_url,
                        size: w.size,
                        lastUpdated: w.updated_at,
                    }));
                    source = 'supabase-cache';
                }
            }

            // If cache is empty or expired, fetch from GitHub and update cache
            if (workflows.length === 0) {
                workflows = await fetchAllWorkflows();
                source = 'github';

                // Cache in Supabase (fire and forget)
                cacheWorkflows(workflows.map(w => ({
                    id: w.id,
                    name: w.name,
                    description: w.description,
                    node_count: w.nodeCount,
                    node_types: w.nodeTypes,
                    category: w.category,
                    github_url: w.githubUrl,
                    raw_url: w.rawUrl,
                    size: w.size,
                    sha: w.id,
                }))).catch(err => console.error('Cache update failed:', err));
            }
        } else {
            // No Supabase configured, fetch directly from GitHub
            workflows = await fetchAllWorkflows();
            source = 'github-direct';
        }

        // Calculate 3D positions for galaxy view
        const positioned = calculateGalaxyPositions(workflows);

        return NextResponse.json({
            success: true,
            data: positioned,
            count: positioned.length,
            source,
            supabaseConnected: useSupabase,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching workflows:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch workflows',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

// POST endpoint to manually trigger cache refresh
export async function POST() {
    try {
        const workflows = await fetchAllWorkflows();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const useSupabase = supabaseUrl && supabaseUrl.length > 0;

        if (useSupabase) {
            await cacheWorkflows(workflows.map(w => ({
                id: w.id,
                name: w.name,
                description: w.description,
                node_count: w.nodeCount,
                node_types: w.nodeTypes,
                category: w.category,
                github_url: w.githubUrl,
                raw_url: w.rawUrl,
                size: w.size,
                sha: w.id,
            })));
        }

        return NextResponse.json({
            success: true,
            message: 'Cache refreshed',
            count: workflows.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to refresh cache',
            },
            { status: 500 }
        );
    }
}
