# iOS Project Structure & Checklist

## Project File Structure

After completing the setup, your Xcode project should look like this:

```
FanficLibrary.xcodeproj
│
├── FanficLibrary/                          # Main app target
│   ├── FanficLibraryApp.swift             # ✅ App entry point
│   ├── ContentView.swift                   # ✅ Main screen
│   ├── AuthenticationManager.swift         # ✅ OAuth & cookie handling
│   ├── Assets.xcassets/
│   │   ├── AppIcon.appiconset/            # TODO: Add app icons
│   │   ├── AccentColor.colorset/
│   │   └── Contents.json
│   ├── Info.plist
│   └── Preview Content/
│       └── Preview Assets.xcassets/
│
├── AddToLibrary/                           # Share Extension target
│   ├── ShareViewController.swift           # ✅ Extension UI & logic
│   ├── Assets.xcassets/
│   │   └── Contents.json
│   └── Info.plist                         # ⚠️  Configure activation rules
│
└── Shared/                                 # Shared between both targets
    ├── Config.swift                        # ✅ Configuration constants
    ├── Models.swift                        # ✅ Data models
    └── APIClient.swift                     # ✅ Network layer
```

## Target Membership Reference

| File | FanficLibrary | AddToLibrary |
|------|---------------|--------------|
| FanficLibraryApp.swift | ✅ | ❌ |
| ContentView.swift | ✅ | ❌ |
| AuthenticationManager.swift | ✅ | ❌ |
| ShareViewController.swift | ❌ | ✅ |
| Config.swift | ✅ | ✅ |
| Models.swift | ✅ | ✅ |
| APIClient.swift | ✅ | ✅ |

## Implementation Checklist

### Phase 1: Xcode Setup

- [ ] Create new iOS App project named "FanficLibrary"
- [ ] Add Share Extension target named "AddToLibrary"
- [ ] Create "Shared" group/folder

### Phase 2: Apple Developer Portal

- [ ] Create App Group: `group.com.fanfic.library`
- [ ] Add App Group to `com.fanfic.library` App ID
- [ ] Add App Group to `com.fanfic.library.share` App ID

### Phase 3: Xcode Capabilities

- [ ] Add App Groups capability to FanficLibrary target
  - [ ] Enable `group.com.fanfic.library`
- [ ] Add App Groups capability to AddToLibrary target
  - [ ] Enable `group.com.fanfic.library`

### Phase 4: Create Shared Files

- [ ] Create `Shared/Config.swift`
  - [ ] Set both targets in File Inspector
  - [ ] Update API base URL
- [ ] Create `Shared/Models.swift`
  - [ ] Set both targets in File Inspector
- [ ] Create `Shared/APIClient.swift`
  - [ ] Set both targets in File Inspector

### Phase 5: Create Main App Files

- [ ] Update `FanficLibrary/FanficLibraryApp.swift`
- [ ] Update `FanficLibrary/ContentView.swift`
- [ ] Create `FanficLibrary/AuthenticationManager.swift`

### Phase 6: Create Share Extension Files

- [ ] Update `AddToLibrary/ShareViewController.swift`
- [ ] Configure `AddToLibrary/Info.plist`
  - [ ] Verify NSExtensionActivationSupportsWebURLWithMaxCount = 1

### Phase 7: Configuration

- [ ] Update `Config.swift` with production URL
- [ ] Set minimum deployment target to iOS 16.0 (both targets)
- [ ] Configure automatic signing (both targets)

### Phase 8: Testing - Simulator

- [ ] Build and run main app
- [ ] Test sign-in flow (web view loads)
- [ ] Verify session cookie extraction
- [ ] Check signed-in state persists

### Phase 9: Testing - Real Device (Required)

- [ ] Install app on physical iPhone
- [ ] Complete Google sign-in
- [ ] Open Safari
- [ ] Navigate to AO3 work
- [ ] Test Share Extension appears
- [ ] Test section loading
- [ ] Test adding fanfic
- [ ] Test error cases:
  - [ ] Invalid URL
  - [ ] Duplicate fanfic
  - [ ] Session expired (sign out first)

### Phase 10: App Store Preparation

- [ ] Create app icon (1024x1024)
- [ ] Take screenshots (required sizes)
- [ ] Write privacy policy
- [ ] Create App Store Connect app
- [ ] Fill in app metadata
- [ ] Prepare test account

### Phase 11: Deployment

- [ ] Archive app in Xcode
- [ ] Upload to App Store Connect
- [ ] Submit for TestFlight
- [ ] Test via TestFlight
- [ ] Submit for App Store review

## Quick Configuration Values

Copy these values for quick reference:

```swift
// App Group Identifier
group.com.fanfic.library

// Bundle IDs
com.fanfic.library              // Main app
com.fanfic.library.share        // Share Extension

// API Base URL (update this!)
https://your-app-name.vercel.app

// Session Cookie Names (NextAuth)
authjs.session-token
__Secure-authjs.session-token
```

## File Creation Order

Follow this order to avoid dependency issues:

1. **First**: Create all Shared files (Config.swift, Models.swift, APIClient.swift)
2. **Second**: Set target membership for Shared files (both targets)
3. **Third**: Create/update main app files
4. **Fourth**: Create/update Share Extension files
5. **Last**: Configure Info.plist files

## Common Mistakes to Avoid

1. ❌ Forgetting to set target membership for Shared files
2. ❌ Not enabling App Groups in both Developer Portal AND Xcode
3. ❌ Using different App Group identifiers
4. ❌ Not updating the API base URL in Config.swift
5. ❌ Testing Share Extension only in simulator (won't work properly)
6. ❌ Not configuring Info.plist activation rules correctly
7. ❌ Forgetting to increment build number when updating

## Verification Commands

Run these in Xcode console to verify setup:

```swift
// Check App Group access
print("App Group access: \(Config.sharedDefaults != nil)")

// Check session cookie
print("Has session: \(Config.isAuthenticated)")
print("Cookie: \(Config.sessionCookie ?? "none")")

// Check API URL
print("API URL: \(Config.apiBaseURL)")
```

## Build Settings Reference

### Deployment Target
- **Minimum**: iOS 16.0
- **Recommended**: iOS 17.0 for latest features

### Swift Version
- **Version**: Swift 5.9 or later

### Code Signing
- **Automatically manage signing**: ✅ Enabled
- **Team**: Your Apple Developer team

## Info.plist Keys Reference

### Main App (FanficLibrary/Info.plist)

Usually auto-managed, but verify these exist:
- `CFBundleDisplayName`: FanficLibrary
- `CFBundleIdentifier`: com.fanfic.library
- `NSAppTransportSecurity`: Allow HTTPS connections

### Share Extension (AddToLibrary/Info.plist)

Critical configuration:
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

## Environment Variables

None required in the iOS app! All configuration is in `Config.swift`.

Backend environment variables (already configured):
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `NEXTAUTH_URL` - Production URL
- `DATABASE_URL` - Neon PostgreSQL

## Testing Checklist

### Manual Test Cases

**Main App:**
- [ ] App launches without crash
- [ ] Sign in button appears
- [ ] Tapping sign in opens web view
- [ ] Web view loads production URL
- [ ] Google OAuth completes successfully
- [ ] App extracts session cookie
- [ ] Success screen appears
- [ ] User name displays (if available)
- [ ] Sign out clears session
- [ ] App remembers sign-in after restart

**Share Extension:**
- [ ] Appears in Safari share sheet
- [ ] Only appears for URLs
- [ ] Shows loading state
- [ ] Loads sections successfully
- [ ] Default section has ⭐️ indicator
- [ ] Nested sections are indented
- [ ] Can select different section
- [ ] Add button works
- [ ] Success message appears
- [ ] Auto-dismisses after success
- [ ] Error handling works:
  - [ ] Shows error for non-AO3 URLs
  - [ ] Shows error for duplicates
  - [ ] Shows error when not signed in
  - [ ] Shows error for network issues

### Edge Cases

- [ ] No internet connection
- [ ] Session expired
- [ ] No sections created yet
- [ ] Very long section names
- [ ] Many nested sections (10+ levels)
- [ ] Rapid successive shares
- [ ] App backgrounded during share
- [ ] Device restart

## Performance Targets

- [ ] Sections load in < 2 seconds
- [ ] Add fanfic completes in < 3 seconds
- [ ] App launch time < 1 second
- [ ] Share Extension appears instantly

## Accessibility Checklist

- [ ] All buttons have accessible labels
- [ ] VoiceOver works correctly
- [ ] Dynamic Type supported
- [ ] High contrast mode supported
- [ ] Reduce Motion respected

## File Size Targets

- [ ] Main app IPA < 10 MB
- [ ] Share Extension < 5 MB
- [ ] Total download < 15 MB

## Version History

### v1.0.0 (Initial Release)
- Google OAuth sign-in
- Safari Share Extension
- Section picker with default indicator
- Add fanfic to library
- Error handling
- Auto-dismiss on success

### Future Versions (Ideas)

- v1.1.0: Add widget showing recent fanfics
- v1.2.0: Native library browsing
- v1.3.0: Shortcuts app integration
- v2.0.0: Full reading experience in app

---

**Last Updated**: 2026-01-03

**Implementation Guide**: See `/docs/SHARE_EXTENSION_IMPLEMENTATION.md`

**API Documentation**: See `/docs/IOS_SHARE_EXTENSION_PLAN.md`
