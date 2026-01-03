# iOS Share Extension - Quick Start Guide

This is the fastest path from zero to a working iOS Share Extension. Follow these steps in order.

## Prerequisites

- Mac with Xcode 15+ installed
- Apple Developer account ($99/year)
- Your fanfic web app deployed to Vercel

## Step 1: Create Xcode Project (5 minutes)

1. Open Xcode
2. File → New → Project
3. iOS → App
4. Product Name: **FanficLibrary**
5. Organization Identifier: **com.fanfic**
6. Interface: **SwiftUI**
7. Create

## Step 2: Add Share Extension (2 minutes)

1. File → New → Target
2. iOS → Share Extension
3. Product Name: **AddToLibrary**
4. Activate scheme when prompted

## Step 3: Create App Group (3 minutes)

### In Apple Developer Portal:

1. Go to [developer.apple.com/account](https://developer.apple.com/account)
2. Certificates, Identifiers & Profiles → Identifiers → App Groups
3. Click **+**
4. Register: `group.com.fanfic.library`
5. Go to App IDs → `com.fanfic.library` → Edit → Enable App Groups → Select `group.com.fanfic.library`
6. Repeat for `com.fanfic.library.share`

### In Xcode:

1. Select project → FanficLibrary target → Signing & Capabilities
2. Click **+ Capability** → App Groups
3. Enable `group.com.fanfic.library`
4. Repeat for AddToLibrary target

## Step 4: Create Shared Folder (1 minute)

1. Right-click FanficLibrary folder in Project Navigator
2. New Group → Name it **Shared**

## Step 5: Copy Source Files (10 minutes)

### Create Shared/Config.swift

1. File → New → File → Swift File
2. Name: **Config.swift**
3. Save in **Shared** folder
4. Copy code from implementation guide
5. **IMPORTANT**: In File Inspector, check both targets (FanficLibrary AND AddToLibrary)
6. **UPDATE**: Change `apiBaseURL` to your Vercel URL

### Create Shared/Models.swift

1. File → New → File → Swift File
2. Name: **Models.swift**
3. Save in **Shared** folder
4. Copy code from implementation guide
5. **IMPORTANT**: In File Inspector, check both targets

### Create Shared/APIClient.swift

1. File → New → File → Swift File
2. Name: **APIClient.swift**
3. Save in **Shared** folder
4. Copy code from implementation guide
5. **IMPORTANT**: In File Inspector, check both targets

### Update FanficLibrary/FanficLibraryApp.swift

1. Open existing file
2. Replace with code from implementation guide

### Update FanficLibrary/ContentView.swift

1. Open existing file
2. Replace with code from implementation guide

### Create FanficLibrary/AuthenticationManager.swift

1. File → New → File → Swift File
2. Name: **AuthenticationManager.swift**
3. Save in **FanficLibrary** folder
4. Copy code from implementation guide
5. Check only FanficLibrary target

### Update AddToLibrary/ShareViewController.swift

1. Open existing file
2. Delete all code (including imports)
3. Replace with code from implementation guide

## Step 6: Configure Info.plist (2 minutes)

1. Open **AddToLibrary/Info.plist**
2. Find `NSExtension` → `NSExtensionAttributes` → `NSExtensionActivationRule`
3. Verify it has:
   - Key: `NSExtensionActivationSupportsWebURLWithMaxCount`
   - Value: `1`

If the structure looks different, replace the entire NSExtension section with:

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

## Step 7: Configure Build Settings (2 minutes)

1. Select project → FanficLibrary target → General
2. Minimum Deployments: **iOS 16.0**
3. Repeat for AddToLibrary target

4. Select FanficLibrary target → Signing & Capabilities
5. Check **Automatically manage signing**
6. Select your Team
7. Repeat for AddToLibrary target

## Step 8: Build and Test (5 minutes)

1. Select **FanficLibrary** scheme
2. Choose **iPhone 15 Pro** simulator
3. Click Run (⌘R)
4. App should launch - sign in will load web view

**Note**: Share Extension testing requires a real device!

## Step 9: Test on Real Device (Required)

1. Connect your iPhone
2. Select your iPhone as destination
3. Build and run
4. Complete sign-in flow
5. Open Safari → go to any AO3 work
6. Tap Share → Add to Library
7. Should load sections and allow you to add

## Troubleshooting

### "No such module" errors

- Clean build folder (⌘⇧K)
- Rebuild

### Share Extension not appearing

- Uninstall app completely
- Restart iPhone
- Reinstall

### Target membership issues

For each file in Shared folder:
1. Click file in Project Navigator
2. Open File Inspector (⌘⌥1)
3. Under Target Membership, check BOTH boxes

### App Group not working

1. Verify same identifier in:
   - Developer Portal App Group
   - Both App IDs in Developer Portal
   - Both targets in Xcode
2. Clean and rebuild

### Session cookie not saving

Add debug print in ContentView:

```swift
.onAppear {
    authManager.checkAuthStatus()
    print("Cookie: \(Config.sessionCookie ?? "none")")
}
```

## Production Checklist

Before deploying to App Store:

- [ ] Update `Config.apiBaseURL` with production URL
- [ ] Create app icon (1024x1024)
- [ ] Take screenshots
- [ ] Write privacy policy
- [ ] Test on multiple devices
- [ ] Create App Store Connect app
- [ ] Archive and upload

## File Checklist

After setup, you should have these files:

```
✅ Shared/Config.swift (both targets)
✅ Shared/Models.swift (both targets)
✅ Shared/APIClient.swift (both targets)
✅ FanficLibrary/FanficLibraryApp.swift
✅ FanficLibrary/ContentView.swift
✅ FanficLibrary/AuthenticationManager.swift
✅ AddToLibrary/ShareViewController.swift
✅ AddToLibrary/Info.plist (configured)
```

## Configuration Checklist

- [ ] App Group created: `group.com.fanfic.library`
- [ ] App Group added to both App IDs in Developer Portal
- [ ] App Group enabled in both Xcode targets
- [ ] API base URL updated in Config.swift
- [ ] Minimum deployment target set to iOS 16.0
- [ ] Automatic signing enabled for both targets
- [ ] Share Extension Info.plist configured

## Common Values Reference

```
App Group:     group.com.fanfic.library
Main Bundle:   com.fanfic.library
Share Bundle:  com.fanfic.library.share
Min iOS:       16.0
```

## What Each File Does

| File | Purpose |
|------|---------|
| Config.swift | Stores API URL, App Group ID, helper methods |
| Models.swift | Data structures for API responses |
| APIClient.swift | Network layer for API calls |
| FanficLibraryApp.swift | App entry point |
| ContentView.swift | Main app UI (sign in/instructions) |
| AuthenticationManager.swift | Handles OAuth and cookie extraction |
| ShareViewController.swift | Share Extension UI and logic |

## Next Steps

1. Test thoroughly on real device
2. Add app icon
3. Prepare App Store materials
4. Submit to App Store Connect
5. Wait for review (1-3 days)

## Get Help

- Read full guide: `/docs/SHARE_EXTENSION_IMPLEMENTATION.md`
- Check structure: `/docs/IOS_PROJECT_STRUCTURE.md`
- Review API: `/docs/IOS_SHARE_EXTENSION_PLAN.md`

---

**Total time**: ~30 minutes to working prototype
**Time to App Store**: ~1 week including review
