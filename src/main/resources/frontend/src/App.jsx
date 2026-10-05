import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Toast } from './components/common/Toast';

// Auth views
import { LoginPage } from './modules/auth/LoginPage';
import { RegisterPage } from './modules/auth/RegisterPage';
import { ForgotPasswordPage } from './modules/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './modules/auth/ResetPasswordPage';
import { ProfilePage } from './modules/auth/ProfilePage';

// Public views
import { PublicLookup } from './modules/public/PublicLookup';
import { PublicWinners } from './modules/public/PublicWinners';

// Core module views
import { Dashboard } from './modules/dashboard/Dashboard';
import { CategoryManager } from './modules/categories/CategoryManager';
import { SubmitNomination } from './modules/nominations/SubmitNomination';
import { MyNominations } from './modules/nominations/MyNominations';
import { ReviewQueue } from './modules/approval/ReviewQueue';
import { VotingBooth } from './modules/voting/VotingBooth';
import { MyVotes } from './modules/voting/MyVotes';
import { VotingPeriodManager } from './modules/voting/VotingPeriodManager';
import { ResultsOfficer } from './modules/results/ResultsOfficer';
import { ProgramManager } from './modules/results/ProgramManager';
import { NotificationsPage } from './modules/notifications/NotificationsPage';
import { ReportsManager } from './modules/reports/ReportsManager';
import { UserDirectory } from './modules/admin/UserDirectory';

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentView, setCurrentView] = useState(() => (isAuthenticated ? 'dashboard' : 'login'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalToast, setGlobalToast] = useState(null);
  const [resetCodeHolder, setResetCodeHolder] = useState('');

  // Auto-redirect on login/logout
  React.useEffect(() => {
    if (isAuthenticated) {
      if (['login', 'register', 'forgot-password', 'reset-password'].includes(currentView)) {
        setCurrentView('dashboard');
      }
    } else {
      if (!['public-lookup', 'public-winners', 'register', 'forgot-password', 'reset-password'].includes(currentView)) {
        setCurrentView('login');
      }
    }
  }, [isAuthenticated]);

  const renderCurrentView = () => {
    switch (currentView) {
      // Auth
      case 'login':
        return <LoginPage setCurrentView={setCurrentView} setGlobalToast={setGlobalToast} />;
      case 'register':
        return <RegisterPage setCurrentView={setCurrentView} setGlobalToast={setGlobalToast} />;
      case 'forgot-password':
        return <ForgotPasswordPage setCurrentView={setCurrentView} setResetCodeHolder={setResetCodeHolder} />;
      case 'reset-password':
        return <ResetPasswordPage setCurrentView={setCurrentView} initialToken={resetCodeHolder} setGlobalToast={setGlobalToast} />;
      case 'profile':
        return <ProfilePage setGlobalToast={setGlobalToast} />;

      // Public
      case 'public-lookup':
        return <PublicLookup setCurrentView={setCurrentView} />;
      case 'public-winners':
        return <PublicWinners />;

      // Dashboard
      case 'dashboard':
        return <Dashboard setCurrentView={setCurrentView} />;

      // Module 2: Categories
      case 'categories':
        return <CategoryManager setGlobalToast={setGlobalToast} />;

      // Module 3: Nominations
      case 'submit-nomination':
        return <SubmitNomination setCurrentView={setCurrentView} setGlobalToast={setGlobalToast} />;
      case 'my-nominations':
        return <MyNominations setCurrentView={setCurrentView} setGlobalToast={setGlobalToast} />;

      // Module 4: Approval
      case 'approval-queue':
        return <ReviewQueue setGlobalToast={setGlobalToast} />;

      // Module 5: Voting
      case 'voting-booth':
        return <VotingBooth setGlobalToast={setGlobalToast} />;
      case 'my-votes':
        return <MyVotes setCurrentView={setCurrentView} />;
      case 'voting-periods':
        return <VotingPeriodManager setGlobalToast={setGlobalToast} />;

      // Module 6: Results
      case 'results-audit':
        return <ResultsOfficer setGlobalToast={setGlobalToast} />;
      case 'manager-publish':
        return <ProgramManager setCurrentView={setCurrentView} setGlobalToast={setGlobalToast} />;

      // Module 7: Notifications & Reports
      case 'notifications':
        return <NotificationsPage setGlobalToast={setGlobalToast} />;
      case 'reports':
        if (user?.role !== 'PROGRAM_MANAGER') {
          return <Dashboard setCurrentView={setCurrentView} />;
        }
        return <ReportsManager setGlobalToast={setGlobalToast} />;

      // Admin user management
      case 'user-management':
        return <UserDirectory setGlobalToast={setGlobalToast} />;

      default:
        return <Dashboard setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Global Toast */}
      {globalToast && (
        <Toast
          message={globalToast.message}
          type={globalToast.type}
          onClose={() => setGlobalToast(null)}
        />
      )}

      {/* Main Body */}
      <div className="flex-1 flex">
        {/* Sidebar (shown if authenticated) */}
        {isAuthenticated && (
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Content Container */}
        <main
          className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 ${
            isAuthenticated ? 'lg:ml-64' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
