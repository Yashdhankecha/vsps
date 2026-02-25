import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { Button } from '../index';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-premium text-gray-300 border-t-2 border-electric-600/30 relative overflow-hidden">
      {/* Subtle texture */}
      <div className="absolute inset-0 texture-diagonal opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-electric-900/20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">About VSPS</h3>
            <p className="text-gray-300 mb-4 leading-relaxed font-medium">
              Your premier platform for organizing and streaming community events. Connect, celebrate, and share moments that matter.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-electric-600 transition-colors duration-300">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-electric-600 transition-colors duration-300">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-electric-600 transition-colors duration-300">
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/services" className="text-gray-300 hover:text-electric-600 transition-colors duration-300">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-300 hover:text-electric-600 transition-colors duration-300">
                  Planning Resources
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-electric-600 transition-colors duration-300">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaPhone className="text-electric-600 mt-1 flex-shrink-0" />
                <span className="text-gray-300">8799038003</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaEnvelope className="text-electric-600 mt-1 flex-shrink-0" />
                <span className="text-gray-300 break-all">developerstripod@gmail.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-electric-600 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Vansol Patidar Samaj Sanskrutik Kendra,bhalej road</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-200 font-medium">© {currentYear} VSPS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;