import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import logoImage from '../assets/images/image_transparent.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900/40 backdrop-blur-sm text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-1 order-last sm:order-first">
            <div className="flex items-center justify-center sm:justify-start mt-[-2rem] md:mt-[-3rem] pt-0">
              <img 
                src={logoImage} 
                alt="MusikMadness" 
                className="h-32 md:h-50"
              />
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 md:space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-blue-400 transition duration-150 text-sm md:text-base">Home</Link></li>
              <li><Link to="/tournaments" className="text-gray-300 hover:text-blue-400 transition duration-150 text-sm md:text-base">Tournaments</Link></li>
              <li><Link to="/create-tournament" className="text-gray-300 hover:text-blue-400 transition duration-150 text-sm md:text-base">Create Tournament</Link></li>
              <li><Link to="/profile" className="text-gray-300 hover:text-blue-400 transition duration-150 text-sm md:text-base">Profile</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Resources</h3>
            <ul className="space-y-1.5 md:space-y-2">
              <li><Link to="/faq" className="text-gray-300 hover:text-pink-400 transition duration-150 text-sm md:text-base">FAQ</Link></li>
              <li><Link to="/rules" className="text-gray-300 hover:text-pink-400 transition duration-150 text-sm md:text-base">Tournament Rules</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-pink-400 transition duration-150 text-sm md:text-base">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-pink-400 transition duration-150 text-sm md:text-base">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Connect With Us</h3>
            <div className="flex space-x-3 md:space-x-4 mb-3 md:mb-4">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition duration-150">
                <Facebook className="h-4 w-4 md:h-5 md:w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition duration-150">
                <Twitter className="h-4 w-4 md:h-5 md:w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition duration-150">
                <Instagram className="h-4 w-4 md:h-5 md:w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition duration-150">
                <Mail className="h-4 w-4 md:h-5 md:w-5" />
              </a>
            </div>
            <p className="text-gray-300 text-xs md:text-sm mb-2 md:mb-0">
              Subscribe to our newsletter for the latest updates.
            </p>
            <div className="mt-2 flex flex-col sm:flex-row">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-800/50 text-gray-200 px-3 md:px-4 py-2 rounded-md sm:rounded-l-md sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow border border-white/10 text-sm md:text-base mb-2 sm:mb-0"
              />
              <button className="bg-gradient-to-r from-blue-500/80 to-pink-500/80 hover:from-blue-500 hover:to-pink-500 px-3 md:px-4 py-2 rounded-md sm:rounded-l-none sm:rounded-r-md font-medium transition-all duration-300 text-sm md:text-base">
                Join
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-8 md:mt-12 pt-6 md:pt-8 text-center text-gray-400/80 text-xs md:text-sm">
          <p>&copy; {new Date().getFullYear()} MusikMadness. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;