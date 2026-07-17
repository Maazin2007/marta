# Marta

An AI-powered virtual patient chatbot built for a dental education research study. Dental students diagnose simulated operative dentistry cases through natural-language conversation with an AI patient; researchers use the platform to run the study and collect data for analysis.

## What this project is

Marta simulates four operative dentistry scenarios so 3rd and 4th year dental students can practice diagnostic conversations with a virtual patient over a 4-week study period. The study tracks diagnostic accuracy, satisfaction, perceived realism, diagnostic confidence, and curricular value via an 11-item questionnaire.

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
- Next.js (React)
- Deployed on Vercel

**Infrastructure**
- Backend deployed on AWS
- Frontend deployed on Vercel
- Database hosted on Neon

## Project structure

```
marta/
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/marta/
│   │   ├── config/            # SecurityConfig (PasswordEncoder bean), Claude client config
│   │   ├── controller/        # REST controllers
│   │   ├── service/           # Business logic
│   │   ├── repository/        # Spring Data JPA repositories
│   │   ├── model/              # JPA entities
│   │   └── dto/                # Request/response DTOs
│   └── src/main/resources/
│       └── application.properties
├── frontend/                  # Next.js application
│   └── (see frontend section below — fill in once scaffolded)
└── PROJECT_SCOPE.md           # Full feature spec for AI coding agents / reference
```

*(Update the paths above to match your actual repo layout once finalized — this reflects the structure implied by the codebase so far, not a confirmed file tree.)*

## Data model

Seven-table schema:

| Table | Purpose |
|---|---|
| `participants` | Auth credentials — `participant_id` (random, non-sequential, doubles as username), password hash, PIN hash |
| `participant_demographics` | Sex, year of study, self-reported baseline confidence — kept separate from auth credentials |
| `researchers` | Researcher admin auth — email, password hash, PIN hash |
| `cases` | The four operative dentistry scenarios |
| `sessions` (chat sessions) | A participant's diagnostic conversation session, tied to an assigned case |
| `messages` | Individual messages within a session, including structured Claude output (`diagnosisReached`, `diagnosis`, `patientReply`) |
| `feedback` | 11-item questionnaire responses |
| `knowledge_chunks` | RAG source material, tagged by `caseId` or `null` for universal content |

> Note: there's also a JWT-based session mechanism (not a DB table) used for auth — distinct from the `sessions` table above, which represents chat/diagnostic sessions.

## Auth model (summary — full detail in PROJECT_SCOPE.md)

- No PII collected from participants — no name, student ID, or email
- `participant_id` is randomly generated at registration and serves as the login username
- Participants set their own password and a PIN; PIN is used for self-serve password reset
- JWT issued on login, carrying only non-identifying claims
- Researcher access uses a separate, preconfigured email + password + 6-digit PIN (not self-registered, not OAuth)
- Withdrawal handled by participant reporting their own `participant_id` to the researcher, who deletes via the admin dashboard (cascading delete)

## Getting started

*(Fill in once you have concrete setup steps — env vars needed, how to run locally, migrations, etc.)*

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
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
| *(add any AWS-specific vars once deployment config is finalized)* | |

## Status

- ✅ Participant-side auth (register, login, reset password) — complete
- ✅ Researcher-side auth (login) — complete
- ✅ AI chat / diagnostic session feature — complete (Claude + LangChain4j)
- ✅ 11-item Feedback & Rate Limiting — complete
- ✅ Hybrid RAG Vector Pipeline (pgvector) — complete
- ⏳ Next.js frontend — not yet built
- ⏳ Tests, CI/CD pipeline, containerization — planned after core features ship

See `PROJECT_SCOPE.md` for the full feature breakdown.