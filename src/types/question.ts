import { z } from 'zod';

export const DifficultyLevelSchema = z.enum(['entry', 'mid', 'senior', 'lead']);
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

export const QuestionCategorySchema = z.enum(['Technical', 'Behavioral', 'Situational']);
export type QuestionCategory = z.infer<typeof QuestionCategorySchema>;

export const QuestionItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  question_text: z.string().min(5),
  question: z.string().optional(),
  question_type: QuestionCategorySchema.default('Technical'),
  suggested_time_seconds: z.number().positive().optional().default(90)
});
export type QuestionItem = z.infer<typeof QuestionItemSchema>;

export const GenerateQuestionsRequestSchema = z.object({
  role_title: z.string().min(2, 'Job role title must be at least 2 characters'),
  difficulty: z.string().optional().default('mid'),
  groq_key: z.string().optional()
});
export type GenerateQuestionsRequest = z.infer<typeof GenerateQuestionsRequestSchema>;

export const GenerateQuestionsResponseSchema = z.object({
  questions: z.array(QuestionItemSchema),
  role_title: z.string(),
  difficulty: z.string(),
  source: z.enum(['groq', 'fallback']),
  model_served: z.string().optional(),
  message: z.string().optional()
});
export type GenerateQuestionsResponse = z.infer<typeof GenerateQuestionsResponseSchema>;

export const EvaluateAnswerRequestSchema = z.object({
  question_text: z.string().min(5, 'Question text is required'),
  answer_text: z.string().optional().default(''),
  role_title: z.string().optional().default('Professional'),
  question_type: QuestionCategorySchema.optional().default('Technical'),
  groq_key: z.string().optional()
});
export type EvaluateAnswerRequest = z.infer<typeof EvaluateAnswerRequestSchema>;

export const EvaluateAnswerResponseSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  improvement_tip: z.string(),
  strengths: z.string(),
  source: z.enum(['groq', 'fallback', 'edge_case_handler']),
  model_served: z.string().optional(),
  message: z.string().optional()
});
export type EvaluateAnswerResponse = z.infer<typeof EvaluateAnswerResponseSchema>;
