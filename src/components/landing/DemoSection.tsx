import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, Maximize, Users, BarChart3, FileText } from 'lucide-react';

const DemoSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const demoTabs = [
    {
      id: 'dashboard',
      title: 'Analytics Dashboard',
      icon: BarChart3,
      description: 'Real-time insights and performance tracking',
    },
    {
      id: 'recording',
      title: 'Session Recording',
      icon: Play,
      description: 'High-quality video and audio capture',
    },
    {
      id: 'reports',
      title: 'AI Reports',
      icon: FileText,
      description: 'Automated detailed progress reports',
    },
  ];

  return (
    <section id="demo" className="py-24 bg-dark-900">
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
            <span className="bg-gradient-to-r from-primary-500 to-accent-emerald bg-clip-text text-transparent">
              See EduSync in Action
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience the power of our platform through interactive demos showcasing 
            real-world scenarios and features.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Demo Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {demoTabs.map((tab, index) => (
              <motion.div
                key={tab.id}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  activeTab === index
                    ? 'bg-primary-500/10 border-primary-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                onClick={() => setActiveTab(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    activeTab === index ? 'bg-primary-500/20' : 'bg-white/10'
                  }`}>
                    <tab.icon className={`h-6 w-6 ${
                      activeTab === index ? 'text-primary-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      activeTab === index ? 'text-primary-400' : 'text-white'
                    }`}>
                      {tab.title}
                    </h3>
                    <p className="text-gray-400">{tab.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Demo Display */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-dark-800 to-dark-700 rounded-3xl p-8 border border-white/10">
              {/* Mock Interface */}
              <div className="bg-dark-900 rounded-2xl p-6 border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-400">EduSync Dashboard</div>
                </div>

                {/* Content based on active tab */}
                {activeTab === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-primary-500/10 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-primary-400">87%</div>
                        <div className="text-sm text-gray-400">Engagement</div>
                      </div>
                      <div className="bg-accent-emerald/10 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-accent-emerald">12</div>
                        <div className="text-sm text-gray-400">Sessions</div>
                      </div>
                      <div className="bg-accent-amber/10 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-accent-amber">4.8</div>
                        <div className="text-sm text-gray-400">Rating</div>
                      </div>
                    </div>
                    <div className="h-32 bg-white/5 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-primary-500" />
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  <div className="space-y-4">
                    <div className="h-40 bg-white/5 rounded-xl flex items-center justify-center relative">
                      <Play className="h-16 w-16 text-primary-500" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Play className="h-4 w-4 text-white" />
                          <span className="text-sm text-gray-400">00:45 / 24:30</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Volume2 className="h-4 w-4 text-gray-400" />
                          <Maximize className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-primary-500" />
                        <span className="text-sm text-gray-400">2 participants</span>
                      </div>
                      <div className="text-sm text-accent-emerald">● Recording</div>
                    </div>
                  </div>
                )}

                {activeTab === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-sm text-gray-300">Session Summary</span>
                        <span className="text-xs text-primary-400">Generated</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-sm text-gray-300">Engagement Analysis</span>
                        <span className="text-xs text-accent-emerald">Ready</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-sm text-gray-300">Progress Report</span>
                        <span className="text-xs text-accent-amber">Processing</span>
                      </div>
                    </div>
                    <motion.button
                      className="w-full bg-gradient-to-r from-primary-500 to-accent-emerald text-white py-2 px-4 rounded-lg text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Send Report to Parent
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-accent-emerald/20 rounded-3xl blur-xl opacity-50"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;