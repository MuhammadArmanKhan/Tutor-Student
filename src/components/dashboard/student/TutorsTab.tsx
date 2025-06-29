import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Calendar, Search, Filter, Award, Clock, BookOpen } from 'lucide-react';

const TutorsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const tutors = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      subjects: ['Mathematics', 'Statistics'],
      rating: 4.9,
      totalSessions: 24,
      hourlyRate: 75,
      experience: '8 years',
      bio: 'PhD in Mathematics with extensive experience in calculus and advanced mathematics.',
      certifications: ['PhD Mathematics', 'Teaching Certificate'],
      nextAvailable: 'Today 3:00 PM',
      responseTime: '< 1 hour',
      languages: ['English', 'Spanish']
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      subjects: ['Physics', 'Engineering'],
      rating: 4.8,
      totalSessions: 18,
      hourlyRate: 80,
      experience: '12 years',
      bio: 'Professor of Physics specializing in quantum mechanics and theoretical physics.',
      certifications: ['PhD Physics', 'University Professor'],
      nextAvailable: 'Tomorrow 10:00 AM',
      responseTime: '< 2 hours',
      languages: ['English', 'Mandarin']
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      subjects: ['Chemistry', 'Biology'],
      rating: 4.7,
      totalSessions: 22,
      hourlyRate: 70,
      experience: '6 years',
      bio: 'Chemistry PhD with expertise in organic chemistry and biochemistry.',
      certifications: ['PhD Chemistry', 'Research Scientist'],
      nextAvailable: 'Today 6:00 PM',
      responseTime: '< 30 min',
      languages: ['English', 'French']
    }
  ];

  const subjects = ['all', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Statistics'];

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = subjectFilter === 'all' || tutor.subjects.includes(subjectFilter);
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tutors..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors duration-200"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject} className="bg-dark-800 text-white">
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTutors.map((tutor, index) => (
          <motion.div
            key={tutor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            {/* Tutor Header */}
            <div className="flex items-start space-x-4 mb-4">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">{tutor.name}</h3>
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-medium">{tutor.rating}</span>
                  <span className="text-gray-400 text-sm">({tutor.totalSessions} sessions)</span>
                </div>
                <div className="text-primary-500 font-semibold">${tutor.hourlyRate}/hour</div>
              </div>
            </div>

            {/* Subjects */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((subject, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{tutor.bio}</p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Award className="h-4 w-4 text-accent-emerald" />
                  <span className="text-white font-medium text-sm">{tutor.experience}</span>
                </div>
                <div className="text-xs text-gray-400">Experience</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Clock className="h-4 w-4 text-accent-amber" />
                  <span className="text-white font-medium text-sm">{tutor.responseTime}</span>
                </div>
                <div className="text-xs text-gray-400">Response</div>
              </div>
            </div>

            {/* Availability */}
            <div className="mb-4 p-3 bg-accent-emerald/10 rounded-lg border border-accent-emerald/20">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-accent-emerald" />
                <span className="text-accent-emerald text-sm font-medium">Next Available:</span>
              </div>
              <div className="text-white text-sm mt-1">{tutor.nextAvailable}</div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <motion.button
                className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors duration-200 text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Book Session
              </motion.button>
              <motion.button
                className="p-2 bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Send Message"
              >
                <MessageCircle className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTutors.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Tutors Found</h3>
          <p className="text-gray-400">
            {searchTerm ? 'No tutors match your search criteria.' : 'No tutors available for the selected subject.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TutorsTab;