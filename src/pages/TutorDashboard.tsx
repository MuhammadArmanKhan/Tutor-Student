import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import TabNavigation from '../components/dashboard/TabNavigation';
import TutorOverviewTab from '../components/dashboard/tutor/TutorOverviewTab';
import StudentManager from '../components/students/StudentManager';
import RecentSessions from '../components/dashboard/RecentSessions';
import TutorProfileManager from '../components/profile/TutorProfileManager';
import SessionScheduler from '../components/scheduling/SessionScheduler';
import AdvancedAnalyticsDashboard from '../components/analytics/AdvancedAnalyticsDashboard';
import { Home, Users, Video, BarChart3, Settings, Calendar, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TutorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (user.role !== 'tutor') {
        navigate(user.role === 'student' ? '/student-dashboard' : '/auth');
      }
    }
  }, [user, loading, navigate]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'students', label: 'Students', icon: Users, count: 28 },
    { id: 'sessions', label: 'Sessions', icon: Video, count: 5 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'messages', label: 'Messages', icon: MessageCircle, count: 3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TutorOverviewTab />;
      case 'students':
        return <StudentManager />;
      case 'sessions':
        return <RecentSessions />;
      case 'schedule':
        return <SessionScheduler />;
      case 'analytics':
        return <AdvancedAnalyticsDashboard />;
      case 'profile':
        return <TutorProfileManager />;
      case 'messages':
        return <div className="text-center py-12 text-gray-400">Messaging system coming soon...</div>;
      case 'settings':
        return <div className="text-center py-12 text-gray-400">Settings panel coming soon...</div>;
      default:
        return <TutorOverviewTab />;
    }
  };

  return (
    <DashboardLayout title="Tutor Dashboard" role="tutor">
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

export default TutorDashboard;