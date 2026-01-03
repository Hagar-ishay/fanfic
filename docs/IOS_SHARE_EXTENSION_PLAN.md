# iOS Share Extension Implementation Plan

## Overview
Build a minimal iOS app with Share Extension to allow users to add AO3 fanfics to their library directly from Safari mobile.

## Architecture

### Components
1. **Minimal iOS Container App** - Just handles Google OAuth sign-in and stores session cookie
2. **Share Extension** - The actual functionality that appears in Safari's share sheet
3. **Shared Authentication** - App Group to share session cookies between app and extension

### Technical Stack
- **Language:** Swift
- **UI Framework:** SwiftUI (main app) + UIKit (Share Extension)
- **Authentication:** Google Sign-In iOS SDK
- **Data Sharing:** App Groups + UserDefaults
- **Networking:** URLSession
- **Deployment:** TestFlight → App Store

## API Endpoints (Already Built)
- `GET /api/share-extension/sections` - Returns user's sections and default section
- `POST /api/share-extension/add-fanfic` - Adds fanfic to library

## Implementation Steps

### Step 1: Xcode Project Setup

**Create new iOS App project:**
- Name: "FanficLibrary" (or your choice)
- Organization Identifier: `com.yourname` (replace with your domain)
- Interface: SwiftUI
- Language: Swift
- Bundle ID: `com.yourname.fanficlibrary`

**Add Share Extension target:**
- File → New → Target → Share Extension
- Name: "AddToLibrary"
- Bundle ID: `com.yourname.fanficlibrary.share`

### Step 2: Configure App Groups

**In Apple Developer Portal:**
1. Go to Certificates, Identifiers & Profiles
2. Create App Group: `group.com.yourname.fanficlibrary`
3. Add App Group to both App ID and Extension ID

**In Xcode (both targets):**
1. Select target → Signing & Capabilities
2. Click "+ Capability" → App Groups
3. Enable the app group created above

### Step 3: Dependencies

Add via Swift Package Manager:
- Google Sign-In: `https://github.com/google/GoogleSignIn-iOS`

### Step 4: Main App Implementation

**Files to create:**

**`ContentView.swift`** - Main app screen
```swift
import SwiftUI
import GoogleSignIn

struct ContentView: View {
    @State private var isSignedIn = false
    @State private var userName: String = ""

    var body: some View {
        VStack(spacing: 30) {
            if isSignedIn {
                VStack(spacing: 20) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.green)

                    Text("Welcome, \(userName)!")
                        .font(.title2)

                    Text("You're all set!")
                        .font(.headline)

                    Divider()
                        .padding()

                    VStack(alignment: .leading, spacing: 15) {
                        HStack {
                            Image(systemName: "1.circle.fill")
                                .foregroundColor(.blue)
                            Text("Open Safari")
                        }
                        HStack {
                            Image(systemName: "2.circle.fill")
                                .foregroundColor(.blue)
                            Text("Go to an AO3 fanfic")
                        }
                        HStack {
                            Image(systemName: "3.circle.fill")
                                .foregroundColor(.blue)
                            Text("Tap Share → Add to Library")
                        }
                    }
                    .font(.body)

                    Button("Open Web App") {
                        openWebApp()
                    }
                    .buttonStyle(.borderedProminent)
                    .padding(.top, 20)

                    Button("Sign Out") {
                        signOut()
                    }
                    .foregroundColor(.red)
                    .padding(.top, 10)
                }
            } else {
                VStack(spacing: 20) {
                    Text("Fanfic Library")
                        .font(.largeTitle)
                        .bold()

                    Text("Sign in to add fanfics from Safari")
                        .multilineTextAlignment(.center)
                        .foregroundColor(.secondary)

                    GoogleSignInButton {
                        handleSignIn()
                    }
                }
            }
        }
        .padding()
        .onAppear {
            checkAuthStatus()
        }
    }

    private func checkAuthStatus() {
        // Check if we have saved session
        let sharedDefaults = UserDefaults(suiteName: "group.com.yourname.fanficlibrary")
        if let cookie = sharedDefaults?.string(forKey: "sessionCookie"),
           let name = sharedDefaults?.string(forKey: "userName") {
            isSignedIn = true
            userName = name
        }
    }

    private func handleSignIn() {
        // Implement Google Sign-In
        // After successful sign-in:
        // 1. Get session cookie from web view
        // 2. Save to shared UserDefaults
        // 3. Update UI
    }

    private func signOut() {
        let sharedDefaults = UserDefaults(suiteName: "group.com.yourname.fanficlibrary")
        sharedDefaults?.removeObject(forKey: "sessionCookie")
        sharedDefaults?.removeObject(forKey: "userName")
        isSignedIn = false
        userName = ""
    }

    private func openWebApp() {
        if let url = URL(string: "https://your-domain.vercel.app") {
            UIApplication.shared.open(url)
        }
    }
}
```

**`AuthenticationManager.swift`** - Handles OAuth and cookie extraction
```swift
import Foundation
import WebKit

class AuthenticationManager: NSObject, ObservableObject {
    @Published var isAuthenticated = false

    private let webView = WKWebView()
    private let appGroup = "group.com.yourname.fanficlibrary"

    func authenticateWithWeb() {
        // Load your web app's OAuth flow
        let url = URL(string: "https://your-domain.vercel.app/api/auth/signin")!
        webView.load(URLRequest(url: url))

        // Monitor cookies and save session cookie when available
        webView.configuration.websiteDataStore.httpCookieStore.getAllCookies { [weak self] cookies in
            if let sessionCookie = cookies.first(where: {
                $0.name.contains("authjs") || $0.name.contains("next-auth")
            }) {
                self?.saveSessionCookie(sessionCookie)
            }
        }
    }

    private func saveSessionCookie(_ cookie: HTTPCookie) {
        let cookieString = "\(cookie.name)=\(cookie.value)"
        let sharedDefaults = UserDefaults(suiteName: appGroup)
        sharedDefaults?.set(cookieString, forKey: "sessionCookie")

        isAuthenticated = true
    }
}
```

### Step 5: Share Extension Implementation

**`ShareViewController.swift`** - Main Share Extension logic

Key features:
- Extract URL from share context
- Load sections from API
- Display section picker
- Send add request to API
- Handle success/error states

**Implementation requirements:**
1. UIPickerView for section selection
2. Highlight default section with ⭐️
3. Show hierarchy for nested sections with indentation
4. Activity indicator during API calls
5. Success/error messages with auto-dismiss
6. Get session cookie from shared UserDefaults

**API integration:**
```swift
// GET sections
let url = URL(string: "https://your-domain.vercel.app/api/share-extension/sections")!
var request = URLRequest(url: url)
request.setValue(sessionCookie, forHTTPHeaderField: "Cookie")

// POST add fanfic
let url = URL(string: "https://your-domain.vercel.app/api/share-extension/add-fanfic")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.setValue(sessionCookie, forHTTPHeaderField: "Cookie")
request.httpBody = try? JSONSerialization.data(withJSONObject: [
    "url": sharedURL,
    "sectionId": selectedSectionId
])
```

### Step 6: Share Extension Configuration

**`Info.plist` (Share Extension target):**

Add activation rules to only show for URLs:
```xml
<key>NSExtension</key>
<dict>
    <key>NSExtensionAttributes</key>
    <dict>
        <key>NSExtensionActivationRule</key>
        <dict>
            <key>NSExtensionActivationSupportsWebURLWithMaxCount</key>
            <integer>1</integer>
        </dict>
    </dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.share-services</string>
    <key>NSExtensionPrincipalClass</key>
    <string>$(PRODUCT_MODULE_NAME).ShareViewController</string>
</dict>
```

### Step 7: App Icons & Metadata

**Required assets:**
- App icon (1024x1024)
- Share extension icon (optional, inherits from app)

**App Store metadata:**
- Name: "Fanfic Library" (or your choice)
- Subtitle: "Save AO3 fics from Safari"
- Description: Explain the share extension functionality
- Screenshots: Show share sheet and section picker
- Privacy policy URL (required for OAuth)

### Step 8: Testing

**Test cases:**
1. ✅ Sign in with Google → Session cookie saved
2. ✅ Open Safari → Navigate to AO3 work
3. ✅ Tap Share → "Add to Library" appears
4. ✅ Extension loads sections successfully
5. ✅ Default section is highlighted
6. ✅ Can select different section
7. ✅ Add fanfic → Success message
8. ✅ Try adding duplicate → Error message
9. ✅ Invalid URL → Error message
10. ✅ Sign out → Extension shows auth error

**Testing workflow:**
1. Build on simulator first
2. Test with TestFlight on real device
3. Verify session sharing works
4. Test all error cases

### Step 9: Deployment

**Pre-submission:**
1. Set up App Store Connect app
2. Create App Group in Developer Portal
3. Configure OAuth redirect URIs (if needed)
4. Prepare privacy policy (required for Google Sign-In)

**Submission:**
1. Archive app in Xcode
2. Upload to App Store Connect
3. Submit for TestFlight (beta testing)
4. After testing, submit for App Store review

**App Review notes:**
- Explain Share Extension functionality
- Provide test account credentials
- Show how to use the extension

## Configuration Checklist

- [ ] Replace `group.com.yourname.fanficlibrary` with your App Group ID
- [ ] Replace `com.yourname.fanficlibrary` with your Bundle ID
- [ ] Replace `https://your-domain.vercel.app` with your actual domain
- [ ] Set up Google OAuth client ID for iOS
- [ ] Create Apple Developer account ($99/year)
- [ ] Create App Store Connect app listing
- [ ] Prepare app icons and screenshots
- [ ] Write privacy policy (can be simple for this use case)

## File Structure

```
FanficLibrary/
├── FanficLibrary/                    # Main app target
│   ├── ContentView.swift             # Main screen
│   ├── AuthenticationManager.swift   # OAuth handling
│   ├── FanficLibraryApp.swift       # App entry point
│   └── Assets.xcassets               # App icons
├── AddToLibrary/                     # Share Extension target
│   ├── ShareViewController.swift     # Extension UI & logic
│   ├── Info.plist                    # Extension config
│   └── Assets.xcassets
└── FanficLibrary.xcodeproj
```

## Development Timeline Estimate

- **Day 1:** Xcode setup, Google Sign-In integration
- **Day 2:** Share Extension UI & API integration
- **Day 3:** Testing & bug fixes
- **Day 4:** App Store assets & submission prep
- **Day 5:** TestFlight testing
- **Week 2:** App Store review (typically 1-3 days, but can vary)

## Key Technical Decisions

1. **Authentication:** Use WKWebView to load your web app's OAuth flow (simpler than native Google SDK)
2. **Session sharing:** UserDefaults with App Groups (good enough for MVP)
3. **UI:** UIKit for Share Extension (more control than SwiftUI for extensions)
4. **Error handling:** Show errors in extension, auto-dismiss after 3 seconds
5. **Offline:** No offline support needed (extensions run when Safari is active)

## Security Considerations

1. **Cookie storage:** Consider iOS Keychain instead of UserDefaults for production
2. **HTTPS only:** All API calls must use HTTPS
3. **Certificate pinning:** Optional but recommended for enhanced security
4. **Session expiry:** Handle expired sessions gracefully (show re-auth message)

## Reference Implementation

Full Swift code examples are in: `docs/SHARE_EXTENSION_GUIDE.md`

## Success Criteria

- ✅ User can sign in once and forget about the app
- ✅ Share extension appears in Safari for AO3 URLs
- ✅ Sections load within 2 seconds
- ✅ Adding fanfic completes within 3 seconds
- ✅ Clear error messages for all failure cases
- ✅ Works offline? No - requires network (acceptable)
- ✅ App passes App Store review

## Future Enhancements (Post-MVP)

- Native library browsing in iOS app
- Widget to show recently added fics
- Shortcuts app integration
- Batch add multiple fanfics
- Offline queue for adding when network returns
- Today extension showing reading progress

## Questions to Resolve Before Starting

1. What's your Apple Developer account? (need for App Groups)
2. What domain for the app? (affects Bundle ID)
3. App name preference? (affects App Store listing)
4. Do you have app icon designs? (can use simple placeholder to start)

## Notes for Implementation Agent

- The API endpoints are already built and working
- Focus on minimal viable product first
- Don't over-engineer the main app - it's just a container
- The Share Extension is the real product
- Test extensively on real device, not just simulator
- Session cookie format from NextAuth: Look for cookies with "authjs.session-token" or similar
