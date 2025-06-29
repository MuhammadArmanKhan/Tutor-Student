import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Mail, BookOpen, TrendingUp, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  engagement_avg: number;
  total_sessions: number;
  last_session: string;
  avatar_url?: string;
}

const StudentManager: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (user?.role === 'tutor') {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_students')
        .select(`
          *,
          student:users!tutor_students_student_id_fkey(id, name, email, avatar_url)
        `)
        .eq('tutor_id', user?.id)
        .eq('status', 'active');

      if (error) throw error;

      // Get session data for each student
      const studentsWithMetrics = await Promise.all(
        data.map(async (item: any) => {
          const { data: sessions } = await supabase
            .from('sessions')
            .select('engagement_score, created_at')
            .eq('tutor_id', user?.id)
            .eq('student_id', item.student.id)
            .eq('status', 'completed');

          const avgEngagement = sessions && sessions.length > 0 
            ? sessions.reduce((sum: number, s: any) => sum + (s.engagement_score || 0), 0) / sessions.length
            : 0;
          
          const lastSession = sessions && sessions.length > 0 
            ? new Date(Math.max(...sessions.map((s: any) => new Date(s.created_at).getTime())))
            : null;

          return {
            id: item.student.id,
            name: item.student.name,
            email: item.student.email,
            avatar_url: item.student.avatar_url,
            subjects: [item.subject],
            engagement_avg: Math.round(avgEngagement),
            total_sessions: sessions?.length || 0,
            last_session: lastSession ? lastSession.toLocaleDateString() : 'Never'
          };
        })
      );

      setStudents(studentsWithMetrics);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async () => {
    if (!newStudent.email || !newStudent.subject) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Check if user exists
      let { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', newStudent.email)
        .single();

      let studentId;
      
      if (existingUser) {
        if (existingUser.role !== 'student') {
          toast.error('User exists but is not a student');
          return;
        }
        studentId = existingUser.id;
      } else {
        // Create new student user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: newStudent.email,
            name: newStudent.email.split('@')[0],
            role: 'student',
            profile_complete: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) throw createError;
        studentId = newUser.id;

        // Create student profile
        await supabase
          .from('student_profiles')
          .insert({
            user_id: studentId,
            grade_level: '',
            subjects_of_interest: [newStudent.subject],
            learning_goals: [],
            created_at: new Date().toISOString()
          });
      }

      // Check if association already exists
      const { data: existingAssociation } = await supabase
        .from('tutor_students')
        .select('id')
        .eq('tutor_id', user?.id)
        .eq('student_id', studentId)
        .eq('subject', newStudent.subject)
        .single();

      if (existingAssociation) {
        toast.error('Student is already associated with this subject');
        return;
      }

      // Add tutor-student association
      const { error: associationError } = await supabase
        .from('tutor_students')
        .insert({
          tutor_id: user?.id,
          student_id: studentId,
          subject: newStudent.subject,
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (associationError) throw associationError;

      // Send invitation email (using edge function)
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: newStudent.email,
            subject: `Invitation to join EduSync - ${newStudent.subject} tutoring`,
            html: `
              <h2>You've been invited to join EduSync!</h2>
              <p>Hello!</p>
              <p>${user?.name} has invited you to join their ${newStudent.subject} tutoring sessions on EduSync.</p>
              ${newStudent.message ? `<p><strong>Personal message:</strong> ${newStudent.message}</p>` : ''}
              <p>EduSync is an advanced online learning platform with AI-powered insights, session recording, and detailed progress tracking.</p>
              <a href="${window.location.origin}/auth" style="background: #00D4FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Accept Invitation</a>
              <p>Looking forward to your learning journey!</p>
            `
          }
        });
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast.success('Student invitation sent successfully!');
      setShowAddModal(false);
      setNewStudent({ email: '', subject: '', message: '' });
      loadStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    }
  };

  const removeStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('tutor_students')
        .update({ status: 'inactive' })
        .eq('tutor_id', user?.id)
        .eq('student_id', studentId);

      if (error) throw error;

      toast.success('Student removed successfully');
      loadStudents();
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Failed to remove student');
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (user?.role !== 'tutor') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Student Management</h2>
        <motion.button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-primary-500 to-accent-emerald text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2 w-full sm:w-auto justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <UserPlus className="h-5 w-5" />
          <span>Add Student</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
          placeholder="Search students by name, email, or subject..."
        />
      </div>

      {/* Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {student.avatar_url ? (
                  <img 
                    src={student.avatar_url} 
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-emerald rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-white truncate">{student.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{student.email}</p>
                </div>
              </div>
              <button
                onClick={() => removeStudent(student.id)}
                className="text-gray-400 hover:text-red-400 transition-colors duration-200 flex-shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span className="text-sm text-gray-300 truncate">
                  {student.subjects.join(', ')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-accent-emerald flex-shrink-0" />
                  <span className="text-sm text-gray-300">Engagement</span>
                </div>
                <span className={`text-sm font-medium ${
                  student.engagement_avg >= 80 ? 'text-accent-emerald' :
                  student.engagement_avg >= 60 ? 'text-accent-amber' : 'text-red-400'
                }`}>
                  {student.engagement_avg}%
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Sessions: {student.total_sessions}</span>
                <span className="truncate ml-2">Last: {student.last_session}</span>
              </div>
            </div>

            <motion.button
              className="w-full mt-4 bg-primary-500/20 text-primary-400 py-2 px-4 rounded-lg hover:bg-primary-500/30 transition-colors duration-200 text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Details
            </motion.button>
          </motion.div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Students Found</h3>
          <p className="text-gray-400 text-center">
            {searchTerm ? 'No students match your search criteria.' : 'Add your first student to get started.'}
          </p>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 rounded-2xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Add New Student</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Student Email *
                </label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newStudent.subject}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
                  placeholder="Mathematics, Physics, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={newStudent.message}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200 resize-none"
                  placeholder="Add a personal welcome message..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <motion.button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={addStudent}
                className="flex-1 bg-gradient-to-r from-primary-500 to-accent-emerald text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Invitation
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentManager;