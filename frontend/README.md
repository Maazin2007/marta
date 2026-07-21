# Marta Frontend Implementation Plan

This is the exact roadmap to finish the Next.js frontend, broken down into logical "Lego blocks" just like we did for the backend. 

*Estimated Total Time: 4.5 to 6.5 hours*

---

## Block 1: The Auth API Integration (Where we are now)
**Time Estimate:** 45 - 60 minutes
**Goal:** Make the UI we just built actually talk to Spring Boot.

1. **State Wiring:** Add `useState` for every single input box (Email, Password, PIN, etc.) so React can read what the user types.
2. **CORS Setup:** Briefly configure Spring Boot to allow requests from `localhost:3000`.
3. **Fetch Logic (`useEffect` / `fetch`):** Write the functions that send the JSON to `/auth/register` and `/auth/login`.
4. **Token Storage:** Save the resulting JWT string into the browser's `localStorage`.
5. **Redirection:** Push the user to `/dashboard` upon successful login.

---

## Block 2: Student Dashboard (Case Selection)
**Time Estimate:** 60 - 90 minutes
**Goal:** Show the student their 4 cases and let them resume or start them.

1. **Routing:** Create `src/app/dashboard/page.tsx`.
2. **Data Fetching (`useEffect`):** Call `GET /marta/api/v1/cases` using the JWT token from `localStorage`.
3. **UI Cards:** Build a sleek `<CaseCard />` component that takes `props` (title, status, difficulty).
4. **Status Logic:**
   - If `NOT_STARTED`: Show "Start Session" button (calls `POST /chat/start`).
   - If `IN_PROGRESS`: Show "Resume" button (routes to `/chat/[sessionId]`).
   - If `COMPLETED`: Show "Completed" badge.

---

## Block 3: The AI Chat Interface (The Core Engine)
**Time Estimate:** 1.5 - 2 hours
**Goal:** The actual messaging screen where students talk to the virtual patient.

1. **Routing:** Create `src/app/chat/[sessionId]/page.tsx` (Dynamic routing based on the Session ID).
2. **Message State:** Create a `useState` array to hold the conversation history.
3. **History Fetch:** On load, call `GET /chat/{sessionId}/messages` to populate past messages.
4. **Chat Bubbles:** Build a `<ChatMessage senderRole="..." text="..." />` component (gray for student, blue for patient).
5. **Sending Messages:** Wire up the text input and "Send" button to call `POST /chat/{sessionId}/message`.
6. **Auto-Scroll:** Add a tiny `useEffect` to force the chat window to scroll to the bottom when a new message arrives.

---

## Block 4: The 12-Item Feedback Survey
**Time Estimate:** 45 - 60 minutes
**Goal:** The popup or screen that forces the student to submit research data when they hit the correct diagnosis.

1. **Diagnosis Trigger:** Update the chat interface to detect when `diagnosisReached: true` is returned from the backend.
2. **Survey Component:** Build `<FeedbackModal />` containing 11 dropdowns/sliders for the Likert scale questions, and 2 text boxes.
3. **Submission:** Call `POST /feedback/submit`.
4. **Lockout:** Once submitted, route them back to `/dashboard` and ensure that case is permanently locked as `COMPLETED`.

---

## Block 5: Full Researcher Dashboard (The Command Center)
**Time Estimate:** 1.5 - 2 hours
**Goal:** A dedicated portal for researchers to manage the study, view participants, and upload knowledge base PDFs.

1. **Routing & Layout:** Create `src/app/admin/layout.tsx` (a sidebar for navigation) and `page.tsx`.
2. **Participant Management:** 
   - Fetch all students via `GET /auth/researcher/participants`.
   - Display them in a sleek table component.
   - Add a "Delete" button that calls `DELETE /auth/researcher/participants/{id}`.
3. **Knowledge Base (RAG) Upload UI:** 
   - Build a file dropzone component for PDF ingestion.
   - Add a dropdown fetched from `GET /admin/knowledge/cases` so researchers can link PDFs to specific cases (or global textbooks).
   - Wire the upload button to call `POST /admin/knowledge/ingest`.
4. **Analytics Overview (Future Polish):** A dashboard showing how many students are in progress vs. completed.
