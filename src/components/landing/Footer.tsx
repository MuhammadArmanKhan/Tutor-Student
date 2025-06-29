import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Mail, Phone, MapPin, Twitter, Github, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = {
    Product: [
      'Features',
      'Pricing',
      'Demo',
      'Security',
      'Integrations',
    ],
    Company: [
      'About Us',
      'Careers',
      'Press',
      'Blog',
      'Contact',
    ],
    Resources: [
      'Documentation',
      'Help Center',
      'Community',
      'Tutorials',
      'API Reference',
    ],
    Legal: [
      'Privacy Policy',
      'Terms of Service',
      'Cookie Policy',
      'COPPA Compliance',
      'Data Processing',
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-dark-800 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div 
              className="flex items-center space-x-2 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Brain className="h-8 w-8 text-primary-500" />
                <Sparkles className="h-4 w-4 text-accent-emerald absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-emerald bg-clip-text text-transparent">
                EduSync
              </span>
            </motion.div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Transforming online education with AI-powered insights, session recordings, 
              and real-time analytics for tutors, students, and parents.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>hello@edusync.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-gray-400 hover:text-primary-500" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href="#"
                      className="text-gray-400 hover:text-primary-500 transition-colors duration-200"
                      whileHover={{ x: 2 }}
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              © 2025 EduSync. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Made with ❤️ for educators worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;