# Mobile API Documentation

This document describes the mobile API endpoints for the Expo iOS app integration.

## Authentication

All mobile API endpoints (except `/api/mobile/auth/*`) require authentication via JWT bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Setup

Add the following environment variables to your `.env.local` file:

```bash
JWT_SECRET=<generate-a-random-secret-using-openssl-rand-base64-32>
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=30d
```

## API Endpoints

### Authentication Endpoints

#### POST `/api/mobile/auth/google`

Authenticate user with Google ID token and receive JWT tokens.

**Request Body:**
```json
{
  "idToken": "google_id_token_from_mobile_app"
}
```

**Response (200):**
```json
{
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "image": "https://..."
    }
  }
}
```

**Errors:**
- `400`: Missing or invalid idToken
- `500`: Authentication failed

---

#### POST `/api/mobile/auth/refresh`

Exchange refresh token for a new access token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "data": {
    "accessToken": "new_jwt_access_token"
  }
}
```

**Errors:**
- `400`: Missing refreshToken
- `401`: Invalid or expired refresh token
- `500`: Token refresh failed

---

### Library Endpoints

#### GET `/api/mobile/library/sections`

Get all sections for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "To Read",
      "parentId": null,
      "enableIntegrationCleanup": false,
      "userId": "user_id",
      "creationTime": "2024-01-01T00:00:00.000Z",
      "updateTime": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Errors:**
- `401`: Unauthorized (missing or invalid token)
- `500`: Failed to fetch sections

---

#### POST `/api/mobile/library/sections`

Create a new section for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "New Section"
}
```

**Response (200):**
```json
{
  "data": {
    "id": 2,
    "name": "New Section",
    "userId": "user_id"
  }
}
```

**Errors:**
- `400`: Missing or invalid section name
- `401`: Unauthorized
- `500`: Failed to create section

---

#### GET `/api/mobile/library/sections/[id]`

Get a single section by ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "To Read",
    "parentId": null,
    "enableIntegrationCleanup": false,
    "userId": "user_id",
    "creationTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `400`: Invalid section ID
- `401`: Unauthorized
- `403`: Forbidden (section doesn't belong to user)
- `404`: Section not found
- `500`: Failed to fetch section

---

#### PATCH `/api/mobile/library/sections/[id]`

Update a section's name.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Updated Section Name"
}
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "Updated Section Name",
    "parentId": null,
    "enableIntegrationCleanup": false,
    "userId": "user_id",
    "creationTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `400`: Invalid section ID or missing/invalid name
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Section not found
- `500`: Failed to update section

---

#### DELETE `/api/mobile/library/sections/[id]`

Delete a section and all its child sections/fanfics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "data": {
    "success": true
  }
}
```

**Errors:**
- `400`: Invalid section ID
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Section not found
- `500`: Failed to delete section

---

#### GET `/api/mobile/library/sections/[id]/fanfics`

Get all fanfics in a section.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "fanficId": 123,
      "sectionId": 1,
      "position": 0,
      "userId": "user_id",
      "kudos": false,
      "latestStartingChapter": null,
      "editableLabels": [],
      "externalId": 45678,
      "title": "Fanfic Title",
      "summary": "Fanfic summary...",
      "author": "Author Name",
      "authorUrl": "https://archiveofourown.org/users/...",
      "sourceUrl": "https://archiveofourown.org/works/45678",
      "downloadLink": "https://archiveofourown.org/downloads/45678/...",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "completedAt": null,
      "tags": {
        "Rating": ["Teen And Up Audiences"],
        "Category": ["M/M"],
        "Fandom": ["Harry Potter"]
      },
      "wordCount": 50000,
      "chapterCount": "10/15",
      "language": "English",
      "sectionName": "To Read",
      "sectionParentId": null
    }
  ]
}
```

**Errors:**
- `400`: Invalid section ID
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Section not found
- `500`: Failed to fetch fanfics

---

#### POST `/api/mobile/library/sections/[id]/fanfics`

Add a fanfic to a section by AO3 URL.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "fanficUrl": "https://archiveofourown.org/works/12345"
}
```

**Response (200):**
```json
{
  "data": {
    "success": true,
    "fanfics": [
      // Array of all fanfics in the section after adding
    ]
  }
}
```

**Errors:**
- `400`: Invalid section ID, missing/invalid fanficUrl, or invalid AO3 URL
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Section not found
- `500`: Failed to add fanfic

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

## Implementation Details

### JWT Token Structure

Access tokens and refresh tokens are JWTs with the following payload:

```typescript
{
  userId: string;
  type: "access" | "refresh";
  iat: number;  // Issued at timestamp
  exp: number;  // Expiration timestamp
}
```

### Token Expiry

- **Access Token**: 1 hour (configurable via `JWT_EXPIRY`)
- **Refresh Token**: 30 days (configurable via `REFRESH_TOKEN_EXPIRY`)

### Security

- All tokens are signed with `JWT_SECRET`
- Access tokens must have `type: "access"`
- Refresh tokens must have `type: "refresh"`
- Tokens are validated on every API call
- User authorization is checked for all resource access

## Mobile App Integration

### React Native / Expo Example

```typescript
import * as Google from 'expo-auth-session/providers/google';

// 1. Authenticate with Google
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: 'YOUR_GOOGLE_CLIENT_ID',
});

// 2. Exchange Google ID token for JWT
const response = await fetch('https://your-api.com/api/mobile/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken: googleIdToken }),
});

const { data } = await response.json();
// Store data.accessToken and data.refreshToken securely

// 3. Use access token for API calls
const sections = await fetch('https://your-api.com/api/mobile/library/sections', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

// 4. Refresh token when access token expires
const refreshResponse = await fetch('https://your-api.com/api/mobile/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken }),
});

const { data: { accessToken: newAccessToken } } = await refreshResponse.json();
```

## Testing

You can test the endpoints using curl:

```bash
# 1. Get Google ID token from mobile app
# (Use expo-auth-session or react-native-google-signin)

# 2. Authenticate
curl -X POST http://localhost:3000/api/mobile/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"YOUR_GOOGLE_ID_TOKEN"}'

# 3. Use the access token
curl http://localhost:3000/api/mobile/library/sections \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Create a section
curl -X POST http://localhost:3000/api/mobile/library/sections \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My New Section"}'

# 5. Add a fanfic
curl -X POST http://localhost:3000/api/mobile/library/sections/1/fanfics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fanficUrl":"https://archiveofourown.org/works/12345"}'
```
