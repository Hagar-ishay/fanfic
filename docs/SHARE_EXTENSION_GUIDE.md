# Safari Share Extension Implementation Guide

This guide covers testing the API endpoints and implementing the iOS Share Extension.

## Part 1: Testing the API Endpoints

### Prerequisites
1. Start your development server: `pnpm run dev`
2. Sign in to your app at `http://localhost:3000` to get a valid session
3. Use a tool like Postman or Insomnia (they share cookies with your browser)

### Test 1: Get Sections (Authenticated)

**Request:**
```
GET http://localhost:3000/api/share-extension/sections
```

**Expected Response (200):**
```json
{
  "sections": [
    {"id": 1, "name": "Reading", "parentId": null},
    {"id": 2, "name": "Completed", "parentId": null}
  ],
  "defaultSectionId": 1
}
```

### Test 2: Get Sections (Unauthenticated)

**Request:**
```
GET http://localhost:3000/api/share-extension/sections
```
(Remove authentication cookies)

**Expected Response (401):**
```json
{
  "error": "Unauthorized"
}
```

### Test 3: Add Fanfic with Section ID

**Request:**
```
POST http://localhost:3000/api/share-extension/add-fanfic
Content-Type: application/json

{
  "url": "https://archiveofourown.org/works/54890315",
  "sectionId": 1
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Fanfic added successfully"
}
```

### Test 4: Add Fanfic without Section ID (Uses Default)

**Request:**
```
POST http://localhost:3000/api/share-extension/add-fanfic
Content-Type: application/json

{
  "url": "https://archiveofourown.org/works/54890315"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Fanfic added successfully"
}
```

### Test 5: Invalid URL

**Request:**
```
POST http://localhost:3000/api/share-extension/add-fanfic
Content-Type: application/json

{
  "url": "https://example.com/not-ao3"
}
```

**Expected Response (400):**
```json
{
  "error": "Invalid URL. Please copy a valid AO3 fanfic link"
}
```

### Test 6: Duplicate Fanfic

Add the same URL twice.

**Expected Response (400):**
```json
{
  "error": "This Fic already exists"
}
```

### Test 7: Missing URL

**Request:**
```
POST http://localhost:3000/api/share-extension/add-fanfic
Content-Type: application/json

{
  "sectionId": 1
}
```

**Expected Response (400):**
```json
{
  "error": "URL is required"
}
```

### Test 8: No Default Section

If user has no default section configured:

**Request:**
```
POST http://localhost:3000/api/share-extension/add-fanfic
Content-Type: application/json

{
  "url": "https://archiveofourown.org/works/54890315"
}
```

**Expected Response (400):**
```json
{
  "error": "No section specified and no default section configured"
}
```

## Part 2: iOS Share Extension Implementation

### Architecture Decision

Since you're considering building a full iOS app, here are two approaches:

#### Option A: Share Extension with Standalone App
- Share Extension is part of an iOS app bundle
- Can share authentication state via App Groups and Keychain
- More seamless experience
- **Recommended if building iOS app**

#### Option B: Share Extension Only (Web App Access)
- Share Extension that works with your web app
- Requires separate authentication mechanism
- More complex cookie/session management
- Consider OAuth flow or API tokens

### Implementation: Share Extension with iOS App

This guide assumes you're building a full iOS app (recommended).

## Step 1: Create iOS App with Xcode

1. Open Xcode
2. Create new project: "App" template
3. Name: "FanficLibrary" (or your preferred name)
4. Language: Swift
5. Bundle ID: `com.yourname.fanficlibrary`

## Step 2: Add Share Extension Target

1. In Xcode: `File` → `New` → `Target`
2. Select `Share Extension`
3. Name: "Add to Library"
4. Activate scheme when prompted
5. Bundle ID: `com.yourname.fanficlibrary.share`

## Step 3: Configure App Groups

Both targets need to share data (authentication tokens).

### In Apple Developer Portal:
1. Go to Certificates, Identifiers & Profiles
2. Create App Group: `group.com.yourname.fanficlibrary`
3. Enable for both app and extension identifiers

### In Xcode:
1. Select main app target → Signing & Capabilities
2. Add App Groups capability
3. Check your app group
4. Repeat for Share Extension target

## Step 4: Share Extension UI (ShareViewController.swift)

Replace the default `ShareViewController.swift`:

```swift
import UIKit
import Social
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    // MARK: - UI Components
    private let activityIndicator = UIActivityIndicatorView(style: .large)
    private let statusLabel = UILabel()
    private let sectionPicker = UIPickerView()
    private let addButton = UIButton(type: .system)

    // MARK: - Data
    private var sections: [Section] = []
    private var defaultSectionId: Int?
    private var selectedSectionId: Int?
    private var sharedURL: String?

    struct Section: Codable {
        let id: Int
        let name: String
        let parentId: Int?
    }

    struct SectionsResponse: Codable {
        let sections: [Section]
        let defaultSectionId: Int?
    }

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()

        setupUI()
        extractSharedURL()
        loadSections()
    }

    // MARK: - Setup
    private func setupUI() {
        view.backgroundColor = .systemBackground

        // Status label
        statusLabel.textAlignment = .center
        statusLabel.numberOfLines = 0
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(statusLabel)

        // Section picker
        sectionPicker.delegate = self
        sectionPicker.dataSource = self
        sectionPicker.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(sectionPicker)

        // Add button
        addButton.setTitle("Add to Library", for: .normal)
        addButton.addTarget(self, action: #selector(addToLibrary), for: .touchUpInside)
        addButton.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(addButton)

        // Activity indicator
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        activityIndicator.hidesWhenStopped = true
        view.addSubview(activityIndicator)

        // Layout
        NSLayoutConstraint.activate([
            statusLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            statusLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            statusLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),

            sectionPicker.topAnchor.constraint(equalTo: statusLabel.bottomAnchor, constant: 20),
            sectionPicker.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            sectionPicker.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            sectionPicker.heightAnchor.constraint(equalToConstant: 150),

            addButton.topAnchor.constraint(equalTo: sectionPicker.bottomAnchor, constant: 20),
            addButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])

        // Initially hide picker and button
        sectionPicker.isHidden = true
        addButton.isHidden = true
    }

    // MARK: - Extract URL
    private func extractSharedURL() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let itemProvider = extensionItem.attachments?.first else {
            showError("No URL found")
            return
        }

        if itemProvider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
            itemProvider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] (url, error) in
                DispatchQueue.main.async {
                    if let shareURL = url as? URL {
                        self?.sharedURL = shareURL.absoluteString
                        self?.statusLabel.text = "Ready to add:\n\(shareURL.absoluteString)"
                    } else {
                        self?.showError("Could not extract URL")
                    }
                }
            }
        } else {
            showError("Not a valid URL")
        }
    }

    // MARK: - API Calls
    private func loadSections() {
        activityIndicator.startAnimating()

        guard let apiURL = URL(string: "https://your-domain.vercel.app/api/share-extension/sections") else {
            showError("Invalid API URL")
            return
        }

        var request = URLRequest(url: apiURL)
        request.httpMethod = "GET"

        // Add session cookie from shared credentials
        if let cookies = getSharedCookies() {
            request.setValue(cookies, forHTTPHeaderField: "Cookie")
        }

        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.activityIndicator.stopAnimating()

                if let error = error {
                    self?.showError("Network error: \(error.localizedDescription)")
                    return
                }

                guard let httpResponse = response as? HTTPURLResponse else {
                    self?.showError("Invalid response")
                    return
                }

                if httpResponse.statusCode == 401 {
                    self?.showError("Not authenticated. Please sign in to the app first.")
                    return
                }

                guard let data = data else {
                    self?.showError("No data received")
                    return
                }

                do {
                    let sectionsResponse = try JSONDecoder().decode(SectionsResponse.self, from: data)
                    self?.sections = sectionsResponse.sections
                    self?.defaultSectionId = sectionsResponse.defaultSectionId

                    // Select default section
                    if let defaultId = sectionsResponse.defaultSectionId,
                       let defaultIndex = self?.sections.firstIndex(where: { $0.id == defaultId }) {
                        self?.sectionPicker.selectRow(defaultIndex, inComponent: 0, animated: false)
                        self?.selectedSectionId = defaultId
                    } else if let firstSection = self?.sections.first {
                        self?.selectedSectionId = firstSection.id
                    }

                    self?.sectionPicker.reloadAllComponents()
                    self?.sectionPicker.isHidden = false
                    self?.addButton.isHidden = false

                } catch {
                    self?.showError("Failed to parse sections: \(error.localizedDescription)")
                }
            }
        }.resume()
    }

    @objc private func addToLibrary() {
        guard let url = sharedURL,
              let sectionId = selectedSectionId else {
            showError("Missing URL or section")
            return
        }

        activityIndicator.startAnimating()
        addButton.isEnabled = false

        guard let apiURL = URL(string: "https://your-domain.vercel.app/api/share-extension/add-fanfic") else {
            showError("Invalid API URL")
            return
        }

        var request = URLRequest(url: apiURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add session cookie
        if let cookies = getSharedCookies() {
            request.setValue(cookies, forHTTPHeaderField: "Cookie")
        }

        let body: [String: Any] = [
            "url": url,
            "sectionId": sectionId
        ]

        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.activityIndicator.stopAnimating()
                self?.addButton.isEnabled = true

                if let error = error {
                    self?.showError("Network error: \(error.localizedDescription)")
                    return
                }

                guard let httpResponse = response as? HTTPURLResponse else {
                    self?.showError("Invalid response")
                    return
                }

                if httpResponse.statusCode == 200 {
                    self?.showSuccess("Added to library!")
                } else if let data = data,
                          let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
                          let errorMessage = errorResponse["error"] {
                    self?.showError(errorMessage)
                } else {
                    self?.showError("Failed to add fanfic")
                }
            }
        }.resume()
    }

    // MARK: - Shared Credentials
    private func getSharedCookies() -> String? {
        // Read session cookie from App Group shared container
        let sharedDefaults = UserDefaults(suiteName: "group.com.yourname.fanficlibrary")
        return sharedDefaults?.string(forKey: "sessionCookie")
    }

    // MARK: - UI Helpers
    private func showError(_ message: String) {
        statusLabel.text = "❌ \(message)"
        statusLabel.textColor = .systemRed

        DispatchQueue.main.asyncAfter(deadline: .now() + 3) { [weak self] in
            self?.extensionContext?.cancelRequest(withError: NSError(domain: "ShareExtension", code: -1))
        }
    }

    private func showSuccess(_ message: String) {
        statusLabel.text = "✅ \(message)"
        statusLabel.textColor = .systemGreen

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: nil)
        }
    }
}

// MARK: - Picker Delegate & DataSource
extension ShareViewController: UIPickerViewDelegate, UIPickerViewDataSource {
    func numberOfComponents(in pickerView: UIPickerView) -> Int {
        return 1
    }

    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
        return sections.count
    }

    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
        let section = sections[row]

        // Show hierarchy with indentation
        if let parentId = section.parentId,
           let parent = sections.first(where: { $0.id == parentId }) {
            return "  ↳ \(section.name)"
        }

        // Highlight default section
        if section.id == defaultSectionId {
            return "\(section.name) ⭐️"
        }

        return section.name
    }

    func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int, inComponent component: Int) {
        selectedSectionId = sections[row].id
    }
}
```

## Step 5: Configure Info.plist for Share Extension

Edit the Share Extension's `Info.plist`:

```xml
<key>NSExtension</key>
<dict>
    <key>NSExtensionAttributes</key>
    <dict>
        <key>NSExtensionActivationRule</key>
        <dict>
            <key>NSExtensionActivationSupportsWebURLWithMaxCount</key>
            <integer>1</integer>
            <key>NSExtensionActivationSupportsWebPageWithMaxCount</key>
            <integer>1</integer>
        </dict>
    </dict>
    <key>NSExtensionPrincipalClass</key>
    <string>$(PRODUCT_MODULE_NAME).ShareViewController</string>
</dict>
```

## Step 6: Main App - Save Session Cookie

In your main iOS app, after authentication, save the session cookie:

```swift
// In your authentication view controller
func saveSessionCookie() {
    if let cookies = HTTPCookieStorage.shared.cookies(for: URL(string: "https://your-domain.vercel.app")!) {
        let sessionCookie = cookies.first(where: { $0.name.contains("session") || $0.name.contains("authjs") })

        if let cookie = sessionCookie {
            let cookieString = "\(cookie.name)=\(cookie.value)"

            let sharedDefaults = UserDefaults(suiteName: "group.com.yourname.fanficlibrary")
            sharedDefaults?.set(cookieString, forKey: "sessionCookie")
        }
    }
}
```

## Step 7: Testing

1. Build and run the main app
2. Sign in with Google OAuth
3. Go to Safari
4. Navigate to an AO3 work (e.g., `https://archiveofourown.org/works/54890315`)
5. Tap Share button
6. Select "Add to Library"
7. Choose section and tap "Add to Library"

## Part 3: Alternative Approach for iOS App

If you're building a full iOS app, consider:

### Native iOS App with SwiftUI

Instead of just a Share Extension, build a full native app:

1. **SwiftUI Views** for library management
2. **URLSession** to call your Next.js API endpoints
3. **OAuth** integration with Google Sign-In SDK
4. **Share Extension** as described above
5. **WKWebView** for reading fanfics or full native reader

This provides:
- Better performance than WebView
- Native iOS UI/UX
- Offline capabilities
- Push notifications for updates
- Native gestures and interactions

Would you like me to create a full SwiftUI iOS app implementation guide?

## Environment Variables

Remember to replace placeholders:
- `https://your-domain.vercel.app` → Your actual Vercel domain
- `group.com.yourname.fanficlibrary` → Your actual App Group ID
- `com.yourname.fanficlibrary` → Your actual Bundle ID

## Security Considerations

1. **HTTPS Only**: Ensure all API calls use HTTPS in production
2. **Cookie Security**: Session cookies should be `HttpOnly` and `Secure`
3. **CSRF Protection**: NextAuth handles this automatically
4. **Keychain**: For production, consider using iOS Keychain instead of UserDefaults
5. **Certificate Pinning**: For enhanced security, pin your SSL certificate

## Troubleshooting

### "Unauthorized" Error
- Check session cookie is being shared correctly
- Verify App Group is configured properly
- Ensure cookie hasn't expired

### "Not a valid URL"
- Share Extension only works with URLs
- Check NSExtensionActivationRule in Info.plist

### Sections Not Loading
- Verify API endpoint is accessible
- Check network connectivity
- Ensure authentication cookie is valid

## Next Steps

1. Test all API endpoints manually
2. Set up iOS project in Xcode
3. Configure Apple Developer account with App Groups
4. Implement Share Extension
5. Deploy to TestFlight for testing
6. Iterate based on feedback

Need help with any specific part?
