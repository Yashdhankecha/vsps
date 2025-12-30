import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { Button } from '../index';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-neutral-300 border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">About VSPS</h3>
            <p className="text-neutral-400 mb-4 leading-relaxed">
              Your premier platform for organizing and streaming community events. Connect, celebrate, and share moments that matter.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/services" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                  Planning Resources
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
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
                <FaPhone className="text-electric-400 mt-1 flex-shrink-0" />
                <span className="text-neutral-300">8799038003</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaEnvelope className="text-electric-400 mt-1 flex-shrink-0" />
                <span className="text-neutral-300 break-all">developerstripod@gmail.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-electric-400 mt-1 flex-shrink-0" />
                <span className="text-neutral-300">Vansol Patidar Samaj Sanskrutik Kendra,bhalej road</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400">© {currentYear} VSPS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;