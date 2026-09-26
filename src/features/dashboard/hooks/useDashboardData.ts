import { useQuery } from '@tanstack/react-query';
import { SessionRecord } from '@/types/session';
import { getLocalSessions } from '@/features/interview-flow/services';

export interface DashboardData {
  metrics: {
    total_sessions: number;
    average_score: number;
    highest_score: number;
    most_practiced_role: string;
    score_trend: Array<{ date: string; score: number; role: string }>;
  };
  sessions: SessionRecord[];
}

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard_data'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/dashboard');
        if (res.ok) {
          const data = await res.json();
          if (data.sessions && data.sessions.length > 0) {
            return {
              metrics: data.metrics,
              sessions: data.sessions
            };
          }
        }
      } catch (err) {
        console.warn('Dashboard fetch error, checking localStorage:', err);
      }

      // Offline / Local storage fallback
      const local = getLocalSessions();
      if (local.length === 0) {
        return {
          metrics: {
            total_sessions: 0,
            average_score: 0,
            highest_score: 0,
            most_practiced_role: 'None',
            score_trend: []
          },
          sessions: []
        };
      }

      const scores = local.map((s) => s.overall_score);
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / local.length);
      const highest = Math.max(...scores);
      const trend = [...local].reverse().map((s, idx) => ({
        date: s.created_at
          ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : `Session ${idx + 1}`,
        score: s.overall_score,
        role: s.role_title
      }));

      return {
        metrics: {
          total_sessions: local.length,
          average_score: avg,
          highest_score: highest,
          most_practiced_role: local[0]?.role_title || 'Software Engineer',
          score_trend: trend
        },
        sessions: local
      };
    }
  });
}
