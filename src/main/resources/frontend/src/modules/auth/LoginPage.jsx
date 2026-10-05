import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Lock, User, ArrowRight, Shield, CheckCircle } from 'lucide-react';

export const LoginPage = ({ setCurrentView, setGlobalToast }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!username || !password) {
      setError('Please fill in both username and password.');
      return;
    }

    setError('');
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      if (setGlobalToast) setGlobalToast({ message: `Welcome back, ${res.user.fullName}!`, type: 'success' });
      setCurrentView('dashboard');
    } else {
      setError(res.message);
    }
  };

  const quickLogin = async (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
    setLoading(true);
    const res = await login(u, p);
    setLoading(false);

    if (res.success) {
      if (setGlobalToast) setGlobalToast({ message: `Logged in as ${res.user.fullName} (${res.user.role})`, type: 'success' });
      setCurrentView('dashboard');
    } else {
      setError(res.message);
    }
  };

  const sampleRoles = [
    { role: 'ADMIN', name: 'Administrator', user: 'admin', pass: 'password123', color: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100' },
    { role: 'NOMINATOR', name: 'Nominator', user: 'nominator', pass: 'password123', color: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { role: 'COMMITTEE_MEMBER', name: 'Committee Member', user: 'committee', pass: 'password123', color: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
    { role: 'VOTER', name: 'Voter', user: 'voter', pass: 'password123', color: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
    { role: 'RESULTS_OFFICER', name: 'Results Officer', user: 'officer', pass: 'password123', color: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { role: 'PROGRAM_MANAGER', name: 'Program Manager', user: 'manager', pass: 'password123', color: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full grid md:grid-cols-5 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Left Form: 3 columns */}
        <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Trophy className="w-5 h-5 text-gold-300" />
              </div>
              <span className="font-bold text-slate-800 text-lg">AuraAwards</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
            <p className="text-slate-500 text-sm mt-1">Select your credentials or use the 1-click test roles</p>

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setCurrentView('forgot-password')}
                    className="text-xs text-brand-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md hover:shadow-brand-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentView('register')}
                className="text-brand-600 font-semibold hover:underline"
              >
                Register with a role
              </button>
            </p>
          </div>
        </div>

        {/* Right Demo Box: 2 columns */}
        <div className="md:col-span-2 bg-slate-50 p-6 sm:p-8 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                1-Click Quick Demo Sign In
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Click any role to log in instantly with seeded testing credentials:
            </p>

            <div className="space-y-2">
              {sampleRoles.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => quickLogin(r.user, r.pass)}
                  disabled={loading}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs font-medium ${r.color}`}
                >
                  <div>
                    <span className="font-bold block">{r.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">user: {r.user}</span>
                  </div>
                  <span className="text-[11px] font-semibold underline">Login &rarr;</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-600">
            <p className="font-semibold text-slate-800 mb-0.5">Need to track without logging in?</p>
            <p className="text-slate-500 leading-snug">
              Nominees can track their application with their reference code on the{' '}
              <button
                onClick={() => setCurrentView('public-lookup')}
                className="text-brand-600 underline font-semibold"
              >
                Status Lookup Page
              </button>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
