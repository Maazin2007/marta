# AI Patient JSON Parsing Fix — Full Write-Up

Date: 26 Jul 2026
Scope: `backend` — the Claude-powered virtual patient chat (`/marta/api/v1/chat/{sessionId}/message`)

This document explains, in detail, the bug you hit, why it happened, every line of code I changed, and how to verify the fix. It assumes you know Java and Spring but not the internals of langchain4j.

---

## 1. TL;DR

The error was **not** the model ID. The HTTP call to Anthropic succeeded and Claude answered normally. What blew up was langchain4j trying to convert Claude's answer into your `AiPatientResponse` Java object. Claude replied with ordinary sentences (or with a sentence in front of the JSON), and langchain4j's Gson parser expected a JSON object as the very first character.

The fix has four parts:

| # | File | Change |
|---|------|--------|
| 1 | `chat/service/AiPatientService.java` | Return `String` instead of the POJO, and state the JSON contract explicitly in the system prompt |
| 2 | `chat/service/DiagnosticSessionService.java` | Parse that string myself, tolerantly, with a safe fallback |
| 3 | `chat/config/ChatMemoryConfig.java` | Replay conversation history in the same JSON shape the model must produce |
| 4 | `chat/dto/AiPatientResponse.java` | Add a no-args constructor so Jackson can build it |

Plus two commented-out logging properties in `application.properties`.

---

## 2. The error, decoded

```
.m.m.a.ExceptionHandlerExceptionResolver : Resolved
[java.lang.IllegalArgumentException: Error Custom debuging error sending message to Claude:
 java.lang.IllegalStateException: Expected BEGIN_OBJECT but was STRING at line 1 column 1 path $
 See https://github.com/google/gson/blob/main/Troubleshooting.md#unexpected-json-structure]
```

Read it from the inside out:

- **`Expected BEGIN_OBJECT but was STRING`** — this is Gson (Google's JSON library). It was told "deserialize this text into a Java object", so it expected the text to start with `{`.
- **`at line 1 column 1 path $`** — `$` is the JSON root. Column 1 of line 1 means it failed on the *very first character*. Gson in lenient mode reads unquoted words as a `STRING` token, so a reply like `Ugh, it's this back tooth...` is a STRING where an object was required.
- **`Error Custom debuging error sending message to Claude:`** — your own wrapper text from a `try/catch` that re-threw as `IllegalArgumentException`.
- **`ExceptionHandlerExceptionResolver`** — Spring caught the `IllegalArgumentException` and routed it to `GlobalExceptionHandler.handleGenericExceptions`, which returns HTTP 400 with `{"error": "..."}`.

Important detail: **that wrapper text does not exist in your current source.** I searched `backend/src` for "Custom debuging" and found nothing, then searched the compiled bytecode and found it:

```
rg -a -o "Custom debuging[^\x00]{0,60}" backend/target/classes/com/marta/chat/service/DiagnosticSessionService.class
→ Custom debuging error sending message to Claude: 6
```

So the server that produced that log was running a **stale build**. Rebuild and restart before judging any fix.

---

## 3. Why it happened — how langchain4j 0.31.0 actually works

You use the declarative AI Services API:

```java
@AiService
public interface AiPatientService {
    @SystemMessage({...})
    AiPatientResponse chatWithStudent(...);   // ← the old signature
}
```

langchain4j generates a dynamic proxy for that interface. On each call (`DefaultAiServices.invoke`) it does roughly this:

1. Render the `@SystemMessage` template, substituting `{{patientProfile}}` and `{{correctDiagnosis}}` from the `@V`-annotated parameters.
2. Take the `@UserMessage` parameter as the user turn.
3. **Look at the method's return type.** If it is not `String`/`AiMessage`/`TokenStream`, it appends format instructions to the end of the user message.
4. Load chat memory for the `@MemoryId`, send everything to Anthropic.
5. Take the model's raw text and hand it to `ServiceOutputParser`, which deserializes it into the return type using Gson.

I verified steps 3 and 5 by extracting the constant pool of `ServiceOutputParser.class` out of `langchain4j-0.31.0.jar`. The literals are there:

```
You must answer strictly in the following format:
You must answer strictly in the following JSON format:
dev/langchain4j/internal/Json          ← the Gson wrapper used to parse the reply
```

So with a POJO return type, your outbound user message really looked like:

```
<the student's question>

[SYSTEM INSTRUCTION: Here is relevant academic medical literature ...]
<a large blob of RAG text from pgvector>
You must answer strictly in the following JSON format: {
"patientReply": (type: java.lang.String),
"diagnosisFound": (type: java.lang.Boolean),
"diagnosis": (type: java.lang.String)
}
```

That instruction is a *hint*, not a hard constraint. Anthropic models have no native "JSON mode" wired into this old langchain4j version — there is no JSON schema, no tool-call forcing, no assistant prefill. If Claude ignores the hint even once, the whole request 500s (or 400s through your handler).

### Three reasons Claude ignored it

1. **The persona instructions overpower the format hint.** Your system prompt says "Never break character", "You are NOT a polite robot", and "Respond in 1 to 3 short sentences maximum. Do not write paragraphs." Emitting a JSON object looks, to the model, like breaking character and violating brevity. The system prompt is high-salience; the format hint is one line buried after a wall of retrieved textbook text.
2. **The old `EVALUATION INSTRUCTIONS` referenced fields that were never defined.** It said "put your reply in the `patientReply` field" but never showed the model what the output object looks like. The only schema description came from langchain4j's auto-generated hint, in a pseudo-format (`(type: java.lang.String)`) that isn't real JSON.
3. **Chat history taught it the wrong format — this is the sneaky one.** `ChatMemoryConfig` rebuilds memory from your `messages` table, and stored patient messages are plain text (that's what the student sees in the UI). So the conversation Claude received looked like:

   ```
   user:      Where does it hurt?
   assistant: It's this back tooth. Hurts when I chew.     ← plain text, no JSON
   user:      Is it sensitive to cold?
   ```

   Few-shot conditioning from its own apparent past turns is extremely strong. The model concludes "in this conversation I answer in plain prose" and does exactly that, regardless of the instruction. This is why the failure gets *more* likely as the conversation grows, and why it can look intermittent.

---

## 4. The fix, file by file

### 4.1 `chat/service/AiPatientService.java`

**Change A — return type `AiPatientResponse` → `String`:**

```java
    String chatWithStudent(
            @MemoryId UUID sessionId,
            @dev.langchain4j.service.V("patientProfile") String patientProfile,
            @dev.langchain4j.service.V("correctDiagnosis") String correctDiagnosis,
            @UserMessage String userMessage
    );
```

Why: with a `String` return type, langchain4j skips step 3 and step 5 entirely. No auto-generated format hint, and **no Gson parsing** — so the exception you saw can no longer be thrown from inside the library. I take ownership of both the instruction and the parsing, where I can make them tolerant. The unused `import com.marta.chat.dto.AiPatientResponse;` was removed since the interface no longer mentions the type.

**Change B — an explicit output contract appended to the system prompt:**

```java
        "OUTPUT FORMAT (MANDATORY):",
        "Your entire response must be a single raw JSON object and nothing else. No greeting, no explanation, no markdown code fences, no text before or after the object.",
        "The object has exactly these three keys:",
        "\"patientReply\": string — the words you say out loud as the patient.",
        "\"diagnosisFound\": boolean — true only when the student has explicitly declared the correct diagnosis.",
        "\"diagnosis\": string or null — the diagnosis the student stated, or null when diagnosisFound is false.",
        "Example of a valid response:",
        "{\"patientReply\": \"It's this back tooth, it kills me when I chew.\", \"diagnosisFound\": false, \"diagnosis\": null}",
        "The BREVITY rule applies to the text inside 'patientReply' only — the JSON wrapper is always required, on every single turn."
```

Line-by-line reasoning:

- *"single raw JSON object and nothing else"* — kills the two most common failure shapes: a conversational preamble ("Here's my response:") and markdown fences (` ```json `).
- Naming the three keys with types replaces langchain4j's `(type: java.lang.String)` pseudo-schema with something a language model reads naturally.
- The **concrete example** matters more than the prose. One valid sample output is worth several sentences of specification.
- The last line resolves the direct contradiction with rule 6 (BREVITY). Previously "1 to 3 short sentences, do not write paragraphs" argued against emitting JSON at all; now brevity is explicitly scoped to the `patientReply` value.

`@SystemMessage` takes a `String[]` and joins the elements with `\n`, so each array entry becomes its own line in the prompt.

**A note on braces:** langchain4j's default prompt template only substitutes **double**-brace variables (`{{patientProfile}}`). The single braces in the JSON example are left alone, so the example does not break templating. Keep it that way — never put `{{` inside the example.

### 4.2 `chat/dto/AiPatientResponse.java`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiPatientResponse {
    private String patientReply;
    private Boolean diagnosisFound;
    private String diagnosis;
}
```

Only `@NoArgsConstructor` was added. Gson could instantiate a class without a default constructor via `sun.misc.Unsafe`; **Jackson cannot** — it needs either a no-args constructor or annotated creator parameters. Since I now parse with Jackson (already on the classpath via `spring-boot-starter-web`, no new dependency), the class needs the default constructor. `@AllArgsConstructor` stays because I still build instances by hand in two places.

### 4.3 `chat/service/DiagnosticSessionService.java`

**New fields:**

```java
    private static final Logger log = LoggerFactory.getLogger(DiagnosticSessionService.class);

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
```

- `log` — so a format slip is recorded instead of silently swallowed.
- `OBJECT_MAPPER` — `static final` because `ObjectMapper` is thread-safe and expensive to build; one instance per class is the standard pattern. `FAIL_ON_UNKNOWN_PROPERTIES = false` means that if Claude invents an extra key (`"emotion": "annoyed"`), we ignore it instead of throwing.

**Call site (step D of `sendMessage`):**

```java
        String rawAiOutput = aiPatientService.chatWithStudent(
                session.getId(),
                patientProfile,
                patientCase.getCorrectDiagnosis(),
                enrichedMessage
        );

        AiPatientResponse aiResponse = parseAiOutput(rawAiOutput);
```

Everything after this point (`aiResponse.getDiagnosisFound()`, `aiResponse.getPatientReply()`) is unchanged — the rest of the method still works with the same POJO, so steps E and F did not move.

**The parser:**

```java
    private AiPatientResponse parseAiOutput(String rawOutput) {
        String text = rawOutput == null ? "" : rawOutput.trim();

        int objectStart = text.indexOf('{');
        int objectEnd = text.lastIndexOf('}');
        if (objectStart >= 0 && objectEnd > objectStart) {
            try {
                AiPatientResponse parsed = OBJECT_MAPPER.readValue(
                        text.substring(objectStart, objectEnd + 1), AiPatientResponse.class);
                if (parsed.getPatientReply() != null && !parsed.getPatientReply().isBlank()) {
                    return parsed;
                }
            } catch (JsonProcessingException e) {
                log.warn("AI patient reply was not valid JSON, falling back to raw text: {}", e.getMessage());
            }
        }

        return new AiPatientResponse(text, false, null);
    }
```

What each part buys you:

| Line | Purpose |
|------|---------|
| `rawOutput == null ? "" : rawOutput.trim()` | Never NPE, and drop leading/trailing whitespace or newlines |
| `indexOf('{')` / `lastIndexOf('}')` | Extract the outermost JSON object. This is what tolerates a preamble ("Sure, here you go: {...}") and markdown fences (` ```json\n{...}\n``` `) — both are simply sliced away |
| `objectEnd > objectStart` | Guards against a stray `{` with no closing brace, or the braces appearing in the wrong order |
| `readValue(..., AiPatientResponse.class)` | The actual deserialization |
| `patientReply != null && !isBlank()` | A technically-valid object with an empty reply is useless — `Message.textContent` would be null/empty and the student would see a blank bubble. Treat it as a failure and fall through |
| `catch (JsonProcessingException e)` | Catches malformed JSON (trailing comma, unescaped quote, truncated output when `max-tokens` is hit). Logs the reason, does not kill the request |
| `return new AiPatientResponse(text, false, null)` | The fallback: if all else fails, whatever Claude said becomes the patient's line, `diagnosisFound = false` |

The design principle: **a formatting slip must never cost a student their turn.** In the worst case, that turn just doesn't get diagnosis-detection — the conversation continues, the message is persisted, and you get a `WARN` in the log telling you it happened.

Note that `diagnosisFound` is read via `Boolean.TRUE.equals(aiResponse.getDiagnosisFound())` in step E, which already handles a `null` value safely (Claude omitting the key does not NPE).

### 4.4 `chat/config/ChatMemoryConfig.java`

This is the fix for root cause #3, and the least obvious of the four.

```java
                    if (msg.getSenderRole() == SenderRole.PATIENT) {
                        // Replay past replies in the JSON shape the model is asked to produce,
                        // otherwise the plain-text history teaches it to drop the wrapper.
                        return AiMessage.from(asJsonReply(msg.getTextContent()));
                    }
```

```java
    private String asJsonReply(String patientReply) {
        try {
            return OBJECT_MAPPER.writeValueAsString(new AiPatientResponse(patientReply, false, null));
        } catch (JsonProcessingException e) {
            return patientReply;
        }
    }
}
```

Stored text `It's this back tooth.` is now replayed to the model as:

```json
{"patientReply":"It's this back tooth.","diagnosisFound":false,"diagnosis":null}
```

Points worth understanding:

- Serializing with Jackson (rather than string concatenation) handles escaping correctly. Patient replies contain apostrophes, quotes and newlines; hand-built JSON would produce invalid history.
- `diagnosisFound:false, diagnosis:null` is used for **every** replayed turn, including the turn where the diagnosis was actually found. That is acceptable: history exists to demonstrate *format*, and the real completion state lives in `DiagnosticSession.diagnosisReached` in Postgres, which `sendMessage` checks up front. Nothing in the app reads the diagnosis flag back out of memory.
- This only affects what the **model** sees. `MessageResponse` → the frontend still carries plain text; nothing in the UI changes.
- When does this code even run? langchain4j caches one `ChatMemory` per `memoryId` in a map for the lifetime of the JVM. The provider is therefore invoked on the *first* message of a session in that process; after that the live in-memory `AiMessage`s are whatever Claude actually returned (already JSON). The provider matters after a **restart**, or when an old session is resumed — exactly the cases where a long plain-text history used to drag the model out of format.

### 4.5 `src/main/resources/application.properties`

```properties
# Uncomment to see the exact prompt sent to Claude and the raw text it returns
#langchain4j.anthropic.chat-model.log-requests=true
#langchain4j.anthropic.chat-model.log-responses=true
```

Left commented out because they are noisy (the RAG blob is printed on every call). Enable them when you want ground truth about what the model returned. Do not leave them on in a deployed study environment — they write conversation content into your logs.

---

## 5. Request flow after the fix

```
POST /marta/api/v1/chat/{sessionId}/message
  → JwtAuthenticationFilter sets participantId as the principal
  → @RateLimiter("chatLimit")  (1 request / 3s)
  → DiagnosticSessionService.sendMessage
      1. load session, verify ownership, reject if diagnosisReached
      2. persist the student Message (STUDENT)
      3. KnowledgeRetrievalService → pgvector similarity search → relevantFacts
      4. enrichedMessage = student text + [SYSTEM INSTRUCTION] + relevantFacts
      5. load Case → build patientProfile string
      6. aiPatientService.chatWithStudent(...) → RAW STRING from Claude
           · langchain4j renders @SystemMessage with the JSON contract
           · ChatMemoryProvider supplies history (patient turns as JSON)
           · Anthropic Messages API call
      7. parseAiOutput(raw)
           · slice outermost { ... } → Jackson → AiPatientResponse
           · on any failure → AiPatientResponse(raw, false, null) + WARN log
      8. if diagnosisFound → session.diagnosisReached = true, save
      9. persist the patient Message (PATIENT) with patientReply only
     10. return MessageResponse to the frontend
```

---

## 6. How to verify

```powershell
cd backend
./mvnw -o clean compile      # already passing on my end
./mvnw spring-boot:run
```

The stale-build point from §2 is the important one: `backend/target/classes` still contained the old `try/catch`, so restart against a fresh build before testing.

Then, in the app:

1. Start a case and send 5–10 messages, including clinical jargon and an explicit diagnosis declaration ("I believe you have cracked tooth syndrome") to confirm `diagnosisFound` still flips and the case closes.
2. **Restart the backend mid-conversation and keep chatting.** This is the specific scenario the memory change targets — it forces `ChatMemoryProvider` to rebuild history from Postgres.
3. Grep the log for `AI patient reply was not valid JSON`. Zero occurrences is the goal; occasional occurrences mean the prompt needs more pressure, but the app keeps working either way.

---

## 7. Known limits and the longer-term path

- **This is prompt-based JSON, not enforced JSON.** langchain4j 0.31.0 (May 2024) predates structured-output support for Anthropic. The contract is now explicit, the history reinforces it, and parsing is tolerant, so a slip degrades gracefully instead of erroring — but nothing at the API level *guarantees* JSON.
- **The real fix is a version upgrade.** langchain4j 1.x supports Anthropic tool calling, which lets you force the model into a schema so the JSON is structurally guaranteed. That upgrade renames packages and changes the `ChatMemoryProvider`/`ChatModel` APIs, so it is a separate piece of work — worth scheduling before the study goes live, not worth doing mid-debug.
- **Truncation is a real risk.** `max-tokens=1000` with a long RAG blob is fine today, but if a reply is ever cut off mid-object, `lastIndexOf('}')` will not find a closing brace and you will fall back to raw text (which will look like a half-written JSON string to the student). If you see that in testing, raise `max-tokens`.
- **Temperature 0.25** already helps format stability. Do not raise it much for the sake of "more personality" without re-testing the JSON compliance.

---

## 8. Housekeeping spotted along the way

- `backend/src/main/resources/application.properties` is **untracked, not ignored**. It contains your live Anthropic API key and the Neon database password. A `git add .` would commit both to history. Add it to `.gitignore` (`application.properties.example` is what belongs in the repo) and rotate the key if it has ever been pushed.
- `backend/target/` is likewise untracked rather than ignored — hundreds of `.class` files are currently staged for the next `git add .`. It should be in `.gitignore` too.
- Consider adding an `@ExceptionHandler(Exception.class)` to `GlobalExceptionHandler` returning 500 with a generic message. Right now only `IllegalArgumentException` and validation errors are handled, so any unexpected runtime failure returns a raw Spring error page rather than your JSON error shape.

---

## 9. Change inventory

| File | Lines touched | Nature |
|------|---------------|--------|
| `backend/src/main/java/com/marta/chat/service/AiPatientService.java` | import removed, +9 prompt lines, return type | Behavioural |
| `backend/src/main/java/com/marta/chat/service/DiagnosticSessionService.java` | +6 imports, +2 fields, call site, +24-line `parseAiOutput` | Behavioural |
| `backend/src/main/java/com/marta/chat/config/ChatMemoryConfig.java` | +3 imports, +1 field, history mapping, +7-line `asJsonReply` | Behavioural |
| `backend/src/main/java/com/marta/chat/dto/AiPatientResponse.java` | `@NoArgsConstructor` | Enabling |
| `backend/src/main/resources/application.properties` | +3 commented lines | Debug aid |

No dependency changes; no database or API-contract changes; the frontend is untouched.
