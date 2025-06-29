import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Award, BookOpen, DollarSign, Save, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface TutorProfile {
  id?: string;
  certifications: string[];
  subjects: string[];
  bio: string;
  hourly_rate: number;
  experience_years: number;
}

const TutorProfileManager: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TutorProfile>({
    certifications: [],
    subjects: [],
    bio: '',
    hourly_rate: 0,
    experience_years: 0
  });
  const [loading, setLoading] = useState(false);
  const [newCertification, setNewCertification] = useState('');
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const profileData = {
        user_id: user?.id,
        ...profile,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('tutor_profiles')
        .upsert(profileData);

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addSubject = () => {
    if (newSubject.trim()) {
      setProfile(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()]
      }));
      setNewSubject('');
    }
  };

  const removeSubject = (index: number) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500/10 to-accent-emerald/10 rounded-2xl p-6 border border-primary-500/20">
        <h2 className="text-2xl font-bold text-white mb-2">Profile Management</h2>
        <p className="text-gray-400">
          Update your professional information to attract more students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Basic Information
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 resize-none"
                placeholder="Tell students about your teaching experience and approach..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={profile.hourly_rate}
                  onChange={(e) => setProfile(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                  placeholder="50"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={profile.experience_years}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience_years: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Certifications
          </h3>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                placeholder="Add certification..."
              />
              <motion.button
                onClick={addCertification}
                className="px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200 flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {profile.certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <span className="text-white text-sm flex-1 mr-2">{cert}</span>
                  <button
                    onClick={() => removeCertification(index)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-200 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
              {profile.certifications.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No certifications added yet</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Subjects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Subjects Taught
          </h3>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                placeholder="Add subject..."
              />
              <motion.button
                onClick={addSubject}
                className="px-4 py-3 bg-accent-emerald text-white rounded-xl hover:bg-accent-emerald/80 transition-colors duration-200 flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {profile.subjects.map((subject, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-accent-emerald/20 text-accent-emerald rounded-full text-sm border border-accent-emerald/30"
                >
                  <span>{subject}</span>
                  <button
                    onClick={() => removeSubject(index)}
                    className="hover:text-red-400 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
              {profile.subjects.length === 0 && (
                <div className="w-full text-center py-8 text-gray-400">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No subjects added yet</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <motion.button
            onClick={saveProfile}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-accent-emerald text-white py-4 px-6 rounded-xl font-semibold hover:shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Profile</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TutorProfileManager;