# iOS Share Extension Documentation

Complete documentation for building a native iOS app with Safari Share Extension to add AO3 fanfics to your library.

## Overview

This implementation allows users to:
1. Sign in once with Google (using the main iOS app)
2. Share any AO3 work from Safari
3. Choose which section to add it to
4. Automatically sync with their web library

## Documentation Index

### For Quick Implementation

**Start here if you want to build this ASAP:**

1. **[Quick Start Guide](./IOS_QUICK_START.md)** - 30-minute path from zero to working app
   - Fastest way to get started
   - Step-by-step with exact commands
   - Minimal explanation, maximum action

### For Complete Implementation

**Use these for a thorough understanding:**

2. **[Implementation Guide](./SHARE_EXTENSION_IMPLEMENTATION.md)** - Complete reference (49KB)
   - All Swift source code files (ready to copy-paste)
   - Detailed Xcode setup instructions
   - Configuration snippets
   - Testing procedures
   - Troubleshooting guide
   - Deployment instructions

3. **[Project Structure](./IOS_PROJECT_STRUCTURE.md)** - File organization & checklists
   - Xcode project layout
   - Target membership reference
   - Implementation checklist (40+ items)
   - Configuration values
   - Testing checklist
   - Common mistakes to avoid

### For Understanding the Architecture

**Read these to understand how it works:**

4. **[Architecture Diagram](./IOS_ARCHITECTURE_DIAGRAM.md)** - Visual system overview
   - System architecture diagrams
   - Authentication flow
   - Share Extension flow
   - Data flow between components
   - API request/response structure
   - Security architecture
   - Error handling flow

5. **[Original Plan](./IOS_SHARE_EXTENSION_PLAN.md)** - Initial design document
   - High-level overview
   - Technical decisions
   - Timeline estimates
   - Future enhancements

## What's Already Built

The backend API is complete and deployed:

- ✅ **GET /api/share-extension/sections** - Returns user's sections and default
- ✅ **POST /api/share-extension/add-fanfic** - Adds fanfic to specified section
- ✅ **NextAuth v5** - Cookie-based authentication
- ✅ **Database schema** - Sections and fanfics tables ready

## What You Need to Build

The iOS native components:

- **Main App** (FanficLibrary)
  - Google OAuth sign-in via WebView
  - Session cookie extraction
  - Shared storage setup
  - User instructions

- **Share Extension** (AddToLibrary)
  - URL extraction from share context
  - Section loading from API
  - Section picker UI
  - Add fanfic functionality
  - Error handling

## Technology Stack

### iOS App
- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI (main app) + UIKit (extension)
- **Minimum iOS**: 16.0
- **Authentication**: WebView OAuth with cookie extraction
- **Data Sharing**: App Groups + UserDefaults
- **Networking**: URLSession with async/await

### Backend (Already Built)
- **Framework**: Next.js 15
- **Auth**: NextAuth v5
- **Database**: PostgreSQL (Neon)
- **Deployment**: Vercel

## Implementation Timeline

### Quick Path (30 minutes)
- Follow the [Quick Start Guide](./IOS_QUICK_START.md)
- Get a working prototype
- Test on simulator and real device

### Complete Path (1 week)
- Day 1: Xcode setup, Google Sign-In integration
- Day 2: Share Extension UI & API integration
- Day 3: Testing & bug fixes
- Day 4: App Store assets & submission prep
- Day 5: TestFlight testing
- Week 2: App Store review (1-3 days typically)

## Prerequisites

### Required
- Mac with Xcode 15 or later
- Apple Developer account ($99/year)
- iOS device for testing (Share Extensions don't work well in simulator)
- Production web app deployed to Vercel

### Optional but Recommended
- TestFlight for beta testing
- Analytics setup (Firebase, Mixpanel, etc.)
- Error tracking (Sentry, Crashlytics)

## Key Configuration Values

Copy these for reference:

```swift
// App Group
group.com.fanfic.library

// Bundle IDs
com.fanfic.library              // Main app
com.fanfic.library.share        // Share Extension

// API Base URL
https://your-vercel-app.vercel.app

// Minimum iOS Version
16.0
```

## File Overview

### Main Implementation Guide
**File**: `SHARE_EXTENSION_IMPLEMENTATION.md` (49KB)

Contains 7 complete Swift files:
1. `Shared/Config.swift` - Configuration constants
2. `Shared/Models.swift` - Data models
3. `Shared/APIClient.swift` - Network layer
4. `FanficLibrary/FanficLibraryApp.swift` - App entry
5. `FanficLibrary/ContentView.swift` - Main UI
6. `FanficLibrary/AuthenticationManager.swift` - OAuth handler
7. `AddToLibrary/ShareViewController.swift` - Extension UI

### Quick Reference
**File**: `IOS_QUICK_START.md` (7KB)

- 9 steps to working app
- 30-minute timeline
- Common troubleshooting
- Configuration checklist

### Project Organization
**File**: `IOS_PROJECT_STRUCTURE.md` (9KB)

- Xcode project layout
- Target membership table
- 40+ item checklist
- Testing procedures
- Version planning

### Visual Documentation
**File**: `IOS_ARCHITECTURE_DIAGRAM.md` (33KB)

- System overview diagram
- Authentication flow
- Share Extension flow
- API structure
- Error handling

## Recommended Workflow

### First-Time Implementation

1. **Read** the [Quick Start Guide](./IOS_QUICK_START.md) to understand the scope
2. **Review** the [Architecture Diagram](./IOS_ARCHITECTURE_DIAGRAM.md) to understand the flow
3. **Follow** the [Implementation Guide](./SHARE_EXTENSION_IMPLEMENTATION.md) step-by-step
4. **Check off** items in the [Project Structure](./IOS_PROJECT_STRUCTURE.md) checklist
5. **Test** thoroughly using the testing checklist
6. **Deploy** to TestFlight, then App Store

### Troubleshooting

1. **Check** the Troubleshooting section in the Implementation Guide
2. **Verify** configuration values match in all locations
3. **Review** console logs for error messages
4. **Test** API endpoints directly with curl
5. **Ensure** App Groups are configured correctly

## Testing Strategy

### Phase 1: Simulator (Basic Functionality)
- App launches
- Sign-in flow works
- UI appears correctly

### Phase 2: Real Device (Full Testing)
- Complete sign-in
- Session persists
- Share Extension appears in Safari
- Section loading works
- Add fanfic succeeds
- Error handling works

### Phase 3: TestFlight (Beta Testing)
- Multiple device types
- Different iOS versions
- Real user workflows
- Edge cases

### Phase 4: Production (Monitoring)
- Analytics tracking
- Error monitoring
- User feedback
- Performance metrics

## Security Considerations

### Current Implementation
- Session cookies stored in App Group UserDefaults
- HTTPS for all API calls
- NextAuth JWT validation on backend
- No sensitive data in URLs

### Production Recommendations
- Migrate to Keychain for session storage
- Implement certificate pinning
- Add request signing
- Rate limiting on backend
- Session expiry handling

## Common Issues & Solutions

### Issue: Share Extension not appearing
**Solution**: Verify App Groups are configured in both Developer Portal and Xcode. Uninstall and reinstall app.

### Issue: "Unauthorized" error
**Solution**: Sign in again. Check session cookie is being saved. Verify cookie name matches NextAuth format.

### Issue: Can't load sections
**Solution**: Check API endpoint directly with curl. Verify user has created sections in web app.

### Issue: Build errors
**Solution**: Check target membership for Shared files. Clean build folder (⌘⇧K).

See the [Implementation Guide](./SHARE_EXTENSION_IMPLEMENTATION.md#troubleshooting) for complete troubleshooting.

## Future Enhancements

After the MVP is working:

### Version 1.1
- Native library browsing
- Offline support
- Better error messages
- Haptic feedback

### Version 1.2
- Home screen widget
- Reading progress widget
- Batch add multiple fanfics
- Share to specific section directly

### Version 1.3
- Shortcuts app integration
- Siri integration
- Today extension
- iPad optimization

### Version 2.0
- Full reading experience in app
- Offline reading
- Sync with Kindle
- Dark mode customization

## Support & Resources

### Official Documentation
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Project Documentation
- Implementation Guide: Complete Swift code and setup
- Quick Start: Fastest path to working app
- Architecture Diagrams: Visual understanding
- Project Structure: Organization and checklists

### Getting Help

1. Check the Troubleshooting section
2. Review Xcode console logs
3. Test API endpoints with curl
4. Verify configuration matches documentation
5. Check App Groups configuration

## API Endpoints Reference

### GET /api/share-extension/sections

**Authentication**: Required (session cookie)

**Response**:
```json
{
  "sections": [
    { "id": 1, "name": "My Library", "parentId": null },
    { "id": 2, "name": "Reading", "parentId": 1 }
  ],
  "defaultSectionId": 1
}
```

### POST /api/share-extension/add-fanfic

**Authentication**: Required (session cookie)

**Request**:
```json
{
  "url": "https://archiveofourown.org/works/12345",
  "sectionId": 2
}
```

**Response**:
```json
{
  "success": true,
  "message": "Fanfic added successfully"
}
```

**Error Responses**:
- `401`: Session expired or invalid
- `400`: Invalid URL or validation error
- `500`: Server error

See [Architecture Diagram](./IOS_ARCHITECTURE_DIAGRAM.md#api-request-structure) for complete API documentation.

## Success Criteria

Your implementation is successful when:

- ✅ User can sign in with Google once
- ✅ Session persists across app restarts
- ✅ Share Extension appears in Safari for all URLs
- ✅ Sections load within 2 seconds
- ✅ Default section is clearly indicated
- ✅ Nested sections show proper indentation
- ✅ Adding fanfic completes within 3 seconds
- ✅ Success message appears and auto-dismisses
- ✅ All error cases show helpful messages
- ✅ Works on multiple iOS devices
- ✅ Passes App Store review

## Version Information

- **Documentation Version**: 1.0.0
- **Last Updated**: 2026-01-03
- **Backend API Version**: 1.0.0 (already deployed)
- **Minimum iOS**: 16.0
- **Target iOS**: 17.0+

## Next Steps

**Choose your path**:

1. **Want to start coding immediately?**
   → Go to [Quick Start Guide](./IOS_QUICK_START.md)

2. **Want complete understanding first?**
   → Start with [Architecture Diagram](./IOS_ARCHITECTURE_DIAGRAM.md)

3. **Ready to build the full app?**
   → Follow [Implementation Guide](./SHARE_EXTENSION_IMPLEMENTATION.md)

4. **Need a checklist to track progress?**
   → Use [Project Structure](./IOS_PROJECT_STRUCTURE.md)

---

**Good luck building your iOS Share Extension!** 🚀

Remember: The backend is already built and working. You're just adding a native mobile interface to an existing, functional web app. The hard part (AO3 integration, database, auth) is done. This is the fun part!
