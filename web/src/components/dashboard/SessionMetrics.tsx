/**
 * SessionMetrics — Session-level metrics card
 * GH #61: Dashboard session count, finished, abandoned metrics
 *
 * Shows agent session statistics from telemetry data.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Activity, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { formatDuration, type MetricsPeriod } from '@/hooks/useMetrics';

interface SessionMetricsProps {
  period: MetricsPeriod;
}

export function SessionMetrics({ period }: SessionMetricsProps) {
  const { data: telemetry = [] } = useQuery({
    queryKey: ['telemetry', 'sessions', period],
    queryFn: async () => {
      const [started, completed] = await Promise.all([
        api.telemetry.query({ type: 'run.started', limit: 200 }),
        api.telemetry.query({ type: 'run.completed', limit: 200 }),
      ]);
      return { started, completed };
    },
    staleTime: 60_000,
    select: (data) => data,
  });

  const stats = useMemo(() => {
    const started = (telemetry as { started?: unknown[]; completed?: unknown[] })?.started || [];
    const completed = (telemetry as { started?: unknown[]; completed?: unknown[] })?.completed || [];

    const totalSessions = started.length;
    const successfulSessions = completed.filter((e: unknown) => {
      const event = e as Record<string, unknown>;
      return event.success === true || event.status === 'success';
    }).length;
    const failedSessions = completed.filter((e: unknown) => {
      const event = e as Record<string, unknown>;
      return event.success === false || event.status === 'failed';
    }).length;
    const abandonedSessions = totalSessions - successfulSessions - failedSessions;

    const durations = completed
      .map((e: unknown) => (e as Record<string, unknown>).durationMs as number)
      .filter(Boolean);
    const avgDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    const successRate = totalSessions > 0 ? (successfulSessions / totalSessions) * 100 : 0;

    return {
      total: totalSessions,
      successful: successfulSessions,
      failed: failedSessions,
      abandoned: abandonedSessions,
      avgDuration,
      successRate,
    };
  }, [telemetry]);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4 text-muted-foreground" />
        Sessions
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-[10px] text-muted-foreground">Total Runs</div>
        </div>
        <div>
          <div className="text-2xl font-bold" style={{ color: stats.successRate > 80 ? '#22c55e' : stats.successRate > 50 ? '#f59e0b' : '#ef4444' }}>
            {Math.round(stats.successRate)}%
          </div>
          <div className="text-[10px] text-muted-foreground">Success Rate</div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            Completed
          </span>
          <span className="font-medium">{stats.successful}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <XCircle className="w-3 h-3 text-red-500" />
            Failed
          </span>
          <span className="font-medium">{stats.failed}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <XCircle className="w-3 h-3 text-gray-400" />
            Abandoned
          </span>
          <span className="font-medium">{stats.abandoned}</span>
        </div>
        {stats.avgDuration > 0 && (
          <div className="flex items-center justify-between pt-1 border-t">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Timer className="w-3 h-3" />
              Avg Duration
            </span>
            <span className="font-medium">{formatDuration(stats.avgDuration)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
