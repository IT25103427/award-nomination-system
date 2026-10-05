import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Bell, Check, Trash2, CheckCheck, Clock } from 'lucide-react';

export const NotificationsPage = ({ setGlobalToast }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/my');
      setNotifications(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      if (setGlobalToast) setGlobalToast({ message: 'All notifications marked as read', type: 'success' });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
      if (setGlobalToast) setGlobalToast({ message: 'Notification deleted', type: 'success' });
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete notification');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Automated alerts for registration confirmation, nomination progress, voting updates, and outcomes
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllRead}
            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 max-w-md mx-auto">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">Your inbox is clear</p>
          <p className="text-xs text-slate-400 mt-1">You will receive notifications on key award lifecycle events.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                n.read ? 'bg-white' : 'bg-brand-50/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded">
                    {n.type.replace(/_/g, ' ')}
                  </span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                  {n.message}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Admin delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
