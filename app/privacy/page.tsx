export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Information We Collect</h2>
          
          <h3 className="text-xl font-medium">Account Information</h3>
          <p>
            When you sign in with Google, we collect your email address, name, and profile picture 
            to create and manage your account. This information is provided by Google OAuth and 
            stored securely in our database.
          </p>

          <h3 className="text-xl font-medium">AO3 Integration</h3>
          <p>
            If you choose to connect your Archive of Our Own (AO3) account, we securely store 
            your AO3 session cookies to enable authenticated access to AO3 content. We do not 
            store your AO3 username or password - only session tokens that allow us to access 
            content on your behalf.
          </p>

          <h3 className="text-xl font-medium">Reading Data</h3>
          <p>
            We store information about the fanfictions you add to your library, including:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fanfiction metadata (title, author, tags, summary)</li>
            <li>Your reading progress and bookmarks</li>
            <li>Your personal notes and kudos status</li>
            <li>Library organization (sections and collections)</li>
          </ul>

          <h3 className="text-xl font-medium">Usage Information</h3>
          <p>
            We collect basic usage information including search queries, page views, and 
            feature usage to improve our service. This data is anonymized and used only 
            for analytics purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and maintain your personal fanfiction library</li>
            <li>Enable AO3 content discovery and reading features</li>
            <li>Generate EPUB files for Kindle delivery</li>
            <li>Provide AI-powered translation services</li>
            <li>Send fanfiction updates via email (if enabled)</li>
            <li>Improve our service through usage analytics</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Storage and Security</h2>
          <p>
            Your data is stored securely using industry-standard encryption. AO3 credentials 
            are encrypted before storage and never transmitted in plain text. We use PostgreSQL 
            database hosted on Neon with secure connections and regular backups.
          </p>
          <p>
            We implement appropriate security measures to protect against unauthorized access, 
            alteration, disclosure, or destruction of your personal information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Third-Party Services</h2>
          
          <h3 className="text-xl font-medium">Google OAuth</h3>
          <p>
            We use Google OAuth for authentication. Please review Google's privacy policy 
            to understand how they handle your data.
          </p>

          <h3 className="text-xl font-medium">Archive of Our Own (AO3)</h3>
          <p>
            We access AO3 content on your behalf using your authenticated session. We do not 
            share your AO3 data with third parties and only use it to provide our services.
          </p>

          <h3 className="text-xl font-medium">AI Translation</h3>
          <p>
            When you use our translation features, fanfiction content may be processed by 
            AI translation services. We ensure these services comply with privacy standards 
            and do not retain your content.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access and download your personal data</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of email notifications</li>
            <li>Disconnect third-party integrations</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Retention</h2>
          <p>
            We retain your account information and library data for as long as your account 
            is active. If you delete your account, we will remove your personal data within 
            30 days, except where required by law or for legitimate business purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not knowingly collect 
            personal information from children under 13. If you are a parent or guardian and 
            believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any 
            changes by posting the new privacy policy on this page and updating the "Last 
            updated" date.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices, 
            please contact us through the app's support features or settings page.
          </p>
        </section>
      </div>
    </div>
  );
}