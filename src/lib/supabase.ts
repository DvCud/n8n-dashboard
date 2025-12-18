// ============================================================
// Supabase Client Configuration
// ============================================================

import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
// These should be set in .env.local for development
// and in Vercel environment variables for production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Database Types for workflow caching
 */
export interface WorkflowCache {
    id: string;
    name: string;
    description: string;
    node_count: number;
    node_types: string[];
    category: string;
    github_url: string;
    raw_url: string;
    size: number;
    sha: string;
    created_at: string;
    updated_at: string;
}

export interface AnalyticsEvent {
    id?: number;
    workflow_id: string;
    event_type: 'view' | 'click' | 'download';
    created_at?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Fetch cached workflows from Supabase
 */
export async function getCachedWorkflows(): Promise<WorkflowCache[]> {
    const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching cached workflows:', error);
        return [];
    }

    return data || [];
}

/**
 * Cache workflows in Supabase (upsert)
 */
export async function cacheWorkflows(workflows: Omit<WorkflowCache, 'created_at' | 'updated_at'>[]): Promise<boolean> {
    const { error } = await supabase
        .from('workflows')
        .upsert(
            workflows.map(w => ({
                ...w,
                updated_at: new Date().toISOString()
            })),
            { onConflict: 'id' }
        );

    if (error) {
        console.error('Error caching workflows:', error);
        return false;
    }

    return true;
}

/**
 * Get cache metadata (last update time)
 */
export async function getCacheMetadata(): Promise<{ lastUpdated: string | null }> {
    const { data, error } = await supabase
        .from('workflows')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        return { lastUpdated: null };
    }

    return { lastUpdated: data.updated_at };
}

/**
 * Log analytics event
 */
export async function logAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    const { error } = await supabase
        .from('analytics')
        .insert({
            workflow_id: event.workflow_id,
            event_type: event.event_type,
            metadata: event.metadata || {},
        });

    if (error) {
        console.error('Error logging analytics:', error);
    }
}

/**
 * Get workflow view counts
 */
export async function getWorkflowStats(): Promise<Record<string, number>> {
    const { data, error } = await supabase
        .from('analytics')
        .select('workflow_id')
        .eq('event_type', 'view');

    if (error || !data) {
        return {};
    }

    // Count views per workflow
    const counts: Record<string, number> = {};
    data.forEach(row => {
        counts[row.workflow_id] = (counts[row.workflow_id] || 0) + 1;
    });

    return counts;
}
