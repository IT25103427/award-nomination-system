import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Bell, User, LogOut, Award, Search, Menu, X, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const Navbar = ({ onToggleSidebar, sidebarOpen, currentView, setCurrentView }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/my');
      const list = res.data.data || [];
      const unread = list.filter((n) => !n.read).length;
      setUnreadCount(unread);
      setRecentNotifications(list.slice(0, 5));
    } catch (e) {
      // ignore
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'NOMINATOR': return 'Nominator';
      case 'COMMITTEE_MEMBER': return 'Committee Member';
      case 'VOTER': return 'Voter';
      case 'RESULTS_OFFICER': return 'Verification Officer';
      case 'PROGRAM_MANAGER': return 'Program Manager';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Hamburger (for mobile/sidebar) + Logo */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
            <button
              onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5 text-gold-300" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight block leading-none">
                  Aura<span className="text-brand-600">Awards</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase block mt-0.5">
                  Nomination & Voting Portal
                </span>
              </div>
            </button>
          </div>

          {/* Center Links (Public or Navigation) */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setCurrentView('public-lookup')}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                currentView === 'public-lookup' ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              <Search className="w-4 h-4" />
              Status Lookup
            </button>
            <button
              onClick={() => setCurrentView('public-winners')}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                currentView === 'public-winners' ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              <Award className="w-4 h-4 text-gold-500" />
              Announced Winners
            </button>
          </div>

          {/* Right: User Profile or Sign In */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <span className="font-semibold text-sm text-slate-800">Notifications</span>
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            setCurrentView('notifications');
                          }}
                          className="text-xs text-brand-600 hover:underline"
                        >
                          View All
                        </button>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {recentNotifications.length === 0 ? (
                          <p className="p-4 text-xs text-slate-400 text-center">No notifications yet</p>
                        ) : (
                          recentNotifications.map((n) => (
                            <div key={n.id} className={`p-3 text-xs ${n.read ? 'bg-white' : 'bg-brand-50/50'}`}>
                              <p className="text-slate-700 leading-snug">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Role Badge */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-900">{user?.fullName}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    {getRoleLabel(user?.role)}
                  </span>
                </div>

                {/* Profile Avatar & Logout */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                    title="My Profile"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all hover:shadow-brand-200"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
