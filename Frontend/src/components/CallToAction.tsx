import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="backdrop-blur-sm bg-black/30 p-8 rounded-2xl border border-gray-800/40">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Ready to Showcase Your Musical Talent?</h2>
          <p className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto text-blue-100">
            Join thousands of musicians who are comp eting, connecting, and growing their careers through MusikMadness tournaments.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/register"
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out text-center flex items-center justify-center"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/tournaments"
              className="bg-blue-800 text-white hover:bg-blue-700 font-medium py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out text-center"
            >
              Browse Tournaments
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-blue-200">
            No credit card required. Get started in minutes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;