import { z } from 'zod';

export const QuestionRecordSchema = z.object({
  id: z.string().optional(),
  session_id: z.string().optional(),
  question_text: z.string(),
  answer_text: z.string().nullable().optional(),
  score: z.number().min(0).max(100).nullable().optional(),
  feedback: z.string().nullable().optional(),
  improvement_tip: z.string().nullable().optional(),
  order_index: z.number().int()
});
export type QuestionRecord = z.infer<typeof QuestionRecordSchema>;

export const SessionRecordSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().nullable().optional(),
  role_title: z.string().min(1),
  created_at: z.string().optional(),
  overall_score: z.number().min(0).max(100),
  difficulty: z.string().optional(),
  questions: z.array(QuestionRecordSchema).optional().default([])
});
export type SessionRecord = z.infer<typeof SessionRecordSchema>;

export const CreateSessionRequestSchema = z.object({
  role_title: z.string().min(1, 'Role title is required'),
  overall_score: z.number().min(0).max(100),
  difficulty: z.string().optional().default('mid'),
  user_id: z.string().nullable().optional(),
  questions: z.array(
    z.object({
      question_text: z.string(),
      answer_text: z.string().optional().default(''),
      score: z.number().min(0).max(100).optional().default(0),
      feedback: z.string().optional().default(''),
      improvement_tip: z.string().optional().default(''),
      order_index: z.number().int().optional().default(0)
    })
  ).optional().default([])
});
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;
