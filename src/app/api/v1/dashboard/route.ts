import { NextResponse } from 'next/server';
import { fetchSessionsList } from '@/lib/supabase-client';
import { handleApiError } from '@/lib/app-error';

export async function GET() {
  try {
    const { sessions, error } = await fetchSessionsList();

    if (error) {
      return NextResponse.json({
        success: false,
        source: 'local_storage_fallback',
        metrics: {
          total_sessions: 0,
          average_score: 0,
          highest_score: 0,
          most_practiced_role: 'N/A',
          score_trend: []
        },
        sessions: []
      });
    }

    const totalSessions = sessions.length;
    if (totalSessions === 0) {
      return NextResponse.json({
        success: true,
        metrics: {
          total_sessions: 0,
          average_score: 0,
          highest_score: 0,
          most_practiced_role: 'N/A',
          score_trend: []
        },
        sessions: []
      });
    }

    const scores = sessions.map((s) => s.overall_score);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalSessions);
    const highestScore = Math.max(...scores);

    // Most practiced role
    const roleCounts: Record<string, number> = {};
    for (const s of sessions) {
      roleCounts[s.role_title] = (roleCounts[s.role_title] || 0) + 1;
    }
    let mostPracticedRole = 'Software Engineer';
    let maxCount = 0;
    for (const [role, count] of Object.entries(roleCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostPracticedRole = role;
      }
    }

    // Score trajectory ordered chronologically
    const scoreTrend = [...sessions]
      .reverse()
      .map((s, idx) => ({
        date: s.created_at
          ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : `Session ${idx + 1}`,
        score: s.overall_score,
        role: s.role_title
      }));

    return NextResponse.json({
      success: true,
      metrics: {
        total_sessions: totalSessions,
        average_score: averageScore,
        highest_score: highestScore,
        most_practiced_role: mostPracticedRole,
        score_trend: scoreTrend
      },
      sessions
    });
  } catch (err: unknown) {
    return handleApiError(err, 'GET /api/v1/dashboard');
  }
}
