import React from 'react';

const TournamentRulesPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl bg-black/20 border border-white/5 backdrop-blur-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
        
        <div className="py-8 px-6 md:px-12">
          {/* Title section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-crashbow text-white tracking-wider mb-2">Tournament Rules</h1>
            <p className="text-gray-400">Official rules and guidelines for MusikMadness tournaments</p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            
            {/* General Rules */}
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-6">General Tournament Rules</h2>
              <div className="space-y-4">
                
                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">1. Eligibility</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>All registered MusikMadness users are eligible to participate</li>
                    <li>Participants must be at least 13 years old</li>
                    <li>One submission per participant per tournament</li>
                    <li>Multiple tournament participation is allowed</li>
                  </ul>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">2. Registration & Submission</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Registration must be completed before the tournament deadline</li>
                    <li>Submissions must be made through approved streaming platforms</li>
                    <li>All submission links must be publicly accessible</li>
                    <li>Late submissions will not be accepted</li>
                    <li>Submissions cannot be changed once the tournament begins</li>
                  </ul>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">3. Content Requirements</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Tracks must comply with the tournament's genre specifications</li>
                    <li>Original compositions and official remixes are allowed</li>
                    <li>Cover songs are permitted unless specifically prohibited</li>
                    <li>AI-generated music must be clearly disclosed</li>
                    <li>Copyrighted material without proper licensing is prohibited</li>
                  </ul>
                </div>

              </div>
            </section>

            {/* Voting Rules */}
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Voting & Competition</h2>
              <div className="space-y-4">
                
                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">4. Voting Process</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Voting is open to all registered users except tournament participants</li>
                    <li>One vote per user per matchup</li>
                    <li>Votes cannot be changed once submitted</li>
                    <li>Voting periods are clearly announced and strictly enforced</li>
                    <li>Self-voting and vote manipulation are strictly prohibited</li>
                  </ul>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">5. Fair Play</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Vote brigading through external platforms is prohibited</li>
                    <li>Creating multiple accounts to vote is not allowed</li>
                    <li>Offering incentives for votes is strictly forbidden</li>
                    <li>Harassment of other participants will result in disqualification</li>
                    <li>All participants must respect the community guidelines</li>
                  </ul>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">6. Bracket Progression</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Winners are determined by majority vote in each matchup</li>
                    <li>In case of ties, tournament organizers make the final decision</li>
                    <li>Byes are assigned randomly when tournament size is not a power of 2</li>
                    <li>Advancement rounds follow standard elimination format</li>
                    <li>Tournament organizers reserve the right to adjust brackets if needed</li>
                  </ul>
                </div>

              </div>
            </section>

            {/* Content Guidelines */}
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Content Guidelines</h2>
              <div className="space-y-4">
                
                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">7. Prohibited Content</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Explicit sexual content or pornographic material</li>
                    <li>Hate speech, discriminatory, or inflammatory content</li>
                    <li>Violence-promoting or disturbing audio content</li>
                    <li>Copyrighted material without proper licensing</li>
                    <li>Spam, duplicate, or low-effort submissions</li>
                  </ul>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">8. Platform Requirements</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>YouTube: Public videos with embedding enabled</li>
                    <li>SoundCloud: Public tracks with sharing enabled</li>
                    <li>Spotify: Available tracks in supported regions</li>
                    <li>All links must remain active throughout the tournament</li>
                    <li>Broken links may result in automatic disqualification</li>
                  </ul>
                </div>

              </div>
            </section>

            {/* Enforcement */}
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Rule Enforcement</h2>
              <div className="space-y-4">
                
                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">9. Violations & Penalties</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Minor violations may result in warnings or point deductions</li>
                    <li>Serious violations result in immediate disqualification</li>
                    <li>Repeated offenses may lead to permanent platform bans</li>
                    <li>Vote manipulation results in automatic tournament ban</li>
                    <li>Appeals can be submitted to tournament organizers</li>
                  </ul>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">10. Reporting & Appeals</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Rule violations can be reported through the platform</li>
                    <li>All reports are reviewed by tournament moderators</li>
                    <li>Appeals must be submitted within 48 hours of a decision</li>
                    <li>Final decisions rest with MusikMadness administrators</li>
                    <li>False reporting may result in penalties for the reporter</li>
                  </ul>
                </div>

              </div>
            </section>

            {/* Tournament Creator Rules */}
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Tournament Creator Guidelines</h2>
              <div className="space-y-4">
                
                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">11. Creator Responsibilities</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Clearly define tournament rules and requirements</li>
                    <li>Respond to participant questions and concerns</li>
                    <li>Monitor tournaments for rule violations</li>
                    <li>Make fair and unbiased decisions in disputes</li>
                    <li>Ensure tournaments run according to schedule</li>
                  </ul>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">12. Creator Restrictions</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Cannot participate in their own tournaments</li>
                    <li>Must remain neutral in all tournament matters</li>
                    <li>Cannot influence voting or show favoritism</li>
                    <li>Must respect all platform community guidelines</li>
                    <li>Failure to maintain standards may result in creator privilege revocation</li>
                  </ul>
                </div>

              </div>
            </section>

            {/* Contact */}
            <section className="text-center">
              <div className="bg-gradient-to-r from-cyan-500/10 to-pink-500/10 p-8 rounded-lg border border-cyan-500/20">
                <h2 className="text-xl font-semibold text-white mb-4">Questions about the rules?</h2>
                <p className="text-gray-300 mb-4">
                  If you need clarification on any tournament rules or want to report a violation, contact our support team.
                </p>
                <div className="space-y-2">
                  <p className="text-cyan-400">Email: musikmadnessofficial@gmail.com</p>
                  <p className="text-gray-400">Rule updates will be announced on the platform</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentRulesPage;
