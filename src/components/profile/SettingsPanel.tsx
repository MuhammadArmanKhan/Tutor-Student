import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SettingsPanel: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
    notifications_email: true,
    notifications_push: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Load notification preferences from user (if present)
  useEffect(() => {
    if (user && (user as any).notification_preferences) {
      setForm(prev => ({
        ...prev,
        notifications_email: (user as any).notification_preferences.email ?? true,
        notifications_push: (user as any).notification_preferences.push ?? false,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      await updateUser({
        name: form.name,
        email: form.email,
        avatar_url: form.avatar_url
      });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Save notification preferences to Supabase
  const handlePreferencesSave = async () => {
    setSavingPreferences(true);
    try {
      await updateUser({
        ...( {
          notification_preferences: {
            email: form.notifications_email,
            push: form.notifications_push
          }
        } as any )
      });
      toast.success('Preferences updated!');
    } catch (err) {
      toast.error('Failed to update preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  // Simulate password change
  const handlePasswordChange = () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed! (Simulated)');
    setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-dark-800 rounded-2xl shadow-lg space-y-8">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      {/* Profile Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Profile</h3>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="input input-bordered bg-dark-900 text-white focus:ring-2 focus:ring-primary-500"
            aria-label="Name"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="input input-bordered bg-dark-900 text-white focus:ring-2 focus:ring-primary-500"
            aria-label="Email"
          />
          <input
            type="text"
            name="avatar_url"
            value={form.avatar_url}
            onChange={handleChange}
            placeholder="Avatar URL"
            className="input input-bordered bg-dark-900 text-white focus:ring-2 focus:ring-primary-500"
            aria-label="Avatar URL"
          />
          <button
            onClick={handleProfileSave}
            className="btn btn-primary w-fit focus:ring-2 focus:ring-primary-500"
            disabled={loading}
            aria-label="Save Profile"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
      {/* Preferences Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notification Preferences</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="notifications_email"
              checked={form.notifications_email}
              onChange={handleChange}
              className="checkbox focus:ring-2 focus:ring-primary-500"
              aria-label="Email Notifications"
            />
            Email Notifications
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="notifications_push"
              checked={form.notifications_push}
              onChange={handleChange}
              className="checkbox focus:ring-2 focus:ring-primary-500"
              aria-label="Push Notifications"
            />
            Push Notifications
          </label>
          <button
            onClick={handlePreferencesSave}
            className="btn btn-secondary w-fit focus:ring-2 focus:ring-secondary"
            disabled={savingPreferences}
            aria-label="Save Preferences"
          >
            {savingPreferences ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
      {/* Password Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Change Password</h3>
        <div className="flex flex-col gap-4">
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Current Password"
            className="input input-bordered bg-dark-900 text-white focus:ring-2 focus:ring-accent-emerald"
            aria-label="Current Password"
          />
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="New Password"
            className="input input-bordered bg-dark-900 text-white focus:ring-2 focus:ring-accent-emerald"
            aria-label="New Password"
          />
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm New Password"
            className="input input-bordered bg-dark-900 text-white focus:ring-2 focus:ring-accent-emerald"
            aria-label="Confirm New Password"
          />
          <button
            onClick={handlePasswordChange}
            className="btn btn-accent w-fit focus:ring-2 focus:ring-accent-emerald"
            aria-label="Change Password"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 