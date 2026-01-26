import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '/api';

export type ActivityType = 
  | 'task_created'
  | 'task_updated'
  | 'status_changed'
  | 'agent_started'
  | 'agent_stopped'
  | 'agent_completed'
  | 'task_archived'
  | 'task_deleted'
  | 'worktree_created'
  | 'worktree_merged';

export interface Activity {
  id: string;
  type: ActivityType;
  taskId: string;
  taskTitle: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

async function fetchActivities(limit: number = 50): Promise<Activity[]> {
  const response = await fetch(`${API_BASE}/activity?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch activities');
  return response.json();
}

async function clearActivities(): Promise<void> {
  const response = await fetch(`${API_BASE}/activity`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to clear activities');
}

export function useActivities(limit: number = 50) {
  return useQuery({
    queryKey: ['activities', limit],
    queryFn: () => fetchActivities(limit),
    refetchInterval: 30000, // Refresh every 30s
  });
}

export function useClearActivities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearActivities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
