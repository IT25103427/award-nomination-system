import React, { useState } from 'react';
import api from '../../services/api';
import { Mail, ArrowRight, CheckCircle2, Trophy } from 'lucide-react';

export const ForgotPasswordPage = ({ setCurrentView, setResetCodeHolder }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [codeGenerated, setCodeGenerated] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      const code = res.data.data?.resetCode;
      setCodeGenerated(code);
      if (setResetCodeHolder) setResetCodeHolder(code);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md">
            <Trophy className="w-6 h-6 text-gold-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Reset Your Password</h2>
          <p className="text-slate-500 text-xs mt-1">
            Enter your registered email to receive a password reset token
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reset Code Sent</span>
            </div>
            <p className="text-slate-600">{message}</p>
            {codeGenerated && (
              <div className="mt-2 p-2 bg-white rounded border border-emerald-200 text-center font-mono font-bold text-sm text-emerald-700">
                Code: {codeGenerated}
              </div>
            )}
            <button
              onClick={() => setCurrentView('reset-password')}
              className="mt-2 w-full py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors block text-center"
            >
              Proceed to Enter New Password &rarr;
            </button>
          </div>
        )}

        {!codeGenerated && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Sending Request...' : 'Send Reset Code'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <button
            onClick={() => setCurrentView('login')}
            className="text-xs text-slate-500 hover:text-brand-600 font-medium"
          >
            &larr; Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
