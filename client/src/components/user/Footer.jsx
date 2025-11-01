import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { Button } from '../index';

function Footer() {
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Here you would integrate with your newsletter service
    console.log('Newsletter subscription:', email);
    setSubscriptionStatus('Thank you for subscribing!');
    setEmail('');
    setTimeout(() => setSubscriptionStatus(''), 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-neutral-300 border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">About VSPS</h3>
            <p className="text-neutral-400 mb-4 leading-relaxed">
              Your premier platform for organizing and streaming community events. Connect, celebrate, and share moments that matter.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                <FaYoutube size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/events/categories" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/live-streaming" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                  Live Streams
                </Link>
              </li>
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
                <span className="text-neutral-300">9106110380</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaEnvelope className="text-electric-400 mt-1 flex-shrink-0" />
                <span className="text-neutral-300 break-all">insanethunder.2103@gmail.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-electric-400 mt-1 flex-shrink-0" />
                <span className="text-neutral-300">vansol village Bhalej Road ,anand ,Gujarat 388001</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-neutral-400 mb-4 leading-relaxed">
              Subscribe to our newsletter for updates on events and features.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-neutral-800/50 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-electric-500 text-white placeholder-neutral-400 transition-all duration-300 font-medium"
                  required
                />
                {subscriptionStatus && (
                  <div className="absolute -bottom-6 left-0 text-sm text-green-400 animate-fade-in">
                    {subscriptionStatus}
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400">© {currentYear} VSPS. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-neutral-400 hover:text-electric-400 transition-colors duration-300">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;