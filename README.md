# Marta

An AI-powered virtual patient chatbot built for a dental education research study at a Saudi Arabian university. Dental students diagnose simulated operative dentistry cases through natural-language conversation with an AI patient; researchers use the platform to run the study and collect data for analysis.

## What this project is

Marta simulates four operative dentistry scenarios so 3rd and 4th year dental students can practice diagnostic conversations with a virtual patient over a 4-week study period. The study tracks diagnostic accuracy, satisfaction, perceived realism, diagnostic confidence, and curricular value via a 12-item questionnaire.

Long-term, the plan is to grow this beyond a single study into a platform researchers at other institutions can use for their own studies.

## Tech stack

**Backend**
- Java 21, Spring Boot 3.5.x
- PostgreSQL + pgvector (hosted on Neon)
- LangChain4j for RAG orchestration
- Claude API (Anthropic) as the underlying model for the virtual patient
- JWT for auth session tokens
- Argon2 (via Spring Security crypto) for password/PIN hashing
- Resilience4j for rate limiting on auth endpoints

**Frontend**
- Next.js (React) with TypeScript
- Deployed on Vercel

**Infrastructure**
- Backend deployed on AWS
- Frontend deployed on Vercel
- Database hosted on Neon

## Project structure

```
marta/
├── backend/                   # Spring Boot application
│   ├── src/main/java/com/marta/
│   │   ├── auth/              # JWT auth, registration, login, password reset
│   │   ├── chat/              # Diagnostic sessions, AI chat, message history
│   │   ├── feedback/          # 12-item research survey API
│   │   ├── knowledge/         # RAG pipeline, PDF ingestion, case management
│   │   └── common/            # Health check, global error handling, config
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── mvnw
├── frontend/                  # Next.js application (TypeScript)
│   ├── src/app/               # App Router pages
│   ├── package.json
│   └── next.config.ts
├── api-contract/              # API documentation
│   ├── auth.md                # Authentication endpoints
│   └── core-api.md            # Chat, cases, feedback, knowledge endpoints
├── README.md
├── PLAN.md
└── PROJECT.md
```

## Getting started

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Required environment variables

| Variable | Used for |
|---|---|
| `CLAUDE_API_KEY` | Anthropic API access for the virtual patient |
| `JWT_SECRET` | Signing key for auth tokens |
| `DATABASE_URL` | Neon Postgres connection string |

## Status

- ✅ Participant-side auth (register, login, reset password) — complete
- ✅ Researcher-side auth (login) — complete
- ✅ AI chat / diagnostic session feature — complete (Claude + LangChain4j + structured JSON)
- ✅ 12-item Feedback & Rate Limiting — complete
- ✅ Hybrid RAG Vector Pipeline (pgvector) — complete
- ✅ Culturally authentic Saudi patient cases — complete
- ✅ Student case dashboard with progress tracking — complete
- ⏳ Next.js frontend — in progress
- ⏳ Tests, CI/CD pipeline, containerization — planned after core features ship

See `PROJECT.md` for the full feature breakdown.
See `api-contract/` for complete API documentation.