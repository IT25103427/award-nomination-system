import React, { useState } from 'react';
import api from '../../services/api';
import { Search, Trophy, CheckCircle2, Clock, XCircle, AlertCircle, Award, ShieldAlert, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const PublicLookup = ({ setCurrentView }) => {
  const [refNumber, setRefNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const sampleRefs = ['NOM-2026-0811', 'NOM-2026-0814', 'NOM-2026-0816', 'NOM-2026-0817'];

  const handleLookup = async (e, sample) => {
    if (e) e.preventDefault();
    const query = sample || refNumber;
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.get(`/public/nominations/lookup/${encodeURIComponent(query.trim())}`);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Nomination tracking reference not found. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Submission Received', desc: 'Saved with status Pending Review' },
    { num: 2, title: 'Committee Evaluation', desc: 'Eligibility & justification checked' },
    { num: 3, title: 'Approved for Ballot', desc: 'Active in voter ballot round' },
    { num: 4, title: 'Verification Audit', desc: 'Tallies verified by Results Officer' },
    { num: 5, title: 'Official Winner Announcement', desc: 'Published by Program Manager' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex p-3 rounded-2xl bg-brand-50 text-brand-600 mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Public Nomination Status Lookup
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Track the live evaluation, committee review, and voting outcome of any nomination using its unique tracking reference number. No account login required.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <form onSubmit={(e) => handleLookup(e)} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              placeholder="e.g. NOM-2026-0811"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-base font-mono uppercase tracking-wider placeholder:font-sans placeholder:normal-case placeholder:tracking-normal"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="py-3 px-8 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-70"
          >
            {loading ? 'Searching...' : 'Track Status'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="mt-4 flex items-center gap-2 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Sample Reference Codes:</span>
          {sampleRefs.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setRefNumber(code);
                handleLookup(null, code);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 font-mono text-xs transition-colors"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Lookup Error</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                Reference ID: {result.referenceNumber}
              </span>
              <h2 className="text-2xl font-bold text-slate-900">{result.nomineeName}</h2>
              <p className="text-sm font-semibold text-brand-600 mt-0.5">{result.categoryName}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={result.status} />
              {result.winner && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-800 border border-gold-300 font-bold text-xs">
                  <Trophy className="w-3.5 h-3.5 text-gold-600" />
                  OFFICIAL WINNER
                </span>
              )}
            </div>
          </div>

          {/* Human readable explanation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Current Progress Note</p>
            <p className="text-sm font-medium text-slate-800">{result.statusDescription}</p>
            {result.submittedAt && (
              <span className="text-xs text-slate-400 mt-2 block">
                Submitted on: {new Date(result.submittedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </span>
            )}
          </div>

          {/* Progress Stepper (if not rejected or withdrawn) */}
          {result.status !== 'REJECTED' && result.status !== 'WITHDRAWN' ? (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                Lifecycle Progression
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {steps.map((s) => {
                  const isCompleted = result.currentStage >= s.num;
                  const isCurrent = result.currentStage === s.num;

                  return (
                    <div
                      key={s.num}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isCurrent
                          ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-slate-100 bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-400">Step {s.num}</span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{s.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              <span>
                {result.status === 'WITHDRAWN'
                  ? 'This submission was withdrawn by the nominator. The reference ID remains on record.'
                  : 'This submission did not pass the committee approval phase.'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
