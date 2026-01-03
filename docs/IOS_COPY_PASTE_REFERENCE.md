# iOS Share Extension - Copy-Paste Reference

Quick reference for values you'll need to copy during implementation.

## Configuration Values

### Bundle Identifiers
```
Main App:        com.fanfic.library
Share Extension: com.fanfic.library.share
```

### App Group
```
group.com.fanfic.library
```

### API Base URL
```
https://your-vercel-app.vercel.app
```
⚠️ Replace with your actual Vercel production URL

### Deployment Target
```
iOS 16.0
```

## Share Extension Info.plist

Copy this entire section into `AddToLibrary/Info.plist`:

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

## NextAuth Session Cookie Names

The app looks for these cookie names (in order):

```swift
authjs.session-token
__Secure-authjs.session-token
next-auth.session-token
__Secure-next-auth.session-token
```

No action needed - already in Config.swift

## File Target Membership

Set these files to BOTH targets (check both boxes):

```
✅ Shared/Config.swift           → FanficLibrary + AddToLibrary
✅ Shared/Models.swift           → FanficLibrary + AddToLibrary
✅ Shared/APIClient.swift        → FanficLibrary + AddToLibrary
```

Set these files to ONLY main app target:

```
✅ FanficLibrary/FanficLibraryApp.swift      → FanficLibrary only
✅ FanficLibrary/ContentView.swift           → FanficLibrary only
✅ FanficLibrary/AuthenticationManager.swift → FanficLibrary only
```

Set these files to ONLY extension target:

```
✅ AddToLibrary/ShareViewController.swift → AddToLibrary only
```

## Keyboard Shortcuts in Xcode

```
⌘R           Build and Run
⌘B           Build
⌘⇧K          Clean Build Folder
⌘.           Stop Running
⌘⌥1          Show File Inspector
⌘⇧Y          Show/Hide Console
⌘⇧O          Quick Open File
⌘/           Toggle Comment
```

## Debug Print Statements

### Check session cookie exists
```swift
print("Cookie: \(Config.sessionCookie ?? "none")")
```

### Check App Group access
```swift
print("App Group access: \(Config.sharedDefaults != nil)")
```

### Check authentication
```swift
print("Authenticated: \(Config.isAuthenticated)")
```

### Check API URL
```swift
print("API URL: \(Config.apiBaseURL)")
```

### Debug sections loading
```swift
print("Loaded \(sections.count) sections")
print("Default ID: \(defaultSectionId ?? -1)")
```

## Test URLs

### Valid AO3 URLs for testing
```
https://archiveofourown.org/works/12345678
https://archiveofourown.org/works/12345678/chapters/67890
```

### Invalid URLs for error testing
```
https://google.com
https://example.com
not-a-url
```

## API Test Commands

### Test GET sections
```bash
curl -H "Cookie: authjs.session-token=YOUR_TOKEN_HERE" \
  https://your-vercel-app.vercel.app/api/share-extension/sections
```

### Test POST add fanfic
```bash
curl -X POST \
  -H "Cookie: authjs.session-token=YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://archiveofourown.org/works/12345","sectionId":1}' \
  https://your-vercel-app.vercel.app/api/share-extension/add-fanfic
```

## Common Error Messages

### Share Extension

```
"Please sign in to the Fanfic Library app first"
→ User needs to open main app and sign in

"Session expired. Please sign in again."
→ Session cookie is invalid or expired

"Invalid AO3 URL"
→ URL is not from archiveofourown.org

"This fanfic is already in your library"
→ Duplicate fanfic

"No sections found. Please create a section in the web app first."
→ User has no sections

"Failed to load sections"
→ Network or API error

"Failed to add fanfic"
→ Generic error during add operation
```

## Git Commands

### Create feature branch for iOS work
```bash
git checkout -b ios-share-extension
git add .
git commit -m "Add iOS Share Extension implementation"
git push origin ios-share-extension
```

### Update documentation only
```bash
git add docs/IOS*.md docs/SHARE*.md
git commit -m "Add iOS Share Extension documentation"
git push
```

## Xcode Build Settings Quick Reference

### For both targets:

| Setting | Value |
|---------|-------|
| Deployment Target | iOS 16.0 |
| Swift Language Version | Swift 5 |
| Automatically manage signing | ✅ Enabled |
| Code Signing | Automatic |

### Capabilities needed:

| Capability | Both Targets |
|------------|--------------|
| App Groups | ✅ Required |

## UserDefaults Keys

Used in App Group storage:

```swift
"sessionCookie"  // The NextAuth session cookie
"userName"       // User's display name
"userEmail"      // User's email address
```

## Common Xcode Errors & Fixes

### "No such module 'SwiftUI'"
```
Fix: Make sure deployment target is iOS 16.0+
```

### "Type 'Section' has no member..."
```
Fix: Check that Models.swift has both targets checked
```

### "Use of unresolved identifier 'Config'"
```
Fix: Check that Config.swift has both targets checked
```

### "Cannot find 'APIClient' in scope"
```
Fix: Check that APIClient.swift has both targets checked
```

### Share Extension crashes on launch
```
Fix: Check Info.plist NSExtension configuration
```

## File Creation Checklist

Create files in this order:

```
1. ✅ File → New → Group → "Shared"

2. ✅ File → New → Swift File → "Config.swift"
   Location: Shared folder
   Targets: ✅ FanficLibrary ✅ AddToLibrary

3. ✅ File → New → Swift File → "Models.swift"
   Location: Shared folder
   Targets: ✅ FanficLibrary ✅ AddToLibrary

4. ✅ File → New → Swift File → "APIClient.swift"
   Location: Shared folder
   Targets: ✅ FanficLibrary ✅ AddToLibrary

5. ✅ Open existing "FanficLibraryApp.swift"
   Replace with new code

6. ✅ Open existing "ContentView.swift"
   Replace with new code

7. ✅ File → New → Swift File → "AuthenticationManager.swift"
   Location: FanficLibrary folder
   Targets: ✅ FanficLibrary only

8. ✅ Open existing "ShareViewController.swift"
   Replace entire file with new code

9. ✅ Open "AddToLibrary/Info.plist"
   Update NSExtension section
```

## App Store Connect Quick Reference

### Required Information

```
App Name:     Fanfic Library (or your choice)
SKU:          fanfic-library-001 (any unique ID)
Bundle ID:    com.fanfic.library
Price:        Free (or set price)
Category:     Utilities
```

### Required Assets

```
App Icon:     1024x1024 PNG (no alpha)
Screenshots:  6.7" and 6.5" required
              Show: Sign-in, Instructions, Share Extension
Privacy URL:  https://your-domain.com/privacy (required!)
```

### Privacy Policy Requirements

Must disclose:
- Email collection (from Google Sign-In)
- User ID storage (for authentication)
- No data sold to third parties
- Data used only for app functionality

### App Review Notes Template

```
This app helps users add AO3 fanfics to their library using a Share Extension.

To test:
1. Sign in with the provided Google test account
2. Open Safari
3. Navigate to: https://archiveofourown.org/works/12345
4. Tap Share → Add to Library
5. Select a section and confirm

Test Account:
Email: test@example.com
Password: [provide password]

The Share Extension is the main feature to review.
```

## Device Testing Checklist

### Before Testing

```
□ Main app installed
□ Signed in successfully
□ Session cookie saved (check with debug print)
□ App Group working (check with debug print)
```

### Test Cases

```
□ Share from Safari works
□ Extension loads sections
□ Default section marked with ⭐️
□ Can change section
□ Add fanfic succeeds
□ Duplicate shows error
□ Invalid URL shows error
□ Sign out → extension shows auth error
□ Sign in again → extension works
□ App survives device restart
```

## Minimum Viable Product Checklist

```
□ Main app: Sign in with Google
□ Main app: Show instructions
□ Main app: Sign out button
□ Extension: Extract URL from share
□ Extension: Load sections from API
□ Extension: Show section picker
□ Extension: Highlight default section
□ Extension: Add fanfic to selected section
□ Extension: Show success/error messages
□ Extension: Auto-dismiss after success
□ Error: Handle no internet
□ Error: Handle expired session
□ Error: Handle invalid URLs
□ Error: Handle duplicates
```

## Archive & Upload Commands

### In Xcode

```
1. Select "Any iOS Device (arm64)" as destination
2. Product → Archive
3. Wait for archive to complete
4. In Organizer:
   - Select archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Click "Upload"
   - Wait (5-10 minutes)
```

### Using Terminal (Alternative)

```bash
# Archive
xcodebuild archive \
  -scheme FanficLibrary \
  -archivePath ./build/FanficLibrary.xcarchive

# Export IPA
xcodebuild -exportArchive \
  -archivePath ./build/FanficLibrary.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist exportOptions.plist

# Upload (requires Application Loader or Transporter app)
```

## Version Numbering

```
Version:      1.0       (user-facing, shown in App Store)
Build:        1         (internal, must increment each upload)

Next update:
Version:      1.0       (same if bug fix)
Build:        2         (always increment)

or

Version:      1.1       (new features)
Build:        1         (can reset or continue)
```

## Quick Troubleshooting Commands

### Reset simulator
```bash
xcrun simctl erase all
```

### Clean derived data
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### List simulators
```bash
xcrun simctl list devices
```

### View console logs (real device)
```bash
# In Xcode: Window → Devices and Simulators → Select device → Open Console
```

## Production URLs to Update

Before deploying to production, update these:

### In Shared/Config.swift
```swift
static let apiBaseURL = "https://your-actual-vercel-url.vercel.app"
```

### Test that URL returns valid response
```bash
curl https://your-actual-vercel-url.vercel.app
# Should return your web app HTML
```

## Contact & Support

### Apple Developer Support
- Developer Forums: https://developer.apple.com/forums/
- Technical Support: https://developer.apple.com/support/

### App Store Connect Status
- Status Page: https://developer.apple.com/system-status/

### Useful Stack Overflow Tags
- `swift`
- `swiftui`
- `ios`
- `share-extension`
- `wkwebview`
- `app-groups`

---

**Print this page and keep it handy during development!**

All the values you need to copy-paste are right here.
