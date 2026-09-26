export interface Question {
  id: string | number;
  session_id?: string;
  order_index?: number;
  question_text: string;
  question_type?: 'Technical' | 'Behavioral' | 'Situational' | string;
  answer_text?: string;
  score?: number | null;
  feedback?: string;
  improvement_tip?: string;
  strengths?: string;
  created_at?: string;
}

export interface InterviewSession {
  id: string;
  user_id?: string | null;
  role_title: string;
  difficulty?: string;
  created_at: string;
  overall_score: number | null;
  questions?: Question[];
}

export interface ScoreResult {
  score: number;
  feedback: string;
  improvement_tip: string;
  strengths: string;
  source: string;
}

export interface SessionSummaryResult {
  overall_feedback: string;
  improvement_tip: string;
  hiring_verdict: string;
  strongest_answer_index?: number;
  weakest_answer_index?: number;
}
