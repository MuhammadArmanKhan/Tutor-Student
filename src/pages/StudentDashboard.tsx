import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import TabNavigation from '../components/dashboard/TabNavigation';
import OverviewTab from '../components/dashboard/student/OverviewTab';
import SessionsTab from '../components/dashboard/student/SessionsTab';
import TutorsTab from '../components/dashboard/student/TutorsTab';
import AnalyticsTab from '../components/dashboard/student/AnalyticsTab';
import StudentProgressDashboard from '../components/analytics/StudentProgressDashboard';
import SettingsPanel from '../components/profile/SettingsPanel';
import StudentProfileManager from '../components/profile/StudentProfileManager';
import { Home, Video, Users, BarChart3, Settings, TrendingUp, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (user.role !== 'student') {
        navigate(user.role === 'tutor' ? '/tutor-dashboard' : '/auth');
      }
    }
  }, [user, loading, navigate]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'sessions', label: 'Sessions', icon: Video, count: 12 },
    { id: 'tutors', label: 'My Tutors', icon: Users, count: 3 },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'sessions':
        return <SessionsTab />;
      case 'tutors':
        return <TutorsTab />;
      case 'progress':
        return <StudentProgressDashboard />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'profile':
        return <StudentProfileManager />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <DashboardLayout title="Student Dashboard" role="student">
      <div className="space-y-6">
        <TabNavigation 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        {renderTabContent()}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;