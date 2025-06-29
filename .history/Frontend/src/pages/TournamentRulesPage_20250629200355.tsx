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
            
            {/* Essential Rules */}
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Essential Rules</h2>
              <div className="space-y-4">
                
                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">Your Submission</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li><strong>Submit your own work only</strong> - Original tracks, remixes, or covers you created</li>
                    <li>One submission per tournament</li>
                    <li>Must be publicly accessible on YouTube or SoundCloud</li>
                    <li>Keep your link active throughout the tournament</li>
                  </ul>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">Fair Play</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li><strong>No cheating</strong> - Don't create fake accounts or manipulate votes</li>
                    <li>Don't ask for votes outside the platform</li>
                    <li>Be respectful to other participants</li>
                    <li>Accept results gracefully</li>
                  </ul>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">What's Not Allowed</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Stolen or copied music</li>
                    <li>Hate speech or offensive content</li>
                    <li>Spam or low-effort submissions</li>
                    <li>Harassment of other users</li>
                  </ul>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">Consequences</h3>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Breaking rules = disqualification</li>
                    <li>Serious violations = platform ban</li>
                    <li>When in doubt, contact support</li>
                  </ul>
                </div>

              </div>
            </section>

            {/* Bottom line */}
            <section className="text-center">
              <div className="bg-gradient-to-r from-cyan-500/10 to-pink-500/10 p-8 rounded-lg border border-cyan-500/20">
                <h2 className="text-xl font-semibold text-white mb-4">Keep It Simple</h2>
                <p className="text-gray-300 mb-4 text-lg">
                  <strong>Submit your own music</strong> • <strong>Be respectful</strong> • <strong>Don't cheat</strong>
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Have questions? Contact our support team.
                </p>
                <div className="space-y-2">
                  <p className="text-cyan-400">Email: musikmadnessofficial@gmail.com</p>
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
