# Core API Contract (Chat, Cases & Feedback)

> **Base URL:** All endpoints are prefixed with `/marta/api/v1`
> **Auth Header Required:** All endpoints below require `Authorization: Bearer <JWT_Token>` unless stated otherwise.
> See [auth.md](./auth.md) for authentication endpoints.

---

## 1. Student Cases Dashboard
**Base URL:** `/cases` (Requires Student JWT)

### 1.1 Fetch Available Cases
**Endpoint:** `GET /cases`
**Description:** Fetches all active cases with the logged-in student's progress status.
**Headers:** `Authorization: Bearer <Student_JWT_Token>`
**Response (200 OK):**
```json
[
  {
    "caseId": "UUID",
    "title": "Deep caries with reversible pulpitis",
    "category": "Operative Dentistry",
    "difficultyLevel": "Beginner",
    "status": "NOT_STARTED",
    "sessionId": null
  },
  {
    "caseId": "UUID",
    "title": "Cracked tooth syndrome",
    "category": "Operative Dentistry",
    "difficultyLevel": "Intermediate",
    "status": "IN_PROGRESS",
    "sessionId": "UUID-of-active-session"
  },
  {
    "caseId": "UUID",
    "title": "Post-restorative sensitivity",
    "category": "Operative Dentistry",
    "difficultyLevel": "Beginner",
    "status": "COMPLETED",
    "sessionId": "UUID-of-completed-session"
  }
]
```

> **Frontend Notes:**
> - `NOT_STARTED` → Show "Start" button, call `POST /api/chat/start`
> - `IN_PROGRESS` → Show "Resume" button, use `sessionId` to call chat endpoints
> - `COMPLETED` → Show "View History" button or disable, use `sessionId` to load chat history

---

## 2. Chat Sessions
**Base URL:** `/chat` (Requires Student JWT)

### 2.1 Start a Session
**Endpoint:** `POST /chat/start`
**Headers:** `Authorization: Bearer <Student_JWT_Token>`
**Body:**
```json
{
  "caseId": "UUID-of-the-case"
}
```
**Response (200 OK):**
```json
{
  "id": "UUID-of-session",
  "participantId": "UUID",
  "caseId": "UUID",
  "diagnosisReached": false,
  "studentFinalDiagnosis": null,
  "startedAt": "2026-07-16T12:00:00Z",
  "completedAt": null
}
```
**Error (400):** `"Session already exists"` — student already started this case.

### 2.2 Send a Message (Talk to AI Patient)
**Endpoint:** `POST /chat/{sessionId}/message`
**Headers:** `Authorization: Bearer <Student_JWT_Token>`
**Body:**
```json
{
  "message": "Does your tooth hurt when you chew?"
}
```
**Response (200 OK):**
```json
{
  "id": "UUID-of-message",
  "sender": "PATIENT",
  "text": "Yeah, it really hurts when I bite down on something hard. Like a sharp shooting pain.",
  "sentAt": "2026-07-16T12:01:00Z"
}
```
**Error (400):** `"This case has already been completed."` — student already reached the correct diagnosis.

> **Frontend Notes:**
> - `sender` will be either `"STUDENT"` or `"PATIENT"`.
> - When `diagnosisReached` becomes true on the session, subsequent messages will be blocked.

### 2.3 Get Chat History
**Endpoint:** `GET /chat/{sessionId}/messages`
**Headers:** `Authorization: Bearer <Student_JWT_Token>`
**Response (200 OK):**
```json
[
  {
    "id": "UUID",
    "sender": "STUDENT",
    "text": "Hello, what brings you in today?",
    "sentAt": "2026-07-16T12:00:10Z"
  },
  {
    "id": "UUID",
    "sender": "PATIENT",
    "text": "My tooth has been really bothering me lately.",
    "sentAt": "2026-07-16T12:00:12Z"
  }
]
```

---

## 3. Feedback Survey
**Base URL:** `/feedback` (Requires Student JWT)

### 3.1 Submit Post-Session Feedback
**Endpoint:** `POST /feedback/submit`
**Headers:** `Authorization: Bearer <Student_JWT_Token>`
**Description:** Submits the 12-item academic questionnaire after completing a case.
**Body:**
```json
{
  "sessionId": "UUID-of-the-completed-session",
  "satisfaction": 5,
  "answeredAllQuestions": 4,
  "naturalness": 5,
  "improvedCommunication": 5,
  "improvedConfidence": 4,
  "contributionToDevelopment": 5,
  "ableToAskAllQuestions": 4,
  "wouldRecommend": 5,
  "shouldBeInCurriculum": 5,
  "diagnosticConfidence": 4,
  "studentDiagnosisReasoning": "The patient reported sharp pain only when biting, with an old amalgam filling. I believe this is cracked tooth syndrome.",
  "suggestedModifications": "The patient could show more visible discomfort during the conversation."
}
```
**Response (200 OK):**
*(Returns the saved SessionFeedback entity with all fields + generated `id` and `submittedAt`)*

> **Frontend Notes:**
> - All Likert scale fields are integers from 1-5.
> - `studentDiagnosisReasoning` and `suggestedModifications` are free-text strings.
> - This should only be submitted AFTER `diagnosisReached` is true on the session.

---

## 4. Knowledge Base (Researcher Only)
**Base URL:** `/admin/knowledge` (Requires Researcher JWT)

### 4.1 Fetch All Cases (for PDF Upload Dropdown)
**Endpoint:** `GET /admin/knowledge/cases`
**Headers:** `Authorization: Bearer <Researcher_JWT_Token>`
**Description:** Fetches all cases to populate the dropdown when uploading a PDF.
**Response (200 OK):**
```json
[
  {
    "id": "UUID",
    "title": "Deep caries with reversible pulpitis",
    "category": "Operative Dentistry"
  }
]
```

### 4.2 Ingest Medical PDF (RAG)
**Endpoint:** `POST /admin/knowledge/ingest`
**Headers:** `Authorization: Bearer <Researcher_JWT_Token>`
**Content-Type:** `multipart/form-data`
**Form Data Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `file` | File (.pdf) | Yes | The raw PDF file to parse and embed |
| `caseId` | UUID | No | The case this PDF belongs to. Leave empty for universal textbook content |
| `category` | String | Yes | e.g., `textbook`, `guidelines`, `reference` |

**Response (200 OK):**
```text
"Successfully ingested 145 chunks from medical_history.pdf"
```

---

## Rate Limiting

| Endpoint Group | Limit | Window |
|---|---|---|
| Auth routes (`/auth/*`) | 5 requests | per minute |
| Chat routes (`/chat/*`) | 1 request | per 3 seconds |

When rate limited, the API returns **429 Too Many Requests**.
