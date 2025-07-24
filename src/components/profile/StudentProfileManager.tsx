import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const StudentProfileManager: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>({
    grade_level: '',
    subjects_of_interest: [],
    learning_goals: [],
    age: '',
    school: '',
    emergency_contact: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
    // eslint-disable-next-line
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (data) {
        setProfile({
          ...data,
          emergency_contact: data.emergency_contact?.phone || '',
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const profileData = {
        ...profile,
        user_id: user?.id,
        emergency_contact: { phone: profile.emergency_contact },
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('student_profiles')
        .upsert(profileData);
      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSubject = () => {
    if (newSubject.trim()) {
      setProfile((prev: any) => ({
        ...prev,
        subjects_of_interest: [...(prev.subjects_of_interest || []), newSubject.trim()]
      }));
      setNewSubject('');
    }
  };

  const removeSubject = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      subjects_of_interest: prev.subjects_of_interest.filter((_: any, i: number) => i !== index)
    }));
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setProfile((prev: any) => ({
        ...prev,
        learning_goals: [...(prev.learning_goals || []), newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      learning_goals: prev.learning_goals.filter((_: any, i: number) => i !== index)
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-dark-800 rounded-2xl shadow-lg space-y-8">
      <h2 className="text-2xl font-bold mb-4">Student Profile</h2>
      <div className="space-y-4">
        <label className="block">
          <span className="text-gray-300">Grade Level</span>
          <input
            type="text"
            value={profile.grade_level}
            onChange={e => setProfile((prev: any) => ({ ...prev, grade_level: e.target.value }))}
            className="input input-bordered bg-dark-900 text-white w-full mt-1 focus:ring-2 focus:ring-primary-500"
            aria-label="Grade Level"
          />
        </label>
        <label className="block">
          <span className="text-gray-300">Age</span>
          <input
            type="number"
            value={profile.age}
            onChange={e => setProfile((prev: any) => ({ ...prev, age: e.target.value }))}
            className="input input-bordered bg-dark-900 text-white w-full mt-1 focus:ring-2 focus:ring-primary-500"
            aria-label="Age"
          />
        </label>
        <label className="block">
          <span className="text-gray-300">School</span>
          <input
            type="text"
            value={profile.school}
            onChange={e => setProfile((prev: any) => ({ ...prev, school: e.target.value }))}
            className="input input-bordered bg-dark-900 text-white w-full mt-1 focus:ring-2 focus:ring-primary-500"
            aria-label="School"
          />
        </label>
        <label className="block">
          <span className="text-gray-300">Emergency Contact (Phone)</span>
          <input
            type="text"
            value={profile.emergency_contact}
            onChange={e => setProfile((prev: any) => ({ ...prev, emergency_contact: e.target.value }))}
            className="input input-bordered bg-dark-900 text-white w-full mt-1 focus:ring-2 focus:ring-primary-500"
            aria-label="Emergency Contact Phone"
          />
        </label>
        <div>
          <span className="text-gray-300">Subjects of Interest</span>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              className="input input-bordered bg-dark-900 text-white flex-1 focus:ring-2 focus:ring-primary-500"
              placeholder="Add subject"
              aria-label="Add Subject"
            />
            <button onClick={addSubject} className="btn btn-primary focus:ring-2 focus:ring-primary-500" aria-label="Add Subject">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.subjects_of_interest?.length === 0 && (
              <span className="text-gray-400 text-sm">No subjects added yet.</span>
            )}
            {profile.subjects_of_interest?.map((subject: string, idx: number) => (
              <span key={idx} className="bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full flex items-center gap-1">
                {subject}
                <button onClick={() => removeSubject(idx)} className="ml-1 text-red-400 focus:ring-2 focus:ring-red-400" aria-label={`Remove subject ${subject}`}>&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-gray-300">Learning Goals</span>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              className="input input-bordered bg-dark-900 text-white flex-1 focus:ring-2 focus:ring-primary-500"
              placeholder="Add goal"
              aria-label="Add Goal"
            />
            <button onClick={addGoal} className="btn btn-primary focus:ring-2 focus:ring-primary-500" aria-label="Add Goal">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.learning_goals?.length === 0 && (
              <span className="text-gray-400 text-sm">No learning goals added yet.</span>
            )}
            {profile.learning_goals?.map((goal: string, idx: number) => (
              <span key={idx} className="bg-accent-emerald/10 text-accent-emerald px-3 py-1 rounded-full flex items-center gap-1">
                {goal}
                <button onClick={() => removeGoal(idx)} className="ml-1 text-red-400 focus:ring-2 focus:ring-red-400" aria-label={`Remove goal ${goal}`}>&times;</button>
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={saveProfile}
          className="btn btn-accent mt-4 focus:ring-2 focus:ring-accent-emerald"
          disabled={saving}
          aria-label="Save Profile"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default StudentProfileManager; 