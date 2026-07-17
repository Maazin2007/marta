# Core API Contract (Chat & Feedback)

## 1. Chat Sessions
**Base URL:** `/api/chat` (Requires Participant JWT)

### 1.1 Start a Session
**Endpoint:** `POST /start`
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
  "startedAt": "2026-07-16T12:00:00Z"
}
```

### 1.2 Send a Message (Talk to AI)
**Endpoint:** `POST /{sessionId}/message`
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
  "text": "Yes, it hurts really badly when I bite down.",
  "sentAt": "2026-07-16T12:01:00Z"
}
```

### 1.3 Get Chat History
**Endpoint:** `GET /{sessionId}/messages`
**Response (200 OK):**
```json
[
  {
    "id": "UUID",
    "sender": "STUDENT",
    "text": "Hello, how are you?",
    "sentAt": "2026-07-16T12:00:10Z"
  }
]
```

---

## 2. Feedback Survey
**Base URL:** `/api/feedback` (Requires Participant JWT)

### 2.1 Submit Post-Session Feedback
**Endpoint:** `POST /submit`
**Description:** Submits the 11-item academic questionnaire + diagnostic confidence.
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
  "studentDiagnosisReasoning": "The patient reported pain to cold and biting, indicating irreversible pulpitis.",
  "suggestedModifications": "The AI should pause longer before answering to mimic real life."
}
```
**Response (200 OK):**
*(Returns the saved SessionFeedback entity)*
