# Mobile API Quick Reference

## 🚀 Quick Start

### 1. Setup Environment Variables
```bash
# Generate JWT secret
openssl rand -base64 32

# Add to .env.local
JWT_SECRET=<your-generated-secret>
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=30d
```

### 2. Start Development Server
```bash
pnpm run dev
```

### 3. Test Authentication
```bash
# Get Google ID token from mobile app, then:
curl -X POST http://localhost:3000/api/mobile/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"YOUR_GOOGLE_ID_TOKEN"}'
```

---

## 📍 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mobile/auth/google` | Login with Google ID token |
| POST | `/api/mobile/auth/refresh` | Refresh access token |

### Library - Sections
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mobile/library/sections` | List all sections |
| POST | `/api/mobile/library/sections` | Create section |
| GET | `/api/mobile/library/sections/[id]` | Get section |
| PATCH | `/api/mobile/library/sections/[id]` | Update section |
| DELETE | `/api/mobile/library/sections/[id]` | Delete section |

### Library - Fanfics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mobile/library/sections/[id]/fanfics` | List fanfics in section |
| POST | `/api/mobile/library/sections/[id]/fanfics` | Add fanfic by AO3 URL |

---

## 🔐 Authorization Header
```
Authorization: Bearer <access_token>
```

---

## 📦 Response Format

### Success
```json
{
  "data": { /* response data */ }
}
```

### Error
```json
{
  "error": "Error message"
}
```

---

## 🔑 Token Flow

```
Mobile App
    ↓ Google ID Token
[POST /api/mobile/auth/google]
    ↓ JWT Access + Refresh Tokens
Store tokens securely
    ↓ Access Token
[API Requests with Bearer Token]
    ↓ 401 Unauthorized
[POST /api/mobile/auth/refresh]
    ↓ New Access Token
Retry original request
```

---

## 📱 Expo Integration

```typescript
// Install dependencies
npm install expo-auth-session expo-secure-store

// Google Auth
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';

// 1. Login
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: 'YOUR_CLIENT_ID',
});

// 2. Exchange token
const { data } = await fetch('/api/mobile/auth/google', {
  method: 'POST',
  body: JSON.stringify({ idToken }),
});

// 3. Store tokens
await SecureStore.setItemAsync('accessToken', data.accessToken);
await SecureStore.setItemAsync('refreshToken', data.refreshToken);

// 4. Make requests
const accessToken = await SecureStore.getItemAsync('accessToken');
fetch('/api/mobile/library/sections', {
  headers: { Authorization: `Bearer ${accessToken}` }
});
```

---

## 📂 File Locations

| Purpose | Path |
|---------|------|
| Auth Library | `app/lib/auth/mobile.ts` |
| Auth Endpoints | `app/api/mobile/auth/` |
| Library Endpoints | `app/api/mobile/library/` |
| Full Documentation | `MOBILE_API.md` |
| Environment Template | `.env.example` |

---

## ⚡ Common Operations

### Create a Section
```bash
curl -X POST http://localhost:3000/api/mobile/library/sections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Reading List"}'
```

### Add a Fanfic
```bash
curl -X POST http://localhost:3000/api/mobile/library/sections/1/fanfics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fanficUrl":"https://archiveofourown.org/works/12345"}'
```

### List Sections
```bash
curl http://localhost:3000/api/mobile/library/sections \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unauthorized" (401) | Check Authorization header format |
| "Invalid token" | Token expired, use refresh endpoint |
| "Forbidden" (403) | Resource belongs to different user |
| "Missing JWT_SECRET" | Add to .env.local |

---

## 📚 See Also

- **Full API Docs**: `MOBILE_API.md`
- **Implementation Summary**: `MOBILE_API_IMPLEMENTATION_SUMMARY.md`
- **Environment Template**: `.env.example`
