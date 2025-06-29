import React from 'react';

const FAQPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl bg-black/20 border border-white/5 backdrop-blur-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
        
        <div className="py-8 px-6 md:px-12">
          {/* Title section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-crashbow text-white tracking-wider mb-2">Frequently Asked Questions</h1>
            <p className="text-gray-400">Everything you need to know about MusikMadness</p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            
            {/* General Questions */}
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-6">General Questions</h2>
              <div className="space-y-6">
                
                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">What is MusikMadness?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    MusikMadness is a competitive music platform where artists and producers can showcase their talent through tournaments. Users submit their music tracks and compete in bracket-style tournaments with community voting.
                  </p>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">How do I get started?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Simply create an account, complete your profile, and start participating in tournaments! You can join existing tournaments or create your own if you're a verified creator.
                  </p>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">Is MusikMadness free to use?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Yes! MusikMadness is free to use. You can participate in tournaments, vote on submissions, and engage with the community at no cost.
                  </p>
                </div>

              </div>
            </section>

            {/* Tournament Questions */}
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Tournament Questions</h2>
              <div className="space-y-6">
                
                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">How do tournaments work?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Tournaments are bracket-style competitions where participants submit music tracks. The community votes on matchups, and winners advance through elimination rounds until a champion is crowned.
                  </p>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">What music formats are supported?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We support submissions from popular streaming platforms including YouTube, SoundCloud, and Spotify. Simply provide the link to your track on these platforms.
                  </p>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">Can I participate in multiple tournaments?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Absolutely! You can participate in as many tournaments as you'd like, as long as they're open for registration and you meet any specific requirements.
                  </p>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">How are winners determined?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Winners are determined through community voting. Users vote on head-to-head matchups, and the track with more votes advances to the next round.
                  </p>
                </div>

              </div>
            </section>

            {/* Account Questions */}
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Account & Profile</h2>
              <div className="space-y-6">
                
                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">How do I become a tournament creator?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    To create tournaments, you need to apply for creator status. Visit the "Become a Creator" page to submit your application and learn about the requirements.
                  </p>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">Can I change my username?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Currently, usernames cannot be changed after account creation. Please choose your username carefully during registration.
                  </p>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">How do I delete my account?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    To delete your account, please contact our support team at musikmadnessofficial@gmail.com. Note that this action is permanent and cannot be undone.
                  </p>
                </div>

              </div>
            </section>

            {/* Technical Questions */}
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Technical Support</h2>
              <div className="space-y-6">
                
                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">I'm having trouble uploading my track</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Make sure your track is publicly available on the streaming platform and that you're providing the correct URL. If issues persist, try refreshing the page or contact support.
                  </p>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">Why can't I vote on certain tournaments?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    You can only vote in tournaments where you're not a participant. This ensures fair and unbiased voting. You also need to be logged in to vote.
                  </p>
                </div>

                <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30">
                  <h3 className="text-lg font-medium text-white mb-3">The website isn't working properly</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Try clearing your browser cache and cookies, or try accessing the site from an incognito/private browsing window. If problems persist, contact our support team.
                  </p>
                </div>

              </div>
            </section>

            {/* Contact */}
            <section className="text-center">
              <div className="bg-gradient-to-r from-cyan-500/10 to-pink-500/10 p-8 rounded-lg border border-cyan-500/20">
                <h2 className="text-xl font-semibold text-white mb-4">Still have questions?</h2>
                <p className="text-gray-300 mb-4">
                  Can't find the answer you're looking for? Our support team is here to help!
                </p>
                <div className="space-y-2">
                  <p className="text-cyan-400">Email: support@musikmadness.com</p>
                  <p className="text-gray-400">We typically respond within 24 hours</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
