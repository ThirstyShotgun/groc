export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  source?: 'groq' | 'fallback' | 'supabase' | 'local_storage';
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface DashboardMetrics {
  total_sessions: number;
  average_score: number;
  highest_score: number;
  most_practiced_role: string;
  score_trend: Array<{
    date: string;
    score: number;
    role: string;
  }>;
}
