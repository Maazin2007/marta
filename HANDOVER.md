# Marta Project Handover & Context

**Welcome back!** If you are reading this on your PC, this file contains the complete context of our conversation so we can pick up exactly where we left off without missing a beat.

## Current State of the Project
- **Backend:** 100% complete and fully functioning (Spring Boot, RAG, Claude AI, JWT). We just cleaned up the controller routes to perfectly match `server.servlet.context-path=/marta/api/v1`.
- **Frontend:** Next.js with Tailwind CSS v4 is initialized and running on `localhost:3000`. We have successfully built the UI for the Homepage (`page.tsx`), the `<StudentAuth />` component, and the `<ResearcherLogin />` component.

## Our Working Dynamic
We agreed on a hyper-efficient pair-programming dynamic:
1. **I (the AI) write all the HTML and Tailwind CSS.** I will heavily comment every Tailwind class and explain the design choices (like Flexbox vs Grid) so you can learn it passively.
2. **You write the React Logic.** You will handle all the `useState`, `useEffect`, and `fetch` calls to the Spring Boot backend because *that* is what matters for SWE internship interviews.

## Where We Left Off
We are currently on **Block 1: Auth API Integration**. 

Your active task was to wire up the "brain" for the Student Login form inside `src/app/components/StudentAuth.tsx`. 

**Here were your instructions before we paused:**
1. Create `const [participantId, setParticipantId] = useState("");` and `const [password, setPassword] = useState("");` at the top of the file.
2. Connect those state variables to the two `<input>` tags using `value={...}` and `onChange={(e) => ...}`.
3. Create a `handleStudentLogin(e)` function that calls `e.preventDefault();` and logs the ID and password to the console.
4. Attach `onClick={handleStudentLogin}` to the "Sign In" button.

Once you have pushed this code to GitHub, pulled it onto your PC, and started a new AI session, just say:
*"Hey, I'm back on my PC. I've wired up the useState for StudentAuth and the console.log is working. How do we write the fetch call?"*
