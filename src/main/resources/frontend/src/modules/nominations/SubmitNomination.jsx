import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Send, Upload, File, X, CheckCircle2, AlertCircle, Trophy, Copy, ArrowRight } from 'lucide-react';

export const SubmitNomination = ({ setCurrentView, setGlobalToast }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [categoryId, setCategoryId] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeEmail, setNomineeEmail] = useState('');
  const [nomineePhone, setNomineePhone] = useState('');
  const [nomineeOrg, setNomineeOrg] = useState('');
  const [justification, setJustification] = useState('');
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');

  // Submitted confirmation state
  const [submittedRef, setSubmittedRef] = useState(null);
  const [submittedNominee, setSubmittedNominee] = useState('');

  const ALLOWED_EXTS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
  const MAX_SIZE_MB = 10;

  useEffect(() => {
    fetchActiveCategories();
  }, []);

  const fetchActiveCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories?includeInactive=false');
      const activeList = res.data.data || [];
      setCategories(activeList);
      if (activeList.length > 0) {
        setCategoryId(activeList[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFileError('');
    const selected = Array.from(e.target.files);
    const valid = [];

    for (const f of selected) {
      const ext = f.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        setFileError(`Invalid file format: '${f.name}'. Only PDF, DOC, DOCX, PNG, JPG files are allowed.`);
        return;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setFileError(`File '${f.name}' exceeds the ${MAX_SIZE_MB}MB size limit.`);
        return;
      }
      valid.push(f);
    }

    setFiles([...files, ...valid]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId || !nomineeName.trim() || !nomineeEmail.trim() || !justification.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (justification.trim().length < 20) {
      setError('Justification statement must be at least 20 characters describing the nominee’s achievements.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('nomineeName', nomineeName.trim());
      formData.append('nomineeEmail', nomineeEmail.trim());
      formData.append('nomineePhone', nomineePhone.trim());
      formData.append('nomineeOrg', nomineeOrg.trim());
      formData.append('justification', justification.trim());

      files.forEach((f) => {
        formData.append('files', f);
      });

      const res = await api.post('/nominations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const ref = res.data.data.referenceNumber;
      setSubmittedRef(ref);
      setSubmittedNominee(nomineeName);
      if (setGlobalToast) setGlobalToast({ message: `Nomination submitted with Reference: ${ref}`, type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit nomination');
    } finally {
      setSubmitting(false);
    }
  };

  // If successfully submitted, render the on-screen confirmation screen
  if (submittedRef) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm border border-emerald-200 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Status: Pending Review
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-3">Nomination Successfully Filed!</h2>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              Your nomination for <strong>{submittedNominee}</strong> has been logged in the system and queued for committee review.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-md mx-auto">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Tracking Reference Number
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-extrabold text-brand-700 tracking-wider">
                {submittedRef}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(submittedRef);
                  alert('Reference code copied to clipboard!');
                }}
                className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-200 transition-colors"
                title="Copy reference code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-snug">
              Share this code with the nominee. Anyone can track evaluation status on the Public Lookup page without logging in.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentView('my-nominations')}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all"
            >
              View My Submitted Nominations
            </button>
            <button
              onClick={() => {
                setSubmittedRef(null);
                setNomineeName('');
                setNomineeEmail('');
                setNomineePhone('');
                setNomineeOrg('');
                setJustification('');
                setFiles([]);
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition-all"
            >
              Submit Another Nomination &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nomination Submission</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Provide candidate details, achievements justification, and supporting evidence
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Award Category Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Award Category *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium"
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {categories.find((c) => c.id.toString() === categoryId)?.eligibilityCriteria && (
            <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Criteria:</span>{' '}
              {categories.find((c) => c.id.toString() === categoryId)?.eligibilityCriteria}
            </p>
          )}
        </div>

        {/* Nominee details */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Nominee Full Name / Team Name *
            </label>
            <input
              type="text"
              value={nomineeName}
              onChange={(e) => setNomineeName(e.target.value)}
              placeholder="e.g. Alice Morgan"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Nominee Email Address *
            </label>
            <input
              type="email"
              value={nomineeEmail}
              onChange={(e) => setNomineeEmail(e.target.value)}
              placeholder="nominee@company.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Nominee Mobile Number
            </label>
            <input
              type="text"
              value={nomineePhone}
              onChange={(e) => setNomineePhone(e.target.value)}
              placeholder="+1-555-0199"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Organization / Department
            </label>
            <input
              type="text"
              value={nomineeOrg}
              onChange={(e) => setNomineeOrg(e.target.value)}
              placeholder="e.g. Operations & Logistics"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Justification */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Nomination Justification & Merits *
          </label>
          <textarea
            rows={5}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Detail the nominee's specific accomplishments, measurable impact, leadership, and why they qualify for this award (minimum 20 characters)..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
            required
          />
          <span className="text-[11px] text-slate-400 block text-right mt-1">
            {justification.length} characters entered
          </span>
        </div>

        {/* File Upload with validation */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Supporting Evidence / Documents
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-brand-400 transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">
              Drag & drop files or{' '}
              <label className="text-brand-600 font-bold hover:underline cursor-pointer">
                browse files
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
              </label>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Permitted formats: PDF, DOC, DOCX, PNG, JPG (Max 10 MB per file)
            </p>
          </div>

          {fileError && (
            <p className="text-xs text-rose-600 mt-2 font-medium">{fileError}</p>
          )}

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              <span className="text-xs font-semibold text-slate-700">Attached Documents ({files.length}):</span>
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <File className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="py-3 px-8 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {submitting ? 'Transmitting Nomination...' : 'Submit Nomination & Generate Code'}
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
