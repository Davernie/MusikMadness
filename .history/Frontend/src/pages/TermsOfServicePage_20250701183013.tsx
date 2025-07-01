import React from 'react';

// Memoized page title for optimal scrolling performance
const PageTitle = React.memo(({ children }: { children: React.ReactNode }) => (
  <div 
    className="mb-8 text-center"
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate',
      willChange: 'transform'
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

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl bg-black/20 border border-white/5 backdrop-blur-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
        
        <div className="py-8 px-6 md:px-12">
          {/* Title section */}
          <PageTitle>Terms of Service</PageTitle>
        </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using MusikMadness ("Service", "Platform", "we", "us", "our"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Description of Service</h2>
              <p className="text-gray-300 leading-relaxed">
                MusikMadness is a digital platform that allows users to participate in music tournaments, submit musical content, vote on submissions, and engage with other music creators and enthusiasts. The service includes but is not limited to tournament creation, music submission, voting systems, user profiles, and community features.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. User Accounts and Registration</h2>
              <div className="space-y-3">
                <p className="text-gray-300 leading-relaxed">
                  To access certain features of the Service, you must register for an account. When you register, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept all risks of unauthorized access to your account</li>
                  <li>Use your account only for lawful purposes</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. User Content and Conduct</h2>
              <div className="space-y-3">
                <p className="text-gray-300 leading-relaxed">
                  You are solely responsible for content you submit to the Service. By submitting content, you represent that:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>You own all rights to the content or have proper authorization</li>
                  <li>The content does not infringe on any third-party rights</li>
                  <li>The content complies with all applicable laws and regulations</li>
                  <li>The content does not contain harmful, offensive, or illegal material</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  You agree not to use the Service to upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Intellectual Property Rights</h2>
              <p className="text-gray-300 leading-relaxed">
                The Service and its original content, features, and functionality are and will remain the exclusive property of MusikMadness and its licensors. The Service is protected by copyright, trademark, and other laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service without prior written consent.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">6. Tournament Rules and Fair Play</h2>
              <div className="space-y-3">
                <p className="text-gray-300 leading-relaxed">
                  When participating in tournaments, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Follow all tournament-specific rules and guidelines</li>
                  <li>Engage in fair play and honest competition</li>
                  <li>Not manipulate voting or use fraudulent means to gain advantage</li>
                  <li>Respect other participants and their submissions</li>
                  <li>Accept tournament results and decisions made by organizers</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">7. Privacy and Data Protection</h2>
              <p className="text-gray-300 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection, use, and disclosure of your personal information.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">8. Prohibited Uses</h2>
              <div className="space-y-3">
                <p className="text-gray-300 leading-relaxed">
                  You may not use our Service:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                  <li>To upload or transmit viruses or any other type of malicious code</li>
                  <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">9. Service Availability and Modifications</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to withdraw or amend our Service, and any service or material we provide on the Service, in our sole discretion without notice. We will not be liable if for any reason all or any part of the Service is unavailable at any time or for any period. From time to time, we may restrict access to some parts of the Service, or the entire Service, to users, including registered users.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">10. Termination</h2>
              <p className="text-gray-300 leading-relaxed">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">11. Disclaimer of Warranties</h2>
              <p className="text-gray-300 leading-relaxed">
                The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions, and terms whether express, implied, or statutory. We do not warrant that the Service will be uninterrupted or error-free.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">12. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                In no event shall MusikMadness, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            {/* Section 13 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">13. Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which MusikMadness operates, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            {/* Section 14 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">14. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            {/* Section 15 */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">15. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/30">
                <p className="text-cyan-400">Email: musikmadnessofficial@gmail.com</p>
                <p className="text-cyan-400">Website: musikmadness.com</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
