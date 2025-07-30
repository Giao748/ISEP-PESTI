import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/" 
          className="text-green-600 hover:text-green-800 mb-6 inline-block"
        >
          ← Back to Home
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
            Privacy Policy
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                In accordance with GDPR Article 5 (Data minimization), we only collect information that is 
                necessary for the functioning of PlanetPulse:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Personal Data:</strong> Username, email address, nationality</li>
                <li><strong>Account Data:</strong> Encrypted password, account preferences</li>
                <li><strong>Usage Data:</strong> Login times, consent records</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Legal Basis for Processing (GDPR Article 6)</h2>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Consent:</strong> Account creation and marketing communications</li>
                <li><strong>Legitimate Interest:</strong> Platform security and functionality</li>
                <li><strong>Legal Obligation:</strong> Data retention requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Your Rights Under GDPR</h2>
              <p className="mb-4">As a data subject, you have the following rights:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Right of Access (Article 15):</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification (Article 16):</strong> Correct inaccurate data</li>
                <li><strong>Right to Erasure (Article 17):</strong> Request deletion of your data</li>
                <li><strong>Right to Data Portability (Article 20):</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Object (Article 21):</strong> Object to processing for direct marketing</li>
                <li><strong>Right to Restrict Processing (Article 18):</strong> Limit how we use your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to ensure data security:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Password encryption using PBKDF2 with SHA-512</li>
                <li>Secure database connections</li>
                <li>Regular security audits</li>
                <li>Access controls and user authentication</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Data Retention</h2>
              <p className="mb-4">
                We retain your data for as long as necessary to provide our services or as required by law:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Account data: Until account deletion or 7 years of inactivity</li>
                <li>Consent records: 7 years from last interaction</li>
                <li>Processing logs: 3 years for security purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. International Transfers</h2>
              <p className="mb-4">
                Your data is stored on servers located in the European Union. Any international 
                transfers are conducted with appropriate safeguards in place.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Contact Information</h2>
              <p className="mb-4">
                For any privacy-related questions or to exercise your rights, please contact:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                <p><strong>Data Protection Officer</strong></p>
                <p>Email: privacy@planetpulse.com</p>
                <p>Address: ISEP - Instituto Superior de Engenharia do Porto</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this privacy policy from time to time. We will notify you of any 
                changes by posting the new privacy policy on this page and updating the 
                "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Cookie Policy</h2>
              <p className="mb-4">
                We use cookies to improve your experience on our website. You can manage your 
                cookie preferences in your browser settings. Essential cookies are necessary 
                for the website to function properly.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}