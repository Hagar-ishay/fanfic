export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>
          <p>
            By accessing and using Fanfic Penio (&quot;the Service&quot;), you accept and agree to be 
            bound by the terms and provision of this agreement. If you do not agree to abide 
            by the above, please do not use this service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Description of Service</h2>
          <p>
            Fanfic Penio is a platform that provides enhanced reading experiences for 
            Archive of Our Own (AO3) content, including:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Personal fanfiction library organization</li>
            <li>AO3 content discovery and search</li>
            <li>EPUB generation for Kindle delivery</li>
            <li>AI-powered translation services</li>
            <li>Reading progress tracking</li>
            <li>Email notifications for story updates</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">User Accounts and Registration</h2>
          <p>
            To use our service, you must create an account using Google OAuth. You are 
            responsible for maintaining the confidentiality of your account and for all 
            activities that occur under your account.
          </p>
          <p>
            You agree to provide accurate, current, and complete information during the 
            registration process and to update such information to keep it accurate, 
            current, and complete.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Acceptable Use</h2>
          <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Upload, post, or transmit any harmful, illegal, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to the Service or other users&apos; accounts</li>
            <li>Use the Service to spam, harass, or abuse other users</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use automated tools to access the Service without permission</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Content and Copyright</h2>
          
          <h3 className="text-xl font-medium">Third-Party Content</h3>
          <p>
            Our service provides access to content from Archive of Our Own (AO3) and other 
            third-party sources. We do not own or control this content. All fanfiction 
            content remains the property of its original authors and is subject to their 
            respective licenses and terms.
          </p>

          <h3 className="text-xl font-medium">Respect for Authors</h3>
          <p>
            You agree to respect the rights and wishes of fanfiction authors. This includes:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Not redistributing content without permission</li>
            <li>Respecting author&apos;s download restrictions</li>
            <li>Using our service for personal reading purposes only</li>
            <li>Not removing author attribution from downloaded content</li>
          </ul>

          <h3 className="text-xl font-medium">DMCA Compliance</h3>
          <p>
            We respect intellectual property rights. If you believe content accessible 
            through our service infringes your copyright, please contact us with the 
            relevant information, and we will respond appropriately.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">AO3 Integration</h2>
          <p>
            Our service integrates with Archive of Our Own (AO3) to provide enhanced 
            reading experiences. By connecting your AO3 account:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You authorize us to access AO3 content on your behalf</li>
            <li>You agree to comply with AO3&apos;s Terms of Service</li>
            <li>You understand that we may discontinue AO3 integration if required</li>
            <li>You acknowledge that AO3 access depends on your account standing with AO3</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">AI Services</h2>
          <p>
            Our translation and other AI-powered features are provided on a best-effort 
            basis. We do not guarantee the accuracy, completeness, or quality of AI-generated 
            content. You use these features at your own discretion.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Privacy and Data Protection</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy, which also 
            governs your use of the Service, to understand our practices regarding the 
            collection and use of your information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Service Availability</h2>
          <p>
            We strive to maintain high availability but do not guarantee uninterrupted 
            access to the Service. We may temporarily suspend or restrict access for 
            maintenance, updates, or other operational reasons.
          </p>
          <p>
            We reserve the right to modify, suspend, or discontinue the Service at any 
            time with or without notice.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY 
            KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES 
            OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p>
            We do not warrant that the Service will be error-free, secure, or continuously 
            available. Your use of the Service is at your own risk.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
            CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF 
            PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM 
            YOUR USE OF THE SERVICE.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Account Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, 
            without prior notice, for any reason, including if you breach these Terms.
          </p>
          <p>
            You may terminate your account at any time through the settings page. Upon 
            termination, your right to use the Service will cease immediately.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users 
            of any material changes by posting the new Terms on this page and updating 
            the &quot;Last updated&quot; date.
          </p>
          <p>
            Your continued use of the Service after any such changes constitutes your 
            acceptance of the new Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Governing Law</h2>
          <p>
            These Terms shall be interpreted and governed by applicable laws. Any disputes 
            arising from these Terms or your use of the Service shall be resolved through 
            appropriate legal channels.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us 
            through the app&apos;s support features or settings page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Severability</h2>
          <p>
            If any provision of these Terms is held to be invalid or unenforceable, the 
            remaining provisions will remain in full force and effect.
          </p>
        </section>
      </div>
    </div>
  );
}