import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import logoImage from '../assets/images/image_transparent.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900/40 backdrop-blur-sm text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src={logoImage} 
                alt="MusikMadness" 
                className="h-50 w-40"
              />
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-blue-400 transition duration-150">Home</Link></li>
              <li><Link to="/tournaments" className="text-gray-300 hover:text-blue-400 transition duration-150">Tournaments</Link></li>
              <li><Link to="/create-tournament" className="text-gray-300 hover:text-blue-400 transition duration-150">Create Tournament</Link></li>
              <li><Link to="/profile" className="text-gray-300 hover:text-blue-400 transition duration-150">Profile</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-300 hover:text-pink-400 transition duration-150">FAQ</Link></li>
              <li><Link to="/rules" className="text-gray-300 hover:text-pink-400 transition duration-150">Tournament Rules</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-pink-400 transition duration-150">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-pink-400 transition duration-150">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition duration-150">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition duration-150">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition duration-150">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition duration-150">
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-300 text-sm">
              Subscribe to our newsletter for the latest updates.
            </p>
            <div className="mt-2 flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-800/50 text-gray-200 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow border border-white/10"
              />
              <button className="bg-gradient-to-r from-blue-500/80 to-pink-500/80 hover:from-blue-500 hover:to-pink-500 px-4 py-2 rounded-r-md font-medium transition-all duration-300">
                Join
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-12 pt-8 text-center text-gray-400/80 text-sm">
          <p>&copy; {new Date().getFullYear()} MusikMadness. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;