import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderPlus,
  Send,
  FileText,
  CheckSquare,
  Vote,
  History,
  ShieldCheck,
  Calendar,
  Award,
  BarChart3,
  Users,
  Search,
  Bell
} from 'lucide-react';

export const Sidebar = ({ currentView, setCurrentView, isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'categories', label: 'Award Categories', icon: FolderPlus },
          { id: 'approval-queue', label: 'Review Queue & Spam Removal', icon: CheckSquare },
          { id: 'voting-booth', label: 'Voting Ballot', icon: Vote },
          { id: 'voting-periods', label: 'Voting Windows', icon: Calendar },
          { id: 'results-audit', label: 'Results & Tallies', icon: ShieldCheck },
          { id: 'user-management', label: 'User Directory', icon: Users },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];

      case 'NOMINATOR':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'submit-nomination', label: 'Submit Nomination', icon: Send },
          { id: 'my-nominations', label: 'My Submissions', icon: FileText },
          { id: 'public-winners', label: 'Announced Winners', icon: Award },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];

      case 'COMMITTEE_MEMBER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'approval-queue', label: 'Nomination Review Queue', icon: CheckSquare },
          { id: 'public-winners', label: 'Announced Winners', icon: Award },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];

      case 'VOTER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'voting-booth', label: 'Vote For Finalists', icon: Vote },
          { id: 'my-votes', label: 'My Ballot History', icon: History },
          { id: 'public-winners', label: 'Announced Winners', icon: Award },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];

      case 'RESULTS_OFFICER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'results-audit', label: 'Audit & Verify Tallies', icon: ShieldCheck },
          { id: 'public-winners', label: 'Announced Winners', icon: Award },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];

      case 'PROGRAM_MANAGER':
        return [
          { id: 'dashboard', label: 'Process Overview & Stats', icon: LayoutDashboard },
          { id: 'voting-periods', label: 'Manage Voting Dates', icon: Calendar },
          { id: 'manager-publish', label: 'Publish Final Winners', icon: Award },
          { id: 'approval-queue', label: 'Nominations Oversight', icon: FileText },
          { id: 'reports', label: 'Generate Reports', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];

      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'public-lookup', label: 'Reference Lookup', icon: Search },
          { id: 'public-winners', label: 'Winners Gallery', icon: Award },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col justify-between p-4 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Module Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Public Quick Tools */}
          <div className="border-t border-slate-100 pt-4 space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Public Tools
            </div>
            <button
              onClick={() => {
                setCurrentView('public-lookup');
                if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentView === 'public-lookup' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Public Tracking Lookup
            </button>
            <button
              onClick={() => {
                setCurrentView('public-winners');
                if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentView === 'public-winners' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-gold-500" />
              Official Winners Gallery
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
