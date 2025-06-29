import React, { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import TabNavigation from '../components/dashboard/TabNavigation';
import OverviewTab from '../components/dashboard/student/OverviewTab';
import SessionsTab from '../components/dashboard/student/SessionsTab';
import TutorsTab from '../components/dashboard/student/TutorsTab';
import AnalyticsTab from '../components/dashboard/student/AnalyticsTab';
import { Home, Video, Users, BarChart3, Settings, Calendar, MessageCircle } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'sessions', label: 'Sessions', icon: Video, count: 12 },
    { id: 'tutors', label: 'My Tutors', icon: Users, count: 3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageCircle, count: 2 },
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
      case 'analytics':
        return <AnalyticsTab />;
      case 'schedule':
        return <div className="text-center py-12 text-gray-400">Schedule management coming soon...</div>;
      case 'messages':
        return <div className="text-center py-12 text-gray-400">Messaging system coming soon...</div>;
      case 'settings':
        return <div className="text-center py-12 text-gray-400">Settings panel coming soon...</div>;
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