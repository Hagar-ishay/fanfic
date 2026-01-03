# iOS Share Extension Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's iPhone                            │
│                                                                   │
│  ┌────────────────────┐         ┌──────────────────────┐        │
│  │  FanficLibrary App │         │  Safari Browser      │        │
│  │                    │         │                      │        │
│  │  ┌──────────────┐  │         │  ┌────────────────┐ │        │
│  │  │ Sign In View │  │         │  │ AO3 Work Page  │ │        │
│  │  │              │  │         │  │                │ │        │
│  │  │ [Google]     │  │         │  │ [Share Button] │ │        │
│  │  └──────┬───────┘  │         │  └────────┬───────┘ │        │
│  │         │          │         │           │         │        │
│  │         ▼          │         │           ▼         │        │
│  │  ┌──────────────┐  │         │  ┌────────────────┐ │        │
│  │  │  WebView     │  │         │  │  Share Sheet   │ │        │
│  │  │  (OAuth)     │  │         │  │                │ │        │
│  │  └──────┬───────┘  │         │  │ ┌────────────┐ │ │        │
│  │         │          │         │  │ │Add to      │ │ │        │
│  │         │          │         │  │ │Library     │◄┼─┼────┐   │
│  │         ▼          │         │  │ └────────────┘ │ │    │   │
│  │  Extract Cookie    │         │  └────────────────┘ │    │   │
│  │         │          │         └──────────────────────┘    │   │
│  │         ▼          │                                     │   │
│  │  ┌──────────────┐  │                                     │   │
│  │  │  App Group   │◄─┼─────────────────────────────────────┘   │
│  │  │ UserDefaults │  │                                         │
│  │  │              │  │         ┌──────────────────────┐        │
│  │  │ sessionCookie├──┼────────►│ Share Extension      │        │
│  │  │ userName     │  │         │                      │        │
│  │  │ userEmail    │  │         │ ┌──────────────────┐ │        │
│  │  └──────────────┘  │         │ │ 1. Extract URL   │ │        │
│  └────────────────────┘         │ │ 2. Check Session │ │        │
│                                  │ │ 3. Load Sections │ │        │
│                                  │ │ 4. Show Picker   │ │        │
│                                  │ │ 5. Add Fanfic    │ │        │
│                                  │ └──────────────────┘ │        │
│                                  └──────────┬───────────┘        │
└─────────────────────────────────────────────┼──────────────────────┘
                                              │
                                              │ HTTPS + Cookie
                                              │
                                              ▼
                         ┌─────────────────────────────────────┐
                         │    Vercel (Production Backend)      │
                         │                                     │
                         │  ┌───────────────────────────────┐  │
                         │  │ GET /api/share-extension/     │  │
                         │  │     sections                  │  │
                         │  │                               │  │
                         │  │ Returns: [Section]            │  │
                         │  │          defaultSectionId     │  │
                         │  └───────────────┬───────────────┘  │
                         │                  │                  │
                         │  ┌───────────────▼───────────────┐  │
                         │  │ POST /api/share-extension/    │  │
                         │  │      add-fanfic               │  │
                         │  │                               │  │
                         │  │ Body: { url, sectionId }      │  │
                         │  │ Returns: { success, message } │  │
                         │  └───────────────┬───────────────┘  │
                         │                  │                  │
                         │  ┌───────────────▼───────────────┐  │
                         │  │ NextAuth Session Validation   │  │
                         │  │ + Database Operations         │  │
                         │  └───────────────────────────────┘  │
                         └─────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────┐                                              ┌─────────┐
│  User   │                                              │  Google │
└────┬────┘                                              └────┬────┘
     │                                                         │
     │ 1. Tap "Sign In"                                       │
     ▼                                                         │
┌─────────────────┐                                           │
│  ContentView    │                                           │
│  (SwiftUI)      │                                           │
└────┬────────────┘                                           │
     │                                                         │
     │ 2. Show WebView                                        │
     ▼                                                         │
┌─────────────────┐                                           │
│  AuthWebView    │                                           │
│  (WKWebView)    │                                           │
└────┬────────────┘                                           │
     │                                                         │
     │ 3. Load /api/auth/signin                              │
     ▼                                                         │
┌─────────────────┐                                           │
│  Production     │                                           │
│  Web App        │                                           │
└────┬────────────┘                                           │
     │                                                         │
     │ 4. Redirect to Google OAuth                           │
     ├──────────────────────────────────────────────────────►│
     │                                                         │
     │ 5. User authorizes                                     │
     │◄────────────────────────────────────────────────────────┤
     │                                                         │
     │ 6. Redirect with auth code                            │
     ▼                                                         │
┌─────────────────┐                                           │
│  Production     │                                           │
│  /api/auth/     │                                           │
│  callback       │                                           │
└────┬────────────┘                                           │
     │                                                         │
     │ 7. Exchange code for token                            │
     ├──────────────────────────────────────────────────────►│
     │                                                         │
     │ 8. Return user info + tokens                          │
     │◄────────────────────────────────────────────────────────┤
     │                                                         │
     │ 9. Set session cookie                                  │
     │    (authjs.session-token)                             │
     ▼                                                         │
┌─────────────────┐                                           │
│  WebView        │                                           │
│  Coordinator    │                                           │
│  (monitors nav) │                                           │
└────┬────────────┘                                           │
     │                                                         │
     │ 10. Detect success (URL changed)                      │
     │ 11. Extract cookies                                    │
     ▼                                                         │
┌─────────────────┐                                           │
│  WKHTTPCookie   │                                           │
│  Store          │                                           │
└────┬────────────┘                                           │
     │                                                         │
     │ 12. Find authjs.session-token                         │
     │ 13. Format: "authjs.session-token=xyz123"             │
     ▼                                                         │
┌─────────────────┐                                           │
│  App Group      │                                           │
│  UserDefaults   │                                           │
│                 │                                           │
│  Save:          │                                           │
│  - sessionCookie│                                           │
│  - userName     │                                           │
│  - userEmail    │                                           │
└─────────────────┘                                           │
                                                              │
```

## Share Extension Flow

```
┌─────────┐
│  User   │
│ in      │
│ Safari  │
└────┬────┘
     │
     │ 1. Tap Share on AO3 work
     ▼
┌──────────────────┐
│  Share Sheet     │
│  (iOS System)    │
└────┬─────────────┘
     │
     │ 2. Tap "Add to Library"
     ▼
┌──────────────────────────────────────────────┐
│  ShareViewController                         │
│  (Our Extension)                             │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Step 1: Extract URL                    │  │
│  │ ────────────────────────────────────── │  │
│  │ NSExtensionContext                     │  │
│  │   → inputItems                         │  │
│  │     → attachments                      │  │
│  │       → loadItem("public.url")         │  │
│  │         → URL object                   │  │
│  └────────────────┬───────────────────────┘  │
│                   │                           │
│  ┌────────────────▼───────────────────────┐  │
│  │ Step 2: Check Authentication           │  │
│  │ ────────────────────────────────────── │  │
│  │ Config.sessionCookie                   │  │
│  │   ↓                                    │  │
│  │ App Group UserDefaults                 │  │
│  │   ↓                                    │  │
│  │ Get "sessionCookie" key                │  │
│  │   ↓                                    │  │
│  │ If nil → Show "Please sign in" error   │  │
│  │ If exists → Continue                   │  │
│  └────────────────┬───────────────────────┘  │
│                   │                           │
│  ┌────────────────▼───────────────────────┐  │
│  │ Step 3: Load Sections (Async)          │  │
│  │ ────────────────────────────────────── │  │
│  │ Show: "Loading sections..."            │  │
│  │ Show: Activity Indicator               │  │
│  │                                        │  │
│  │ APIClient.fetchSections()              │  │
│  │   ↓                                    │  │
│  │ GET /api/share-extension/sections      │  │
│  │ Header: Cookie: authjs.session-token=..│  │
│  │   ↓                                    │  │
│  │ Response: { sections, defaultSectionId }│  │
│  │   ↓                                    │  │
│  │ Parse JSON → [Section]                 │  │
│  └────────────────┬───────────────────────┘  │
│                   │                           │
│  ┌────────────────▼───────────────────────┐  │
│  │ Step 4: Show Section Picker            │  │
│  │ ────────────────────────────────────── │  │
│  │ UIPickerView                           │  │
│  │ ┌────────────────────────────────────┐ │  │
│  │ │ ⭐️     My Library                  │ │  │  ← Default
│  │ │    Reading                         │ │  │  ← Level 1
│  │ │        Currently Reading           │ │  │  ← Level 2
│  │ │        To Read                     │ │  │  ← Level 2
│  │ │    Finished                        │ │  │  ← Level 1
│  │ │ Favorites                          │ │  │  ← Level 0
│  │ └────────────────────────────────────┘ │  │
│  │                                        │  │
│  │ Indentation = depth × "    "           │  │
│  │ ⭐️ indicator = isDefault               │  │
│  │                                        │  │
│  │ User selects section                   │  │
│  │   ↓                                    │  │
│  │ selectedSection = sections[row]        │  │
│  └────────────────┬───────────────────────┘  │
│                   │                           │
│  ┌────────────────▼───────────────────────┐  │
│  │ Step 5: Add Fanfic (Async)             │  │
│  │ ────────────────────────────────────── │  │
│  │ User taps "Add to Library"             │  │
│  │   ↓                                    │  │
│  │ Show: "Adding fanfic..."               │  │
│  │ Show: Activity Indicator               │  │
│  │                                        │  │
│  │ APIClient.addFanfic()                  │  │
│  │   ↓                                    │  │
│  │ POST /api/share-extension/add-fanfic   │  │
│  │ Header: Cookie: authjs.session-token=..│  │
│  │ Body: { url, sectionId }               │  │
│  │   ↓                                    │  │
│  │ Response: { success, message }         │  │
│  │   ↓                                    │  │
│  │ If success:                            │  │
│  │   Show: "✓ Fanfic added successfully"  │  │
│  │   Wait 2 seconds                       │  │
│  │   Auto-dismiss extension               │  │
│  │                                        │  │
│  │ If error:                              │  │
│  │   Show error message                   │  │
│  │   Allow retry or cancel                │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      iOS Device Memory                        │
│                                                              │
│  ┌──────────────────┐                ┌───────────────────┐   │
│  │  Main App        │                │ Share Extension   │   │
│  │  Process         │                │ Process           │   │
│  │                  │                │                   │   │
│  │  Write Cookie ───┼───────┐        │                   │   │
│  │  after sign-in   │       │        │                   │   │
│  │                  │       │        │                   │   │
│  │  Read on         │       │        │  Read Cookie ─────┼───┤
│  │  app launch  ◄───┼───┐   │        │  on activation    │   │
│  │                  │   │   │        │                   │   │
│  └──────────────────┘   │   │        └───────────────────┘   │
│                         │   │                                │
│                         ▼   ▼                ▼               │
│                  ┌─────────────────────────────────────┐     │
│                  │   App Group UserDefaults            │     │
│                  │   (Shared Storage)                  │     │
│                  │                                     │     │
│                  │   group.com.fanfic.library          │     │
│                  │   ───────────────────────────────   │     │
│                  │   Key: sessionCookie                │     │
│                  │   Value: "authjs.session-token=..." │     │
│                  │                                     │     │
│                  │   Key: userName                     │     │
│                  │   Value: "John Doe"                 │     │
│                  │                                     │     │
│                  │   Key: userEmail                    │     │
│                  │   Value: "john@example.com"         │     │
│                  └─────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## API Request Structure

### GET /api/share-extension/sections

```
Request:
────────
GET /api/share-extension/sections HTTP/1.1
Host: your-app.vercel.app
Cookie: authjs.session-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json


Response (Success):
───────────────────
HTTP/1.1 200 OK
Content-Type: application/json

{
  "sections": [
    { "id": 1, "name": "My Library", "parentId": null },
    { "id": 2, "name": "Reading", "parentId": 1 },
    { "id": 3, "name": "Currently Reading", "parentId": 2 },
    { "id": 4, "name": "To Read", "parentId": 2 },
    { "id": 5, "name": "Finished", "parentId": 1 },
    { "id": 6, "name": "Favorites", "parentId": null }
  ],
  "defaultSectionId": 1
}


Response (Unauthorized):
────────────────────────
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Unauthorized"
}
```

### POST /api/share-extension/add-fanfic

```
Request:
────────
POST /api/share-extension/add-fanfic HTTP/1.1
Host: your-app.vercel.app
Cookie: authjs.session-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json

{
  "url": "https://archiveofourown.org/works/12345678",
  "sectionId": 2
}


Response (Success):
───────────────────
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Fanfic added successfully"
}


Response (Error - Invalid URL):
───────────────────────────────
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid AO3 URL"
}


Response (Error - Duplicate):
─────────────────────────────
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "This fanfic is already in your library"
}


Response (Error - Unauthorized):
────────────────────────────────
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Unauthorized"
}
```

## Component Hierarchy

```
FanficLibraryApp (App Entry)
│
└── ContentView (Main Screen)
    │
    ├── AuthenticationManager (@StateObject)
    │   │
    │   ├── checkAuthStatus()
    │   ├── signOut()
    │   └── handleAuthSuccess()
    │
    ├── if isSignedIn:
    │   │
    │   └── Signed In View
    │       ├── Success Icon
    │       ├── Welcome Message
    │       ├── Instructions (5 steps)
    │       ├── "Open Web App" Button
    │       └── "Sign Out" Button
    │
    └── if !isSignedIn:
        │
        └── Sign In View
            ├── App Icon
            ├── Title & Description
            └── "Sign In with Google" Button
                │
                └── .sheet → AuthWebView
                    │
                    └── WebView (UIViewRepresentable)
                        │
                        ├── WKWebView
                        │   └── Load: /api/auth/signin
                        │
                        └── Coordinator (WKNavigationDelegate)
                            │
                            └── didFinish navigation:
                                └── extractSessionCookie()
                                    └── Save to App Group


ShareViewController (Share Extension Entry)
│
├── UI Components
│   ├── containerView
│   ├── titleLabel
│   ├── messageLabel
│   ├── sectionLabel
│   ├── pickerView (UIPickerView)
│   ├── confirmButton
│   ├── cancelButton
│   └── activityIndicator
│
├── State
│   ├── sections: [Section]
│   ├── defaultSectionId: Int?
│   ├── selectedSection: Section?
│   └── sharedURL: String?
│
└── Flow
    ├── viewDidLoad()
    │   ├── setupUI()
    │   └── extractURL()
    │
    ├── extractURL()
    │   └── NSExtensionContext → URL
    │       └── loadSections()
    │
    ├── loadSections()
    │   ├── Check Config.sessionCookie
    │   ├── APIClient.fetchSections()
    │   └── showSectionPicker()
    │
    ├── showSectionPicker()
    │   ├── Update UI
    │   ├── Set default selection
    │   └── Wait for user input
    │
    └── confirmTapped()
        ├── APIClient.addFanfic()
        └── showSuccess() or showError()
            └── Auto-dismiss or allow retry
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        iOS Device                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Network Security Layer                     │ │
│  │                                                         │ │
│  │  • All requests use HTTPS only                         │ │
│  │  • TLS 1.2+ required                                   │ │
│  │  • Certificate validation                              │ │
│  │  • No certificate pinning (future enhancement)         │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ▲                                 │
│                            │                                 │
│  ┌────────────────────────┼──────────────────────────────┐  │
│  │         APIClient      │                              │  │
│  │                        │                              │  │
│  │  All requests include: │                              │  │
│  │  • Cookie header       │                              │  │
│  │  • Content-Type        │                              │  │
│  │  • Accept              │                              │  │
│  └────────────────────────┼──────────────────────────────┘  │
│                            ▲                                 │
│                            │                                 │
│  ┌────────────────────────┼──────────────────────────────┐  │
│  │     Session Storage    │                              │  │
│  │                        │                              │  │
│  │  App Group UserDefaults (NOT Keychain)                │  │
│  │  • sessionCookie (JWT token)                          │  │
│  │  • userName (non-sensitive)                           │  │
│  │  • userEmail (non-sensitive)                          │  │
│  │                                                        │  │
│  │  Note: For production, should migrate to Keychain     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTPS
                                 ▼
        ┌───────────────────────────────────────────┐
        │          Production Backend               │
        │                                           │
        │  ┌─────────────────────────────────────┐  │
        │  │  NextAuth Session Validation        │  │
        │  │                                     │  │
        │  │  1. Parse Cookie header             │  │
        │  │  2. Verify JWT signature            │  │
        │  │  3. Check expiration                │  │
        │  │  4. Load user from database         │  │
        │  │  5. Attach user to request          │  │
        │  └─────────────────────────────────────┘  │
        │                     ▲                      │
        │                     │                      │
        │  All endpoints require authentication      │
        │  Returns 401 if session invalid            │
        └───────────────────────────────────────────┘
```

## Error Handling Flow

```
Any API Call
│
├─ Network Error (no internet, timeout)
│  └─► Show: "Network error: [description]"
│      Allow: Retry or Cancel
│
├─ HTTP 401 Unauthorized (session expired)
│  └─► Show: "Session expired. Please sign in again."
│      Action: Dismiss extension
│      User must: Open main app and sign in again
│
├─ HTTP 400 Bad Request (validation error)
│  └─► Parse error message from response
│      Show: Server error message
│      Examples:
│        • "Invalid AO3 URL"
│        • "This fanfic is already in your library"
│        • "URL is required"
│      Allow: Retry or Cancel
│
├─ HTTP 500 Internal Server Error
│  └─► Show: "Server error: 500"
│      Allow: Retry or Cancel
│
└─ Other Errors (parsing, unexpected)
   └─► Show: "Failed to [action]"
       Log error to console
       Allow: Cancel
```

---

**Visual Guide Created**: 2026-01-03

**Companion Documents**:
- Implementation Guide: `/docs/SHARE_EXTENSION_IMPLEMENTATION.md`
- Quick Start: `/docs/IOS_QUICK_START.md`
- Project Structure: `/docs/IOS_PROJECT_STRUCTURE.md`
