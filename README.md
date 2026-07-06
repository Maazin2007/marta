# Marta — AI Virtual Patient Backend

Marta is a Spring Boot backend for an AI chatbot virtual patient system designed for dental education research. Third and fourth year dental students interact with Marta to practice diagnosing four operative dentistry cases. The system tracks diagnostic accuracy, collects questionnaire feedback, and supports a RAG pipeline powered by pgvector and the Claude API.

---

## Stack

- **Framework** — Spring Boot 3.5.x / Maven
- **Language** — Java 21
- **Database** — PostgreSQL (Neon) + pgvector
- **AI** — Claude API via LangChain4j
- **ORM** — Spring Data JPA / Hibernate

---

## Cases

Marta simulates four operative dentistry presentations:

1. Deep caries with reversible pulpitis
2. Cracked tooth syndrome
3. Post-restorative sensitivity
4. Secondary caries beneath a failing restoration

---

## Project Structure

```
src/main/java/com/marta/
  auth/               ← token management + student auth
    dto/              ← request/response objects
  cases/              ← dental case content
  sessions/           ← student-case session tracking
  messages/           ← chat history + AI message loop
  feedback/           ← post-case questionnaire
  knowledge/          ← pgvector RAG pipeline
  common/             ← global config, exceptions, health check
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/validate` | Validate student token. Returns `registered: false` if first time, `registered: true` if returning |
| POST | `/api/auth/register` | Register student details on first login |

### Tokens — `/api/tokens`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tokens` | All tokens with status (researcher dashboard) |
| PATCH | `/api/tokens/{token}/activate` | Researcher activates a token before emailing it |

### Cases — `/api/cases`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cases` | List all cases |
| GET | `/api/cases/{caseId}` | Get case detail |
| POST | `/api/cases` | Create a case (seed only) |
| PUT | `/api/cases/{caseId}` | Update case content |

### Sessions — `/api/sessions`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/sessions` | Start session — random case assigned by backend |
| GET | `/api/sessions/{sessionId}` | Get session state |
| GET | `/api/sessions?userId={userId}` | All sessions for a student |
| PATCH | `/api/sessions/{sessionId}/complete` | Mark session complete |

### Messages — `/api/sessions/{sessionId}/messages`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/sessions/{sessionId}/messages` | Send message — triggers RAG pipeline + Claude API |
| GET | `/api/sessions/{sessionId}/messages` | Full chat history |

### Feedback — `/api/sessions/{sessionId}/feedback`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/sessions/{sessionId}/feedback` | Submit 11-item post-case questionnaire |
| GET | `/api/sessions/{sessionId}/feedback` | Get feedback for a session |

---

## Message Flow

Every `POST /api/sessions/{sessionId}/messages` call:

1. Persist user message to DB
2. Embed message text
3. pgvector similarity search — case-specific chunks (`WHERE case_id = ?`)
4. pgvector similarity search — universal clinical knowledge chunks (`WHERE case_id IS NULL`)
5. Build prompt: case context + retrieved chunks + last N messages
6. Call Claude API — returns structured JSON
7. Parse response: `{ diagnosisReached, diagnosis, patientReply }`
8. Persist assistant message (patientReply only)
9. If `diagnosisReached = true` → update session
10. Return message pair to frontend

---

## AI Response Shape

Claude returns structured JSON on every message:

```json
{
  "diagnosisReached": false,
  "diagnosis": null,
  "patientReply": "The pain is sharp when I bite down..."
}
```

---

## Database Schema

```
users              ← student accounts
tokens             ← access tokens (pre-generated, researcher activates)
cases              ← 4 dental patient scenarios
sessions           ← one per student per case
messages           ← full chat history
feedback           ← 11-item post-case questionnaire
knowledge_chunks   ← pgvector embeddings (case-specific + universal)
```

---

## Setup

**1. Clone the repo**
```bash
git clone https://github.com/yourusername/marta.git
cd marta
```

**2. Configure environment**
```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Fill in your Neon database credentials in `application.properties`.

**3. Run the app**
```bash
./mvnw spring-boot:run
```

**4. Seed the database (run once before study launch)**
```bash
java -jar target/marta.jar --seed-knowledge-base
```

---

## Health Check

```
GET /health → { "status": "ok", "database": "connected" }
```

---

## Research Context

Marta is part of a descriptive cross-sectional study evaluating AI-driven virtual patients in operative dentistry education. The study runs over four weeks with third and fourth year dental students. Outcomes measured include diagnostic accuracy, satisfaction, perceived realism, diagnostic confidence, and curricular value.

---

## Deployment

- **Backend** — Railway
- **Frontend** — Vercel
- **Database** — Neon (PostgreSQL + pgvector)