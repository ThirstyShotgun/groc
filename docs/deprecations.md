# API Deprecations & Migration Guide

This document tracks deprecated endpoints in Prepr and outlines their target replacements in `/api/v1/*`.

## Deprecated Routes

| Deprecated Endpoint | Status | Target Replacement | Transition Behavior | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/generate-questions` | **Deprecated** | `POST /api/v1/questions/generate` | Forwards payload to v1 with `X-API-Deprecated` header | Supports dual-model Groq retry strategy and Zod validation |
| `POST /api/score-answer` | **Deprecated** | `POST /api/v1/answers/evaluate` | Forwards payload to v1 with `X-API-Deprecated` header | Evaluates answer (0-100), feedback, and improvement tips |
| `GET /api/sessions` | **Deprecated** | `GET /api/v1/sessions` | Forwards call to v1 with `X-API-Deprecated` header | Returns list of historical interview sessions |
| `POST /api/sessions` | **Deprecated** | `POST /api/v1/sessions` | Forwards call to v1 with `X-API-Deprecated` header | Atomically saves session and questions to Supabase / localStorage |

## Migration Schedule
- **Phase 1 (Current)**: Legacy endpoints remain active and forward to `/api/v1/*`. All response shapes are backward-compatible.
- **Phase 2**: Frontend components migrate all calls to `/api/v1/*` feature services.
- **Phase 3**: Legacy endpoints emit sunset warnings.
