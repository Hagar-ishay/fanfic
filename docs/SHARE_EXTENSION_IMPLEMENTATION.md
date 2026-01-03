# iOS Share Extension Implementation Guide

Complete guide for implementing a native iOS app with Safari Share Extension to add AO3 fanfics to your library.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Xcode Project Setup](#xcode-project-setup)
3. [Swift Source Files](#swift-source-files)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- **macOS** with Xcode 15 or later
- **Apple Developer Account** ($99/year) - required for App Groups and App Store deployment
- **Production URL** - Your deployed Next.js app (will use Vercel URL)
- Basic understanding of iOS development

## Xcode Project Setup

### Step 1: Create New iOS App Project

1. Open Xcode
2. File → New → Project
3. Choose **iOS** → **App**
4. Fill in project details:
   - **Product Name**: FanficLibrary
   - **Team**: Select your Apple Developer team
   - **Organization Identifier**: `com.fanfic` (or your preference)
   - **Bundle Identifier**: `com.fanfic.library` (will be auto-generated)
   - **Interface**: SwiftUI
   - **Language**: Swift
   - **Include Tests**: Optional
5. Click **Create** and choose save location

### Step 2: Add Share Extension Target

1. With your project open, click **File** → **New** → **Target**
2. Choose **iOS** → **Share Extension**
3. Fill in extension details:
   - **Product Name**: AddToLibrary
   - **Team**: Same as main app
   - **Language**: Swift
   - **Bundle Identifier**: `com.fanfic.library.share` (will be auto-generated)
4. Click **Finish**
5. When prompted "Activate 'AddToLibrary' scheme?", click **Activate**

### Step 3: Configure App Groups

**Important**: App Groups allow the main app and share extension to share data (session cookies).

#### In Apple Developer Portal:

1. Go to [developer.apple.com/account](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **App Groups** (from filter dropdown)
4. Click **+** to create new App Group
5. Register App Group:
   - **Description**: Fanfic Library Shared Data
   - **Identifier**: `group.com.fanfic.library`
6. Click **Continue** → **Register**

7. Now add App Group to both App IDs:
   - Go to **Identifiers** → **App IDs**
   - Find `com.fanfic.library` → Edit
   - Enable **App Groups** capability
   - Click **Edit** next to App Groups
   - Check `group.com.fanfic.library`
   - Click **Continue** → **Save**
   - Repeat for `com.fanfic.library.share`

#### In Xcode:

1. Select your project in Project Navigator
2. Select **FanficLibrary** target
3. Go to **Signing & Capabilities** tab
4. Click **+ Capability** → **App Groups**
5. Click **+** under App Groups and add: `group.com.fanfic.library`
6. Repeat steps 2-5 for **AddToLibrary** target

### Step 4: Create Shared Folder

To share code between the app and extension:

1. In Project Navigator, right-click on **FanficLibrary** folder
2. Select **New Group**
3. Name it **Shared**
4. This will contain files used by both targets

## Swift Source Files

Copy the following files into your Xcode project. Make sure to set the correct target membership.

### File 1: Shared/Config.swift

**Target Membership**: Both FanficLibrary and AddToLibrary

**Location**: Create new file in Shared folder

```swift
//
//  Config.swift
//  FanficLibrary
//
//  Shared configuration constants
//

import Foundation

/// Shared configuration for the app and share extension
struct Config {
    // MARK: - App Group

    /// App Group identifier for sharing data between app and extension
    static let appGroupIdentifier = "group.com.fanfic.library"

    // MARK: - API Configuration

    /// Base URL for the backend API
    /// TODO: Replace with your production Vercel URL
    static let apiBaseURL = "https://your-app-name.vercel.app"

    // MARK: - Storage Keys

    /// UserDefaults key for storing session cookie
    static let sessionCookieKey = "sessionCookie"

    /// UserDefaults key for storing user name
    static let userNameKey = "userName"

    /// UserDefaults key for storing user email
    static let userEmailKey = "userEmail"

    // MARK: - Session Cookie Names

    /// Possible NextAuth session cookie names to look for
    static let sessionCookieNames = [
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "next-auth.session-token",
        "__Secure-next-auth.session-token"
    ]

    // MARK: - Helper Methods

    /// Get shared UserDefaults for App Group
    static var sharedDefaults: UserDefaults? {
        return UserDefaults(suiteName: appGroupIdentifier)
    }

    /// Check if user is authenticated
    static var isAuthenticated: Bool {
        guard let defaults = sharedDefaults else { return false }
        return defaults.string(forKey: sessionCookieKey) != nil
    }

    /// Get session cookie value
    static var sessionCookie: String? {
        return sharedDefaults?.string(forKey: sessionCookieKey)
    }

    /// Get user name
    static var userName: String? {
        return sharedDefaults?.string(forKey: userNameKey)
    }

    /// Save authentication data
    static func saveAuth(cookie: String, name: String?, email: String?) {
        guard let defaults = sharedDefaults else { return }
        defaults.set(cookie, forKey: sessionCookieKey)
        if let name = name {
            defaults.set(name, forKey: userNameKey)
        }
        if let email = email {
            defaults.set(email, forKey: userEmailKey)
        }
    }

    /// Clear authentication data
    static func clearAuth() {
        guard let defaults = sharedDefaults else { return }
        defaults.removeObject(forKey: sessionCookieKey)
        defaults.removeObject(forKey: userNameKey)
        defaults.removeObject(forKey: userEmailKey)
    }
}
```

### File 2: Shared/Models.swift

**Target Membership**: Both FanficLibrary and AddToLibrary

**Location**: Create new file in Shared folder

```swift
//
//  Models.swift
//  FanficLibrary
//
//  Data models for API communication
//

import Foundation

// MARK: - API Response Models

/// Response from GET /api/share-extension/sections
struct SectionsResponse: Codable {
    let sections: [Section]
    let defaultSectionId: Int?
}

/// Section model
struct Section: Codable, Identifiable {
    let id: Int
    let name: String
    let parentId: Int?

    /// Calculate depth level for indentation (0 for root sections)
    func depth(in allSections: [Section]) -> Int {
        guard let parentId = parentId else { return 0 }
        guard let parent = allSections.first(where: { $0.id == parentId }) else { return 0 }
        return 1 + parent.depth(in: allSections)
    }

    /// Get display name with indentation for nested sections
    func displayName(in allSections: [Section]) -> String {
        let indentation = String(repeating: "    ", count: depth(in: allSections))
        return indentation + name
    }
}

/// Request body for POST /api/share-extension/add-fanfic
struct AddFanficRequest: Codable {
    let url: String
    let sectionId: Int?
}

/// Response from POST /api/share-extension/add-fanfic
struct AddFanficResponse: Codable {
    let success: Bool
    let message: String?
}

/// Generic error response
struct ErrorResponse: Codable {
    let error: String
}

// MARK: - Extension Helpers

extension Section {
    /// Check if this is the default section
    func isDefault(defaultId: Int?) -> Bool {
        guard let defaultId = defaultId else { return false }
        return id == defaultId
    }

    /// Get display name with star indicator for default section
    func displayNameWithIndicator(defaultId: Int?, allSections: [Section]) -> String {
        let base = displayName(in: allSections)
        return isDefault(defaultId: defaultId) ? "⭐️ \(base)" : base
    }
}
```

### File 3: Shared/APIClient.swift

**Target Membership**: Both FanficLibrary and AddToLibrary

**Location**: Create new file in Shared folder

```swift
//
//  APIClient.swift
//  FanficLibrary
//
//  Network layer for API communication
//

import Foundation

/// Network client for communicating with backend API
class APIClient {

    // MARK: - Singleton

    static let shared = APIClient()

    private init() {}

    // MARK: - API Methods

    /// Fetch user's sections
    /// - Parameter sessionCookie: NextAuth session cookie
    /// - Returns: Sections response with default section ID
    func fetchSections(sessionCookie: String) async throws -> SectionsResponse {
        let url = URL(string: "\(Config.apiBaseURL)/api/share-extension/sections")!

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(sessionCookie, forHTTPHeaderField: "Cookie")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        // Check for authentication error
        if httpResponse.statusCode == 401 {
            throw APIError.unauthorized
        }

        // Check for other errors
        if httpResponse.statusCode != 200 {
            if let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw APIError.serverError(errorResponse.error)
            }
            throw APIError.httpError(httpResponse.statusCode)
        }

        let sectionsResponse = try JSONDecoder().decode(SectionsResponse.self, from: data)
        return sectionsResponse
    }

    /// Add fanfic to library
    /// - Parameters:
    ///   - url: AO3 work URL
    ///   - sectionId: Target section ID (optional, will use default if nil)
    ///   - sessionCookie: NextAuth session cookie
    /// - Returns: Success/error message
    func addFanfic(url: String, sectionId: Int?, sessionCookie: String) async throws -> String {
        let apiUrl = URL(string: "\(Config.apiBaseURL)/api/share-extension/add-fanfic")!

        var request = URLRequest(url: apiUrl)
        request.httpMethod = "POST"
        request.setValue(sessionCookie, forHTTPHeaderField: "Cookie")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let body = AddFanficRequest(url: url, sectionId: sectionId)
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        // Check for authentication error
        if httpResponse.statusCode == 401 {
            throw APIError.unauthorized
        }

        // Check for other errors
        if httpResponse.statusCode != 200 {
            if let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw APIError.serverError(errorResponse.error)
            }
            throw APIError.httpError(httpResponse.statusCode)
        }

        let addResponse = try JSONDecoder().decode(AddFanficResponse.self, from: data)
        return addResponse.message ?? "Fanfic added successfully"
    }
}

// MARK: - Error Types

enum APIError: LocalizedError {
    case invalidResponse
    case unauthorized
    case httpError(Int)
    case serverError(String)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "Session expired. Please sign in again."
        case .httpError(let code):
            return "Server error: \(code)"
        case .serverError(let message):
            return message
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}
```

### File 4: FanficLibrary/FanficLibraryApp.swift

**Target Membership**: FanficLibrary only

**Location**: Already exists, replace content

```swift
//
//  FanficLibraryApp.swift
//  FanficLibrary
//
//  App entry point
//

import SwiftUI

@main
struct FanficLibraryApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### File 5: FanficLibrary/ContentView.swift

**Target Membership**: FanficLibrary only

**Location**: Already exists, replace content

```swift
//
//  ContentView.swift
//  FanficLibrary
//
//  Main app screen - handles sign in and displays instructions
//

import SwiftUI
import WebKit

struct ContentView: View {
    @StateObject private var authManager = AuthenticationManager()

    var body: some View {
        NavigationStack {
            VStack(spacing: 30) {
                if authManager.isSignedIn {
                    // Signed in state
                    signedInView
                } else {
                    // Sign in state
                    signInView
                }
            }
            .padding()
            .navigationTitle("Fanfic Library")
        }
        .onAppear {
            authManager.checkAuthStatus()
        }
    }

    // MARK: - Sign In View

    private var signInView: some View {
        VStack(spacing: 30) {
            Spacer()

            VStack(spacing: 20) {
                Image(systemName: "book.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.blue)

                Text("Fanfic Library")
                    .font(.largeTitle)
                    .bold()

                Text("Add AO3 fanfics to your library\ndirectly from Safari")
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
            }

            Spacer()

            VStack(spacing: 15) {
                Button(action: {
                    authManager.showSignIn = true
                }) {
                    HStack {
                        Image(systemName: "person.circle.fill")
                        Text("Sign In with Google")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }

                Text("Sign in using the web app")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .sheet(isPresented: $authManager.showSignIn) {
            AuthWebView(authManager: authManager)
        }
    }

    // MARK: - Signed In View

    private var signedInView: some View {
        VStack(spacing: 30) {
            VStack(spacing: 20) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.green)

                if let userName = authManager.userName {
                    Text("Welcome, \(userName)!")
                        .font(.title2)
                } else {
                    Text("You're all set!")
                        .font(.title2)
                }
            }

            Divider()
                .padding(.vertical)

            VStack(spacing: 20) {
                Text("How to use:")
                    .font(.headline)

                VStack(alignment: .leading, spacing: 15) {
                    InstructionRow(number: 1, text: "Open Safari on your iPhone")
                    InstructionRow(number: 2, text: "Navigate to any AO3 fanfic")
                    InstructionRow(number: 3, text: "Tap the Share button")
                    InstructionRow(number: 4, text: "Select 'Add to Library'")
                    InstructionRow(number: 5, text: "Choose a section and confirm")
                }
            }

            Spacer()

            VStack(spacing: 15) {
                Button(action: {
                    openWebApp()
                }) {
                    HStack {
                        Image(systemName: "safari")
                        Text("Open Web App")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }

                Button(action: {
                    authManager.signOut()
                }) {
                    Text("Sign Out")
                        .foregroundColor(.red)
                }
            }
        }
    }

    // MARK: - Helper Methods

    private func openWebApp() {
        if let url = URL(string: Config.apiBaseURL) {
            UIApplication.shared.open(url)
        }
    }
}

// MARK: - Instruction Row Component

struct InstructionRow: View {
    let number: Int
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text("\(number)")
                .font(.headline)
                .foregroundColor(.white)
                .frame(width: 28, height: 28)
                .background(Color.blue)
                .clipShape(Circle())

            Text(text)
                .font(.body)

            Spacer()
        }
    }
}

// MARK: - Preview

#Preview {
    ContentView()
}
```

### File 6: FanficLibrary/AuthenticationManager.swift

**Target Membership**: FanficLibrary only

**Location**: Create new file in FanficLibrary folder

```swift
//
//  AuthenticationManager.swift
//  FanficLibrary
//
//  Handles web-based OAuth and cookie extraction
//

import Foundation
import SwiftUI
import WebKit
import Combine

/// Manages authentication state and web-based sign in
class AuthenticationManager: ObservableObject {
    @Published var isSignedIn = false
    @Published var userName: String?
    @Published var showSignIn = false

    /// Check if user is already authenticated
    func checkAuthStatus() {
        isSignedIn = Config.isAuthenticated
        userName = Config.userName
    }

    /// Sign out user
    func signOut() {
        Config.clearAuth()
        isSignedIn = false
        userName = nil
    }

    /// Handle successful authentication
    func handleAuthSuccess(cookie: String, name: String?, email: String?) {
        Config.saveAuth(cookie: cookie, name: name, email: email)
        isSignedIn = true
        userName = name
        showSignIn = false
    }
}

// MARK: - Auth Web View

struct AuthWebView: View {
    @ObservedObject var authManager: AuthenticationManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            WebView(authManager: authManager)
                .navigationTitle("Sign In")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            dismiss()
                        }
                    }
                }
        }
    }
}

// MARK: - Web View Wrapper

struct WebView: UIViewRepresentable {
    let authManager: AuthenticationManager

    func makeCoordinator() -> Coordinator {
        Coordinator(authManager: authManager)
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator

        // Load sign in page
        let url = URL(string: "\(Config.apiBaseURL)/api/auth/signin")!
        webView.load(URLRequest(url: url))

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        // No updates needed
    }

    // MARK: - Coordinator

    class Coordinator: NSObject, WKNavigationDelegate {
        let authManager: AuthenticationManager
        private var hasExtractedCookie = false

        init(authManager: AuthenticationManager) {
            self.authManager = authManager
        }

        /// Called when navigation completes
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            // Check if we're on the home page (successful sign in)
            guard let url = webView.url?.absoluteString,
                  url.contains(Config.apiBaseURL),
                  !url.contains("/api/auth/signin"),
                  !hasExtractedCookie else {
                return
            }

            // Extract cookies
            extractSessionCookie(from: webView)
        }

        /// Extract NextAuth session cookie from WebView
        private func extractSessionCookie(from webView: WKWebView) {
            let cookieStore = webView.configuration.websiteDataStore.httpCookieStore

            cookieStore.getAllCookies { [weak self] cookies in
                guard let self = self else { return }

                // Find NextAuth session cookie
                if let sessionCookie = cookies.first(where: { cookie in
                    Config.sessionCookieNames.contains(cookie.name)
                }) {
                    // Format cookie string
                    let cookieString = "\(sessionCookie.name)=\(sessionCookie.value)"

                    // Extract user info from JavaScript
                    webView.evaluateJavaScript("""
                        JSON.stringify({
                            name: document.querySelector('[data-user-name]')?.textContent,
                            email: document.querySelector('[data-user-email]')?.textContent
                        })
                    """) { result, error in
                        var userName: String?
                        var userEmail: String?

                        if let jsonString = result as? String,
                           let data = jsonString.data(using: .utf8),
                           let json = try? JSONSerialization.jsonObject(with: data) as? [String: String] {
                            userName = json["name"]
                            userEmail = json["email"]
                        }

                        // Save auth data
                        DispatchQueue.main.async {
                            self.hasExtractedCookie = true
                            self.authManager.handleAuthSuccess(
                                cookie: cookieString,
                                name: userName,
                                email: userEmail
                            )
                        }
                    }
                }
            }
        }
    }
}
```

### File 7: AddToLibrary/ShareViewController.swift

**Target Membership**: AddToLibrary only

**Location**: Already exists, replace content

```swift
//
//  ShareViewController.swift
//  AddToLibrary
//
//  Share Extension UI and logic
//

import UIKit
import Social

class ShareViewController: UIViewController {

    // MARK: - UI Components

    private let containerView = UIView()
    private let titleLabel = UILabel()
    private let messageLabel = UILabel()
    private let sectionLabel = UILabel()
    private let pickerView = UIPickerView()
    private let confirmButton = UIButton(type: .system)
    private let cancelButton = UIButton(type: .system)
    private let activityIndicator = UIActivityIndicatorView(style: .large)

    // MARK: - State

    private var sections: [Section] = []
    private var defaultSectionId: Int?
    private var selectedSection: Section?
    private var sharedURL: String?

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()

        view.backgroundColor = UIColor.black.withAlphaComponent(0.5)

        setupUI()
        extractURL()
    }

    // MARK: - UI Setup

    private func setupUI() {
        // Container view
        containerView.backgroundColor = .systemBackground
        containerView.layer.cornerRadius = 16
        containerView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(containerView)

        // Title label
        titleLabel.text = "Add to Library"
        titleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        titleLabel.textAlignment = .center
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(titleLabel)

        // Message label
        messageLabel.text = "Loading sections..."
        messageLabel.font = .systemFont(ofSize: 16)
        messageLabel.textAlignment = .center
        messageLabel.numberOfLines = 0
        messageLabel.textColor = .secondaryLabel
        messageLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(messageLabel)

        // Section label
        sectionLabel.text = "Choose section:"
        sectionLabel.font = .systemFont(ofSize: 14, weight: .medium)
        sectionLabel.textColor = .secondaryLabel
        sectionLabel.translatesAutoresizingMaskIntoConstraints = false
        sectionLabel.isHidden = true
        containerView.addSubview(sectionLabel)

        // Picker view
        pickerView.delegate = self
        pickerView.dataSource = self
        pickerView.translatesAutoresizingMaskIntoConstraints = false
        pickerView.isHidden = true
        containerView.addSubview(pickerView)

        // Confirm button
        confirmButton.setTitle("Add to Library", for: .normal)
        confirmButton.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        confirmButton.backgroundColor = .systemBlue
        confirmButton.setTitleColor(.white, for: .normal)
        confirmButton.layer.cornerRadius = 10
        confirmButton.addTarget(self, action: #selector(confirmTapped), for: .touchUpInside)
        confirmButton.translatesAutoresizingMaskIntoConstraints = false
        confirmButton.isHidden = true
        containerView.addSubview(confirmButton)

        // Cancel button
        cancelButton.setTitle("Cancel", for: .normal)
        cancelButton.titleLabel?.font = .systemFont(ofSize: 17)
        cancelButton.setTitleColor(.systemRed, for: .normal)
        cancelButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)
        cancelButton.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(cancelButton)

        // Activity indicator
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        activityIndicator.hidesWhenStopped = true
        containerView.addSubview(activityIndicator)

        // Layout constraints
        NSLayoutConstraint.activate([
            containerView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            containerView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            containerView.widthAnchor.constraint(equalToConstant: 320),
            containerView.heightAnchor.constraint(greaterThanOrEqualToConstant: 300),

            titleLabel.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 20),
            titleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            titleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),

            messageLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 20),
            messageLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            messageLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),

            activityIndicator.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            activityIndicator.topAnchor.constraint(equalTo: messageLabel.bottomAnchor, constant: 20),

            sectionLabel.topAnchor.constraint(equalTo: messageLabel.bottomAnchor, constant: 20),
            sectionLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            sectionLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),

            pickerView.topAnchor.constraint(equalTo: sectionLabel.bottomAnchor, constant: 10),
            pickerView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            pickerView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            pickerView.heightAnchor.constraint(equalToConstant: 150),

            confirmButton.topAnchor.constraint(equalTo: pickerView.bottomAnchor, constant: 20),
            confirmButton.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            confirmButton.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),
            confirmButton.heightAnchor.constraint(equalToConstant: 50),

            cancelButton.topAnchor.constraint(equalTo: confirmButton.bottomAnchor, constant: 10),
            cancelButton.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            cancelButton.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -20),
        ])
    }

    // MARK: - URL Extraction

    private func extractURL() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let itemProvider = extensionItem.attachments?.first else {
            showError("No URL found")
            return
        }

        // Check if item has URL
        if itemProvider.hasItemConformingToTypeIdentifier("public.url") {
            itemProvider.loadItem(forTypeIdentifier: "public.url", options: nil) { [weak self] (url, error) in
                DispatchQueue.main.async {
                    if let error = error {
                        self?.showError("Failed to extract URL: \(error.localizedDescription)")
                        return
                    }

                    if let url = url as? URL {
                        self?.sharedURL = url.absoluteString
                        self?.loadSections()
                    } else {
                        self?.showError("Invalid URL")
                    }
                }
            }
        } else {
            showError("Please share a URL")
        }
    }

    // MARK: - Load Sections

    private func loadSections() {
        // Check for session cookie
        guard let sessionCookie = Config.sessionCookie else {
            showError("Please sign in to the Fanfic Library app first")
            return
        }

        activityIndicator.startAnimating()
        messageLabel.text = "Loading sections..."

        Task {
            do {
                let response = try await APIClient.shared.fetchSections(sessionCookie: sessionCookie)

                await MainActor.run {
                    self.sections = response.sections
                    self.defaultSectionId = response.defaultSectionId

                    // Select default section
                    if let defaultId = defaultSectionId,
                       let defaultIndex = sections.firstIndex(where: { $0.id == defaultId }) {
                        selectedSection = sections[defaultIndex]
                        pickerView.selectRow(defaultIndex, inComponent: 0, animated: false)
                    } else if let firstSection = sections.first {
                        selectedSection = firstSection
                    }

                    showSectionPicker()
                }
            } catch let error as APIError {
                await MainActor.run {
                    showError(error.localizedDescription)
                }
            } catch {
                await MainActor.run {
                    showError("Failed to load sections: \(error.localizedDescription)")
                }
            }
        }
    }

    // MARK: - Show Section Picker

    private func showSectionPicker() {
        activityIndicator.stopAnimating()

        if sections.isEmpty {
            showError("No sections found. Please create a section in the web app first.")
            return
        }

        messageLabel.isHidden = true
        sectionLabel.isHidden = false
        pickerView.isHidden = false
        confirmButton.isHidden = false

        pickerView.reloadAllComponents()
    }

    // MARK: - Add Fanfic

    @objc private func confirmTapped() {
        guard let url = sharedURL,
              let section = selectedSection,
              let sessionCookie = Config.sessionCookie else {
            showError("Missing required data")
            return
        }

        // Hide picker, show loading
        pickerView.isHidden = true
        confirmButton.isHidden = true
        cancelButton.isHidden = true
        sectionLabel.isHidden = true
        messageLabel.isHidden = false
        messageLabel.text = "Adding fanfic..."
        activityIndicator.startAnimating()

        Task {
            do {
                let message = try await APIClient.shared.addFanfic(
                    url: url,
                    sectionId: section.id,
                    sessionCookie: sessionCookie
                )

                await MainActor.run {
                    showSuccess(message)
                }
            } catch let error as APIError {
                await MainActor.run {
                    // Show error but allow retry
                    activityIndicator.stopAnimating()
                    messageLabel.text = error.localizedDescription
                    messageLabel.textColor = .systemRed
                    cancelButton.isHidden = false
                }
            } catch {
                await MainActor.run {
                    activityIndicator.stopAnimating()
                    messageLabel.text = "Failed to add fanfic"
                    messageLabel.textColor = .systemRed
                    cancelButton.isHidden = false
                }
            }
        }
    }

    // MARK: - UI State Methods

    private func showSuccess(_ message: String) {
        activityIndicator.stopAnimating()
        messageLabel.text = "✓ \(message)"
        messageLabel.textColor = .systemGreen

        // Auto-dismiss after 2 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
        }
    }

    private func showError(_ message: String) {
        activityIndicator.stopAnimating()
        messageLabel.text = message
        messageLabel.textColor = .systemRed
        messageLabel.isHidden = false

        sectionLabel.isHidden = true
        pickerView.isHidden = true
        confirmButton.isHidden = true
        cancelButton.isHidden = false
    }

    @objc private func cancelTapped() {
        extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
    }
}

// MARK: - Picker View Delegate & Data Source

extension ShareViewController: UIPickerViewDelegate, UIPickerViewDataSource {
    func numberOfComponents(in pickerView: UIPickerView) -> Int {
        return 1
    }

    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
        return sections.count
    }

    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
        let section = sections[row]
        return section.displayNameWithIndicator(defaultId: defaultSectionId, allSections: sections)
    }

    func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int, inComponent component: Int) {
        selectedSection = sections[row]
    }
}
```

## Configuration

### Step 1: Update Config.swift

Open `Shared/Config.swift` and update the following:

1. **API Base URL**: Replace `https://your-app-name.vercel.app` with your actual Vercel production URL
2. **App Group Identifier**: If you used a different identifier than `group.com.fanfic.library`, update it

### Step 2: Configure Share Extension Info.plist

1. In Project Navigator, expand **AddToLibrary** folder
2. Open **Info.plist**
3. Find the `NSExtension` dictionary
4. Find `NSExtensionAttributes` → `NSExtensionActivationRule`
5. Make sure it contains:

```xml
<key>NSExtensionActivationSupportsWebURLWithMaxCount</key>
<integer>1</integer>
```

This ensures the Share Extension only appears when sharing URLs.

**Complete Info.plist NSExtension section should look like:**

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

### Step 3: Set Deployment Target

1. Select your project in Project Navigator
2. Select **FanficLibrary** target
3. Go to **General** tab
4. Set **Minimum Deployments** to **iOS 16.0** or later
5. Repeat for **AddToLibrary** target

### Step 4: Configure Signing

1. Select **FanficLibrary** target
2. Go to **Signing & Capabilities**
3. Check **Automatically manage signing**
4. Select your **Team**
5. Repeat for **AddToLibrary** target

## Testing

### Step 1: Simulator Testing

1. Select **FanficLibrary** scheme
2. Choose **iPhone 15 Pro** simulator (or any iOS 16+ simulator)
3. Click **Run** (⌘R)
4. The app should launch and show the sign-in screen

### Step 2: Test Main App Sign In

1. Tap **Sign In with Google**
2. The web view should load your production app's sign-in page
3. Complete the Google OAuth flow
4. After successful sign in, the app should:
   - Extract the session cookie
   - Show the success screen with instructions
   - Save the cookie to shared UserDefaults

### Step 3: Test Share Extension

**Note**: Share Extensions don't work well in simulators. You need a real device for proper testing.

**On Real Device:**

1. Build and install the app on your device
2. Sign in through the main app
3. Open **Safari**
4. Navigate to any AO3 work (e.g., `https://archiveofourown.org/works/12345`)
5. Tap the **Share** button (square with arrow)
6. Scroll down and tap **Add to Library** (you may need to tap "More" first to enable it)
7. The Share Extension should appear with:
   - Loading indicator
   - Your sections in a picker
   - Default section marked with ⭐️
8. Select a section
9. Tap **Add to Library**
10. Should show success message and auto-dismiss

### Step 4: Test Error Cases

**Test Session Expiry:**
1. In the main app, tap **Sign Out**
2. Try to use the Share Extension
3. Should show "Please sign in to the Fanfic Library app first"

**Test Invalid URL:**
1. Share a non-AO3 URL
2. Should show error message from API

**Test Duplicate:**
1. Add the same fanfic twice
2. Should show "Fanfic already exists" or similar error

## Deployment

### Step 1: App Store Connect Setup

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in app details:
   - **Platform**: iOS
   - **Name**: Fanfic Library (or your choice)
   - **Primary Language**: English
   - **Bundle ID**: Select `com.fanfic.library`
   - **SKU**: any unique identifier (e.g., `fanfic-library-001`)
4. Click **Create**

### Step 2: Prepare App Metadata

1. **App Information:**
   - Category: Utilities or Productivity
   - Content Rights: Select appropriate option

2. **Pricing and Availability:**
   - Price: Free (or set price)
   - Availability: All countries

3. **App Privacy:**
   - Click **Get Started**
   - Add privacy policy URL (required for Google Sign-In)
   - Answer data collection questions:
     - Do you collect data from this app? Yes
     - Contact Info: Email (for Google account)
     - Identifiers: User ID (for authentication)

4. **Screenshots:**
   - Take screenshots on required device sizes:
     - 6.7" (iPhone 15 Pro Max)
     - 6.5" (iPhone 11 Pro Max)
   - Show: Sign-in screen, instructions, Share Extension UI

5. **Description:**
```
Add AO3 fanfics to your library directly from Safari with one tap.

Features:
• Sign in once with your Google account
• Share any AO3 work from Safari
• Choose which section to add to
• Automatic organization using your default section
• Fast and lightweight

Perfect for avid fanfiction readers who want quick access to save stories while browsing.
```

6. **Keywords:**
   `fanfiction, AO3, archive, reading, library, safari, share, bookmarks`

### Step 3: Archive and Upload

1. In Xcode, select **Any iOS Device (arm64)** as destination
2. Go to **Product** → **Archive**
3. Wait for archive to complete
4. In the Organizer window:
   - Select your archive
   - Click **Distribute App**
   - Choose **App Store Connect**
   - Click **Upload**
   - Wait for upload to complete (can take 5-10 minutes)

### Step 4: Submit for Review

1. Go back to App Store Connect
2. Select your app → **App Store** tab
3. Click **+** next to iOS App → **1.0**
4. Fill in version information:
   - **What's New**: Initial release
   - **Promotional Text**: Optional
5. Build:
   - Click **+** next to Build
   - Select the uploaded build (may take 30-60 minutes to process)
6. App Review Information:
   - Add contact info
   - Add test account credentials (create a Google test account)
   - Add notes: "Share Extension is the main feature. Test by sharing an AO3 URL from Safari."
7. Click **Add for Review**
8. Click **Submit for Review**

### Step 5: Wait for Review

- App Review typically takes 1-3 days
- You'll receive email notifications about status changes
- Common reasons for rejection:
  - Missing privacy policy
  - Crashes or bugs
  - Sign-in issues

## Troubleshooting

### Issue: Share Extension not appearing in Safari

**Solutions:**
1. Make sure App Groups are properly configured in both Developer Portal and Xcode
2. Uninstall the app completely and reinstall
3. Restart your iPhone
4. Check that Share Extension target is included in the build
5. Verify Info.plist activation rules are correct

### Issue: "Unauthorized" error in Share Extension

**Solutions:**
1. Sign in again in the main app
2. Check that session cookie is being saved:
   ```swift
   print(Config.sessionCookie ?? "No cookie")
   ```
3. Verify App Group identifier matches in both targets
4. Check that cookie name matches NextAuth format

### Issue: Session cookie not extracting

**Solutions:**
1. Check NextAuth cookie name in browser dev tools
2. Update `Config.sessionCookieNames` array if needed
3. Make sure you're loading the correct sign-in URL
4. Verify HTTPS is being used (not HTTP)

### Issue: Can't find sections

**Solutions:**
1. Make sure user has created at least one section in the web app
2. Check API endpoint is returning data:
   ```bash
   curl -H "Cookie: your-session-cookie" \
     https://your-app.vercel.app/api/share-extension/sections
   ```
3. Verify JSON parsing in APIClient.swift

### Issue: "Failed to add fanfic" error

**Solutions:**
1. Check that URL is a valid AO3 work URL
2. Verify user has permission to add to selected section
3. Check backend logs for errors
4. Test API endpoint directly:
   ```bash
   curl -X POST \
     -H "Cookie: your-session-cookie" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://archiveofourown.org/works/12345","sectionId":1}' \
     https://your-app.vercel.app/api/share-extension/add-fanfic
   ```

### Issue: App crashes on launch

**Solutions:**
1. Check Xcode console for error messages
2. Verify all files have correct target membership
3. Make sure Info.plist is properly configured
4. Clean build folder (⌘⇧K) and rebuild

### Issue: Picker not showing all sections

**Solutions:**
1. Verify sections array is populated
2. Check console for JSON parsing errors
3. Make sure pickerView.reloadAllComponents() is called

### Debugging Tips

**Add logging to track state:**

```swift
// In ShareViewController.swift
private func loadSections() {
    print("🔍 Loading sections...")
    print("🔍 Session cookie: \(Config.sessionCookie ?? "nil")")

    // ... existing code
}

// After receiving response
print("🔍 Received \(sections.count) sections")
print("🔍 Default section ID: \(defaultSectionId ?? -1)")
```

**Test session cookie directly:**

```swift
// In ContentView.swift onAppear
if let cookie = Config.sessionCookie {
    print("✅ Session cookie exists: \(cookie.prefix(20))...")
} else {
    print("❌ No session cookie found")
}
```

## Advanced Customization

### Change App Icons

1. Open `Assets.xcassets` in each target
2. Click **AppIcon**
3. Drag your icon images (various sizes required)
4. Xcode will show which sizes are needed

### Customize Colors

Update the UI colors in the Swift files:

```swift
// In ContentView.swift
.background(Color.blue)  // Change to your brand color
.foregroundColor(.white)

// In ShareViewController.swift
confirmButton.backgroundColor = .systemBlue  // Change to your brand color
```

### Add App Icon Badge

To show a badge count of saved fanfics:

```swift
// Add to AuthenticationManager.swift
import UserNotifications

func updateBadgeCount() async {
    // Request notification permission
    try? await UNUserNotificationCenter.current()
        .requestAuthorization(options: [.badge])

    // Fetch count from API
    // Update badge
    await MainActor.run {
        UIApplication.shared.applicationIconBadgeNumber = count
    }
}
```

### Add Widgets

Create a Widget Extension to show recently added fanfics on home screen:

1. File → New → Target → Widget Extension
2. Implement `TimelineProvider` to fetch recent fanfics
3. Use App Groups to share data

## Security Best Practices

### 1. Move to Keychain (Production)

For production apps, store the session cookie in Keychain instead of UserDefaults:

```swift
import Security

class KeychainHelper {
    static func save(key: String, data: String) {
        let data = data.data(using: .utf8)!

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]

        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    static func load(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let string = String(data: data, encoding: .utf8) else {
            return nil
        }

        return string
    }
}
```

### 2. Add Certificate Pinning

For enhanced security, pin your API's SSL certificate:

```swift
class PinnedSessionDelegate: NSObject, URLSessionDelegate {
    func urlSession(
        _ session: URLSession,
        didReceive challenge: URLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) {
        // Implement certificate pinning
        // Compare challenge.protectionSpace.serverTrust
        // with your pinned certificate
    }
}
```

### 3. Add Request Signing

Sign API requests to prevent tampering:

```swift
func signRequest(_ request: inout URLRequest) {
    let timestamp = Int(Date().timeIntervalSince1970)
    let signature = generateSignature(timestamp: timestamp)
    request.setValue(signature, forHTTPHeaderField: "X-Signature")
    request.setValue("\(timestamp)", forHTTPHeaderField: "X-Timestamp")
}
```

## Maintenance

### Updating the App

1. Make changes in Xcode
2. Increment version number:
   - Select project → **General** tab
   - Update **Version** (e.g., 1.0 → 1.1)
   - Update **Build** number (must be unique)
3. Archive and upload to App Store Connect
4. Submit new version for review

### Monitoring

Add analytics to track usage:

```swift
// In ShareViewController.swift
private func trackAddFanfic(success: Bool) {
    // Send to your analytics service
    // Example: Firebase Analytics, Mixpanel, etc.
}
```

### User Support

Common user issues:

1. **"I can't find the Share Extension"**
   - Make sure they installed the app
   - Have them restart their iPhone
   - Check Safari → Share → Edit Actions

2. **"Sign in doesn't work"**
   - Make sure they're using Google account
   - Check internet connection
   - Try signing out and back in

3. **"Fanfic won't add"**
   - Verify it's an AO3 URL
   - Check if it's already in their library
   - Make sure they have sections created

## Next Steps

1. **Create App Icon**: Use a tool like Figma or hire a designer
2. **Write Privacy Policy**: Required for App Store submission
3. **Set up TestFlight**: Invite beta testers before public release
4. **Plan Marketing**: How will users discover your app?
5. **Consider Monetization**: Freemium model? One-time purchase?

## Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

## Support

For issues or questions:
1. Check this implementation guide
2. Review the troubleshooting section
3. Check Xcode console for error messages
4. Test API endpoints directly with curl
5. Review backend logs in Vercel dashboard

---

**Congratulations!** You now have everything you need to build and deploy the iOS Share Extension. Follow the steps carefully, test thoroughly, and you'll have your app on the App Store soon.
