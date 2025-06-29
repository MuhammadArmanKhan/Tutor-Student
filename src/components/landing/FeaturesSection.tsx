import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Video, 
  BarChart3, 
  Mail, 
  Shield, 
  Zap,
  Users,
  FileText,
  Clock
} from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analytics',
      description: 'Advanced AI insights track student engagement, learning patterns, and provide personalized recommendations.',
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/10',
    },
    {
      icon: Video,
      title: 'Session Recording',
      description: 'Automatic recording of all sessions with high-quality audio and screen capture for review and analysis.',
      color: 'text-accent-emerald',
      bgColor: 'bg-accent-emerald/10',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Live dashboard with engagement metrics, performance tracking, and comprehensive progress reports.',
      color: 'text-accent-amber',
      bgColor: 'bg-accent-amber/10',
    },
    {
      icon: FileText,
      title: 'Auto Transcription',
      description: 'AI-powered transcription with speaker identification and searchable session content.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      icon: Mail,
      title: 'Automated Reports',
      description: 'Detailed PDF reports automatically generated and sent to parents after each session.',
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with encrypted storage and COPPA-compliant privacy protection.',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
  ];

  return (
    <section id="features" className="py-24 bg-dark-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Powerful Features for
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-500 to-accent-emerald bg-clip-text text-transparent">
              Modern Education
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to deliver exceptional online learning experiences with 
            cutting-edge technology and intelligent insights.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-6`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-primary-400 transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-emerald/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-2 text-primary-400 mb-4">
            <Zap className="h-5 w-5" />
            <span className="font-medium">Ready to get started?</span>
          </div>
          <motion.button
            className="bg-gradient-to-r from-primary-500 to-accent-emerald text-white px-8 py-3 rounded-full font-semibold hover:shadow-2xl hover:shadow-primary-500/25 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Features
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;