# Authentication API Contract

All authentication endpoints are located under the base URL `/marta/api/v1/auth`. These endpoints are public and do not require an `Authorization` header.

## 1. Register Participant
**Endpoint:** `POST /register`
**Description:** Registers a new participant, collects demographics, and returns the generated `participantId`.

### Request Body (JSON)
```json
{
  "yearOfStudy": 3,
  "sex": "MALE", // Must match the enum values
  "selfReportedConfidence": 0.75, // Must be between 0.0 and 1.0
  "password": "securepassword123", // Minimum 8 characters
  "pin": "1234" // Exactly 4 digits
}
```

### Success Response (200 OK)
```json
{
  "participantId": "A1B2C3D4"
}
```

### Error Response (400 Bad Request) - Validation Failure
```json
{
  "pin": "PIN must be exactly 4 digits",
  "password": "Password must be at least 8 characters long"
}
```

---

## 2. Login Participant
**Endpoint:** `POST /login`
**Description:** Authenticates a participant and returns a JWT token.

### Request Body (JSON)
```json
{
  "participantId": "A1B2C3D4",
  "password": "securepassword123"
}
```

### Success Response (200 OK)
```json
{
  "participantId": "A1B2C3D4",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Error Response (400 Bad Request) - Invalid Credentials
```json
{
  "error": "Invalid password" // or "Invalid participant ID"
}
```

---

## 3. Reset Password
**Endpoint:** `POST /reset-password`
**Description:** Resets the user's password using their 4-digit PIN.

### Request Body (JSON)
```json
{
  "participantId": "A1B2C3D4",
  "pin": "1234",
  "newPassword": "newsecurepassword456"
}
```

### Success Response (200 OK)
```json
{
  "message": "Password reset successfully"
}
```

### Error Response (400 Bad Request) - Invalid PIN
```json
{
  "error": "Invalid PIN"
}
```

---

## 4. Logout (Client-Side Only)
Because the backend uses stateless JWTs, there is no `/logout` endpoint on the server.
**Frontend Implementation:** 
To log a user out, simply delete the JWT token from the client's `localStorage` or `sessionStorage` and redirect them to the login screen.

---

## 5. Researcher Admin Routes
**Base URL:** `/api/auth/researcher`

### 5.1 Login
**Endpoint:** `POST /login`
**Description:** Authenticates a researcher using Email, Password, and PIN, and returns a JWT with the `RESEARCHER` role.

**Request Body (JSON):**
```json
{
  "email": "admin@marta.edu",
  "password": "securepassword123",
  "pin": "1234"
}
```
**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### 5.2 Get All Participants
**Endpoint:** `GET /participants`
**Headers:** `Authorization: Bearer <Researcher_JWT_Token>`
**Description:** Returns a list of all registered participants. Fails if the user is not a researcher.

**Success Response (200 OK):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "participantId": "A1B2C3D4",
    "createdAt": "2026-07-16T12:00:00Z"
  }
]
```

### 5.3 Delete Participant
**Endpoint:** `DELETE /participants/{participantId}`
**Headers:** `Authorization: Bearer <Researcher_JWT_Token>`
**Description:** Deletes a participant and all their associated data (demographics, chat history).

**Success Response (204 No Content):**
*(No body returned, just a 204 status code)*
