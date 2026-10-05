import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Mail, Lock, User, Phone, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const RegisterPage = ({ setCurrentView, setGlobalToast }) => {
  const { register, verifyEmail } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    username: '',
    password: '',
    role: 'NOMINATOR',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verification code modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.mobileNumber || !formData.username || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      const code = res.data?.verificationCode;
      setVerificationCode(code || '');
      setVerificationInput(code || ''); // auto-fill for ease of testing!
      setShowVerifyModal(true);
    } else {
      setError(res.message);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!verificationInput.trim()) {
      setVerifyError('Please enter the verification code.');
      return;
    }

    setVerifyLoading(true);
    setVerifyError('');
    const res = await verifyEmail(verificationInput.trim());
    setVerifyLoading(false);

    if (res.success) {
      setShowVerifyModal(false);
      if (setGlobalToast) setGlobalToast({ message: 'Account verified and activated! Welcome.', type: 'success' });
      setCurrentView('dashboard');
    } else {
      setVerifyError(res.message);
    }
  };

  const roles = [
    { value: 'NOMINATOR', label: 'Nominator (Submit/Track Nominations)' },
    { value: 'VOTER', label: 'Voter (View Approved Nominees & Vote)' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md">
            <Trophy className="w-6 h-6 text-gold-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create an Account</h2>
          <p className="text-slate-500 text-sm mt-1">
            Register to participate in the award nomination and voting system
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Select Your Role *
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white font-medium"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Note: External nominees do not register; nominators submit candidates.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="+1-555-0199"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Username *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md hover:shadow-brand-200 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {loading ? 'Submitting Registration...' : 'Register Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentView('login')}
              className="text-brand-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Email Confirmation / Verification Code Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Email Confirmation Required"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs">
            <p className="font-bold mb-1">Account Activation Code Generated</p>
            <p className="text-slate-600">
              An email confirmation code was generated for <strong>{formData.email}</strong>. Enter it below to activate your account:
            </p>
            <div className="mt-2 p-2 bg-white rounded-lg border border-brand-200 font-mono text-center text-sm font-bold text-brand-700">
              {verificationCode}
            </div>
          </div>

          {verifyError && (
            <p className="text-xs text-rose-600 font-semibold">{verifyError}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Enter Verification Code:
            </label>
            <input
              type="text"
              value={verificationInput}
              onChange={(e) => setVerificationInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-mono text-center tracking-widest text-base focus:ring-2 focus:ring-brand-500 focus:outline-none"
              placeholder="e.g. 8A1B2C3D"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={verifyLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow transition-all flex items-center justify-center gap-2"
          >
            {verifyLoading ? 'Verifying...' : 'Verify & Activate Account'}
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </Modal>
    </div>
  );
};
