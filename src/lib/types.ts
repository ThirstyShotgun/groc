export interface Question {
  id: string | number;
  session_id?: string;
  order_index?: number;
  question_text: string;
  question?: string; // backwards compatibility alias
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

export interface GenerateQuestionsRequest {
  role_title: string;
  difficulty?: string;
  seniority?: string;
  groq_key?: string;
}

export interface GenerateQuestionsResponse {
  questions: Array<{
    id?: string | number;
    question_text: string;
    question?: string;
    question_type?: 'Technical' | 'Behavioral' | 'Situational' | string;
    order_index?: number;
  }>;
  source?: 'groq' | 'fallback';
  difficulty?: string;
  message?: string;
}

export interface ScoreAnswerRequest {
  question_text?: string;
  answer_text?: string;
  question?: string;
  answer?: string;
  role_title?: string;
  groq_key?: string;
}

export interface ScoreAnswerResponse {
  score: number; // 0 - 100
  feedback: string;
  improvement_tip?: string;
  strengths?: string;
  source?: 'groq' | 'fallback' | 'edge_case_handler';
  message?: string;
}

export interface SessionSummaryRequest {
  questions: Array<{
    question_text: string;
    answer_text?: string;
    score?: number;
  }>;
  role_title?: string;
  groq_key?: string;
}

export interface SessionSummaryResponse {
  overall_feedback: string;
  strongest_answer_index: number;
  weakest_answer_index: number;
  improvement_tip: string;
  overall_tip?: string; // backward compat alias
  hiring_verdict?: string;
  source?: 'groq' | 'fallback';
}
