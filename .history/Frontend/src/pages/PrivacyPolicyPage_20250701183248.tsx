import React from 'react';

// Memoized page title for optimal scrolling performance
const PageTitle = React.memo(({ children }: { children: React.ReactNode }) => (
  <div 
    className="mb-8 text-center"
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate',
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden'
    }}
  >
    <div style={{ contain: 'layout style' }}>
      <h1 className="text-4xl font-crashbow text-white tracking-wider mb-2">
        {children}
      </h1>
      <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
    </div>
  </div>
), () => true); // Always prevent re-renders for static content

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl bg-black/20 border border-white/5 backdrop-blur-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
        
        <div className="py-8 px-6 md:px-12">
          {/* Title section */}
          <PageTitle>Privacy Policy</PageTitle>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                MusikMadness ("we", "our", "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our platform. We will also tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-cyan-400 mb-2">2.1 Personal Information</h3>
                  <p className="text-gray-300 leading-relaxed mb-3">
                    When you register for an account, we may collect:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Username and display name</li>
                    <li>Email address</li>
                    <li>Profile information (bio, location, website)</li>
                    <li>Social media handles and links</li>
                    <li>Profile and cover images</li>
                    <li>Music preferences and genres</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-cyan-400 mb-2">2.2 Content and Submissions</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Music submissions and links to streaming platforms</li>
                    <li>Tournament participation data</li>
                    <li>Voting and interaction history</li>
                    <li>Comments and messages</li>
                    <li>Tournament creation and management data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-cyan-400 mb-2">2.3 Technical Information</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>Login and activity timestamps</li>
                    <li>Performance and usage analytics</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. How We Use Your Information</h2>
              <div className="space-y-3">
                <p className="text-gray-300 leading-relaxed">
                  We use your personal information to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Provide and maintain our Service</li>
                  <li>Create and manage your user account</li>
                  <li>Process tournament registrations and submissions</li>
                  <li>Enable voting and competition features</li>
                  <li>Send you important notifications about tournaments and account updates</li>
                  <li>Improve our platform through analytics and user feedback</li>
                  <li>Ensure fair play and prevent fraudulent activities</li>
                  <li>Comply with legal obligations</li>
                  <li>Communicate with you about our services</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. Information Sharing and Disclosure</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-cyan-400 mb-2">4.1 Public Information</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Certain information is displayed publicly on your profile, including your username, bio, profile picture, social media links, and tournament participation history. You can control most of this information through your privacy settings.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-cyan-400 mb-2">4.2 Third-Party Services</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We may integrate with third-party services like YouTube, SoundCloud, Spotify, and social media platforms to enhance your experience. When you connect these services, you may be sharing information according to their privacy policies.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-cyan-400 mb-2">4.3 Legal Requirements</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We may disclose your information if required by law, court order, or government request, or to protect our rights, property, or safety, or that of other users.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Data Storage and Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">6. Data Retention</h2>
              <p className="text-gray-300 leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law. When you delete your account, we will remove your personal information, though some information may remain in backups for a limited time.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">7. Your Privacy Rights</h2>
              <div className="space-y-3">
                <p className="text-gray-300 leading-relaxed">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong className="text-cyan-400">Access:</strong> Request copies of your personal data</li>
                  <li><strong className="text-cyan-400">Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong className="text-cyan-400">Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong className="text-cyan-400">Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong className="text-cyan-400">Restriction:</strong> Request restriction of processing your data</li>
                  <li><strong className="text-cyan-400">Objection:</strong> Object to processing of your data</li>
                  <li><strong className="text-cyan-400">Withdraw consent:</strong> Withdraw consent for data processing</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">8. Cookies and Tracking Technologies</h2>
              <div className="space-y-3">
                <p className="text-gray-300 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong className="text-cyan-400">Essential cookies:</strong> Required for basic platform functionality</li>
                  <li><strong className="text-cyan-400">Analytics cookies:</strong> Help us understand how you use our platform</li>
                  <li><strong className="text-cyan-400">Preference cookies:</strong> Remember your settings and preferences</li>
                  <li><strong className="text-cyan-400">Security cookies:</strong> Protect against fraudulent activity</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">9. Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">10. International Data Transfers</h2>
              <p className="text-gray-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers are subject to appropriate safeguards and that your privacy rights are protected in accordance with applicable data protection laws.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">11. Third-Party Links</h2>
              <p className="text-gray-300 leading-relaxed">
                Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Section 13 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">13. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/30">
                <p className="text-cyan-400">Email: musikmadnessofficial@gmail.com</p>
                <p className="text-cyan-400">Support: musikmadnessofficial@gmail.com</p>
                <p className="text-cyan-400">Website: musikmadness.com</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
