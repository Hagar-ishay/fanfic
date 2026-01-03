# iOS Share Extension - UI Mockups

Visual reference for what each screen should look like.

## Main App Screens

### 1. Sign In Screen (Before Authentication)

```
┌─────────────────────────────────────┐
│  ← Back         Fanfic Library      │
├─────────────────────────────────────┤
│                                     │
│                                     │
│            📚 (Book icon)           │
│                80pt                 │
│                                     │
│         Fanfic Library              │
│         (Large Title, Bold)         │
│                                     │
│     Add AO3 fanfics to your library │
│       directly from Safari          │
│         (Body, Secondary)           │
│                                     │
│                                     │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  👤  Sign In with Google    │   │
│  │    (Button, Blue)           │   │
│  └─────────────────────────────┘   │
│                                     │
│    Sign in using the web app        │
│         (Caption, Secondary)        │
│                                     │
└─────────────────────────────────────┘
```

### 2. Sign In Web View (During OAuth)

```
┌─────────────────────────────────────┐
│  Cancel              Sign In        │
├─────────────────────────────────────┤
│  🔄 Loading...                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   [Web View Content]        │   │
│  │                             │   │
│  │   Your production web app's │   │
│  │   Google OAuth flow         │   │
│  │                             │   │
│  │   User signs in with Google │   │
│  │                             │   │
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘

Note: WebView loads /api/auth/signin
App monitors navigation and extracts cookie
```

### 3. Success Screen (After Authentication)

```
┌─────────────────────────────────────┐
│  ← Back         Fanfic Library      │
├─────────────────────────────────────┤
│                                     │
│           ✓ (Checkmark)             │
│           Green Circle              │
│              80pt                   │
│                                     │
│       Welcome, John Doe!            │
│         (Title 2)                   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│           How to use:               │
│          (Headline)                 │
│                                     │
│  ① Open Safari on your iPhone       │
│                                     │
│  ② Navigate to any AO3 fanfic       │
│                                     │
│  ③ Tap the Share button             │
│                                     │
│  ④ Select 'Add to Library'          │
│                                     │
│  ⑤ Choose a section and confirm     │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🌐  Open Web App           │   │
│  │    (Button, Blue)           │   │
│  └─────────────────────────────┘   │
│                                     │
│           Sign Out                  │
│          (Red Text)                 │
│                                     │
└─────────────────────────────────────┘
```

## Share Extension Screens

### 4. Share Extension - Loading State

```
┌─────────────────────────────────────┐
│ [Dark overlay 50% opacity]          │
│                                     │
│   ┌─────────────────────────────┐  │
│   │                             │  │
│   │     Add to Library          │  │
│   │     (Title, Bold, 20pt)     │  │
│   │                             │  │
│   │    Loading sections...      │  │
│   │    (Body, Secondary)        │  │
│   │                             │  │
│   │         🔄 (Spinner)        │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │  ┌───────────────────────┐  │  │
│   │  │      Cancel           │  │  │
│   │  └───────────────────────┘  │  │
│   │                             │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘

Corner radius: 16pt
Background: System background
Shadow: Subtle
```

### 5. Share Extension - Section Picker

```
┌─────────────────────────────────────┐
│ [Dark overlay 50% opacity]          │
│                                     │
│   ┌─────────────────────────────┐  │
│   │                             │  │
│   │     Add to Library          │  │
│   │     (Title, Bold, 20pt)     │  │
│   │                             │  │
│   │   Choose section:           │  │
│   │   (Caption, Medium)         │  │
│   │                             │  │
│   │  ┌───────────────────────┐  │  │
│   │  │ Picker (150pt height) │  │  │
│   │  │ ─────────────────────  │  │  │
│   │  │ ⭐️ My Library         │  │  │  ← Default
│   │  │     Reading           │  │  │  ← Nested L1
│   │  │         To Read       │  │  │  ← Nested L2
│   │  │     Finished          │  │  │  ← Nested L1
│   │  │ Favorites             │  │  │  ← Root
│   │  └───────────────────────┘  │  │
│   │                             │  │
│   │  ┌───────────────────────┐  │  │
│   │  │  Add to Library       │  │  │
│   │  │  (Button, Blue, 50pt) │  │  │
│   │  └───────────────────────┘  │  │
│   │                             │  │
│   │         Cancel              │  │
│   │       (Red Text)            │  │
│   │                             │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘

Indentation:
- Root sections: No indent
- Level 1: 4 spaces
- Level 2: 8 spaces
- Level 3: 12 spaces
```

### 6. Share Extension - Adding (Loading)

```
┌─────────────────────────────────────┐
│ [Dark overlay 50% opacity]          │
│                                     │
│   ┌─────────────────────────────┐  │
│   │                             │  │
│   │     Add to Library          │  │
│   │     (Title, Bold, 20pt)     │  │
│   │                             │  │
│   │    Adding fanfic...         │  │
│   │    (Body, Secondary)        │  │
│   │                             │  │
│   │         🔄 (Spinner)        │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘

No buttons visible during add operation
```

### 7. Share Extension - Success

```
┌─────────────────────────────────────┐
│ [Dark overlay 50% opacity]          │
│                                     │
│   ┌─────────────────────────────┐  │
│   │                             │  │
│   │     Add to Library          │  │
│   │     (Title, Bold, 20pt)     │  │
│   │                             │  │
│   │  ✓ Fanfic added successfully│  │
│   │     (Green, Body)           │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │    Auto-dismissing...       │  │
│   │                             │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘

Auto-dismisses after 2 seconds
```

### 8. Share Extension - Error States

#### Error: Not Signed In
```
┌─────────────────────────────────────┐
│ [Dark overlay 50% opacity]          │
│                                     │
│   ┌─────────────────────────────┐  │
│   │                             │  │
│   │     Add to Library          │  │
│   │     (Title, Bold, 20pt)     │  │
│   │                             │  │
│   │  Please sign in to the      │  │
│   │  Fanfic Library app first   │  │
│   │     (Red, Body)             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │  ┌───────────────────────┐  │  │
│   │  │      Cancel           │  │  │
│   │  └───────────────────────┘  │  │
│   │                             │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

#### Error: Invalid URL
```
┌─────────────────────────────────────┐
│ [Dark overlay 50% opacity]          │
│                                     │
│   ┌─────────────────────────────┐  │
│   │                             │  │
│   │     Add to Library          │  │
│   │     (Title, Bold, 20pt)     │  │
│   │                             │  │
│   │     Invalid AO3 URL         │  │
│   │     (Red, Body)             │  │
│   │                             │  │
│   │  Please share a valid       │  │
│   │  AO3 work URL               │  │
│   │     (Secondary)             │  │
│   │                             │  │
│   │  ┌───────────────────────┐  │  │
│   │  │      Cancel           │  │  │
│   │  └───────────────────────┘  │  │
│   │                             │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

#### Error: Duplicate
```
┌─────────────────────────────────────┐
│ [Dark overlay 50% opacity]          │
│                                     │
│   ┌─────────────────────────────┐  │
│   │                             │  │
│   │     Add to Library          │  │
│   │     (Title, Bold, 20pt)     │  │
│   │                             │  │
│   │  This fanfic is already     │  │
│   │  in your library            │  │
│   │     (Red, Body)             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │                             │  │
│   │  ┌───────────────────────┐  │  │
│   │  │      Cancel           │  │  │
│   │  └───────────────────────┘  │  │
│   │                             │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Safari Integration

### Safari Share Sheet (iOS System)

```
┌─────────────────────────────────────┐
│           Safari Browser            │
│                                     │
│  [AO3 Work Page Content]            │
│                                     │
│  The Best Fanfic Ever               │
│  by AuthorName                      │
│  ...                                │
│                                     │
│  [User taps Share button]           │
│         ↓                           │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│        Share Sheet (iOS)            │
├─────────────────────────────────────┤
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │ ✉️│ │ 💬│ │ 📋│ │...│          │
│  └───┘ └───┘ └───┘ └───┘          │
│  Mail  Msgs   Copy   More          │
│                                     │
│ ───────────────────────────────────│
│                                     │
│  🔵 Add to Library  ← Our Extension │
│  📄 Save to Files                   │
│  📖 Add to Reading List             │
│  🔖 Add Bookmark                    │
│  📱 More...                         │
│                                     │
└─────────────────────────────────────┘
         ↓
    [User taps "Add to Library"]
         ↓
    [Our Share Extension appears]
```

## Color Scheme

### System Colors (SwiftUI)

```
Primary Text:       .primary (label)
Secondary Text:     .secondary (secondaryLabel)
Background:         .systemBackground
Grouped BG:         .systemGroupedBackground

Button Blue:        .systemBlue
Success Green:      .systemGreen
Error Red:          .systemRed

Divider:            .separator
```

### Custom Colors (Optional)

```
Brand Blue:         RGB(0, 122, 255)
Success:            RGB(52, 199, 89)
Error:              RGB(255, 59, 48)
```

## Typography

### Main App

```
Navigation Title:   .navigationTitle (Large Title, 34pt)
Section Heading:    .font(.title2) (22pt)
Body Text:          .font(.body) (17pt)
Instructions:       .font(.body) (17pt)
Caption:            .font(.caption) (12pt)
Button:             .font(.system(size: 17, weight: .semibold))
```

### Share Extension

```
Title:              UIFont.systemFont(ofSize: 20, weight: .bold)
Message:            UIFont.systemFont(ofSize: 16)
Section Label:      UIFont.systemFont(ofSize: 14, weight: .medium)
Picker Text:        UIFont.systemFont(ofSize: 17)
Button:             UIFont.systemFont(ofSize: 17, weight: .semibold)
```

## Spacing & Layout

### Main App
```
Screen Padding:     30pt horizontal, 30pt vertical
Element Spacing:    20pt between major elements
                    15pt between related items
                    30pt between sections
Icon Size:          80pt × 80pt
Button Height:      50pt minimum
Button Padding:     16pt horizontal, 12pt vertical
```

### Share Extension
```
Container Width:    320pt
Container Padding:  20pt all sides
Element Spacing:    20pt between elements
                    10pt between related items
Picker Height:      150pt
Button Height:      50pt
Corner Radius:      16pt (container)
                    10pt (buttons)
```

## Animation & Interaction

### Main App
```
Sheet Presentation: .sheet modifier (system animation)
Button Tap:         System highlight
Navigation:         System push/pop
```

### Share Extension
```
Appearance:         Fade in with scale (system)
Dismissal:          Fade out (system)
Success:            Show for 2 seconds, then auto-dismiss
Error:              Stay visible, user must tap Cancel
Loading:            Activity indicator rotates
Picker:             System scroll animation
```

## Accessibility

### Dynamic Type Support
```
All text should support Dynamic Type
Scale from .xSmall to .xxxLarge
Test with Settings → Accessibility → Larger Text
```

### VoiceOver Labels
```
Sign In Button:     "Sign in with Google"
Open Web Button:    "Open web app in Safari"
Sign Out Button:    "Sign out"
Cancel Button:      "Cancel and close"
Add Button:         "Add fanfic to selected section"
Picker:             "Choose section for fanfic"
```

### High Contrast
```
Ensure all colors have sufficient contrast
Test with Settings → Accessibility → Increase Contrast
Minimum ratio: 4.5:1 for text
```

## Dark Mode

### Main App
```
All colors use system colors (auto-adapts)
Background:         .systemBackground → Dark
Text:               .primary → Light
Secondary:          .secondary → Gray
Buttons:            .systemBlue → Brighter blue
```

### Share Extension
```
Container:          .systemBackground → Dark
Text:               .label → Light
Secondary:          .secondaryLabel → Gray
Buttons:            Same as light mode
```

## Landscape Orientation

### Main App
```
Supports all orientations
Content reflows for landscape
Stack becomes side-by-side where appropriate
```

### Share Extension
```
Portrait only (typical for extensions)
Users expect portrait for quick actions
```

## iPad Considerations

### Main App
```
Same layout, centered on iPad
Maximum width: 600pt
Margins: Larger on sides
```

### Share Extension
```
Appears as popover, not full screen
Same 320pt width
Centered in popover
```

## App Icon Design (1024×1024)

```
┌─────────────────────────────────────┐
│                                     │
│           🌟📚✨                    │
│                                     │
│      Background: Gradient           │
│      (Blue → Purple)                │
│                                     │
│      Foreground: Book icon          │
│      with sparkles/stars            │
│                                     │
│      Simple, recognizable           │
│      Looks good at all sizes        │
│                                     │
└─────────────────────────────────────┘

Note: Keep it simple and scalable
Test at: 1024px, 512px, 180px, 60px, 40px
```

## Screenshots for App Store

### 6.7" Display (iPhone 15 Pro Max)
```
Screenshot 1: Sign In Screen
Screenshot 2: Success Screen with Instructions
Screenshot 3: Safari with Share Sheet showing extension
Screenshot 4: Share Extension with Section Picker
Screenshot 5: Share Extension Success State
```

### Marketing Tips
```
- Add text overlays explaining features
- Show the complete workflow
- Highlight the ease of use
- Use real AO3 work (public domain)
- Show nested sections
- Demonstrate one-tap workflow
```

## State Diagram

```
Main App States:
─────────────
1. Not Signed In → Shows sign-in button
2. Signing In → Shows web view
3. Signed In → Shows instructions

Share Extension States:
──────────────────────
1. Loading → Extract URL, check auth
2. Loading Sections → Fetch from API
3. Showing Picker → User selects
4. Adding → Send to API
5. Success → Show message, auto-dismiss
6. Error → Show error, wait for cancel

Error States:
────────────
- No internet connection
- Invalid URL
- Not authenticated
- Duplicate fanfic
- Server error
- No sections available
```

---

**Design Principles**:
1. Simple and focused
2. Familiar iOS patterns
3. Clear feedback for all actions
4. Graceful error handling
5. Accessible to all users
6. Fast and responsive

**Remember**: The main app is just a container. The Share Extension is the real product. Keep both simple and focused on their single purpose.
