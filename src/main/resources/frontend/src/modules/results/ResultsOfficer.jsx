import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, AlertTriangle, CheckCircle2, FileSpreadsheet, Send, Trophy, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const ResultsOfficer = ({ setGlobalToast }) => {
  const { user } = useAuth();
  const [categoriesAudit, setCategoriesAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  // Signoff modal state
  const [signoffModalOpen, setSignoffModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [signoffNotes, setSignoffNotes] = useState('');
  const [submittingSignoff, setSubmittingSignoff] = useState(false);

  // Escalation modal state
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalationNotes, setEscalationNotes] = useState('');
  const [submittingEscalate, setSubmittingEscalate] = useState(false);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await api.get('/results/tallies');
      setCategoriesAudit(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openSignoff = (audit) => {
    setSelectedAudit(audit);
    setSignoffNotes('Verified 100% reconciliation against raw database vote transaction logs.');
    setSignoffModalOpen(true);
  };

  const handleSignoff = async (e) => {
    e.preventDefault();
    if (!selectedAudit) return;

    setSubmittingSignoff(true);
    try {
      await api.post('/results/verify', {
        categoryId: selectedAudit.categoryId,
        notes: signoffNotes,
      });

      if (setGlobalToast) {
        setGlobalToast({
          message: `Results for '${selectedAudit.categoryName}' successfully signed off as VERIFIED!`,
          type: 'success',
        });
      }
      setSignoffModalOpen(false);
      fetchAudits();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to sign off results');
    } finally {
      setSubmittingSignoff(false);
    }
  };

  const openEscalate = (audit) => {
    setSelectedAudit(audit);
    setEscalationNotes('');
    setEscalateModalOpen(true);
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    if (!selectedAudit || !escalationNotes.trim()) {
      alert('Please describe the discrepancy notes.');
      return;
    }

    setSubmittingEscalate(true);
    try {
      await api.post('/results/escalate', {
        categoryId: selectedAudit.categoryId,
        escalationNotes: escalationNotes.trim(),
      });

      if (setGlobalToast) {
        setGlobalToast({
          message: `Discrepancy in '${selectedAudit.categoryName}' escalated to Administrator.`,
          type: 'error',
        });
      }
      setEscalateModalOpen(false);
      fetchAudits();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to escalate');
    } finally {
      setSubmittingEscalate(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Results Verification Officer Desk
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Independent cross-check between automated candidate tallies and raw database vote transactions
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <p className="font-bold">Mandatory Verification Step Before Publication</p>
          <p className="text-amber-800 mt-0.5">
            The Awards Program Manager cannot publish winners until you formally audit and sign off the category as "VERIFIED".
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading audit reconciliation logs...</div>
      ) : categoriesAudit.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 max-w-md mx-auto">
          No categories found for audit.
        </div>
      ) : (
        <div className="space-y-6">
          {categoriesAudit.map((audit) => {
            const isVerified = audit.verificationStatus === 'VERIFIED';
            const isDiscrepant = audit.verificationStatus === 'DISCREPANCY';

            return (
              <div
                key={audit.categoryId}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-gold-500" />
                      <h2 className="text-lg font-bold text-slate-900">{audit.categoryName}</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Total Raw Votes: <strong>{audit.totalRawVotes}</strong> | Total Tallied Votes: <strong>{audit.totalTalliedVotes}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={audit.verificationStatus} />
                    {audit.published && (
                      <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 text-xs font-bold border border-gold-300">
                        Published
                      </span>
                    )}
                  </div>
                </div>

                {/* Audit Table: Cross-check candidate by candidate */}
                <div className="p-6 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="pb-2 font-bold">Candidate / Team</th>
                          <th className="pb-2 font-bold">Reference #</th>
                          <th className="pb-2 font-bold text-center">Automated Tally</th>
                          <th className="pb-2 font-bold text-center">Raw DB Votes</th>
                          <th className="pb-2 font-bold text-center">Reconciliation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {audit.candidates?.map((c) => (
                          <tr key={c.nominationId} className="hover:bg-slate-50/50">
                            <td className="py-3 font-semibold text-slate-900">
                              {c.nomineeName}
                              {c.nomineeOrg && <span className="block text-[11px] font-normal text-slate-400">{c.nomineeOrg}</span>}
                            </td>
                            <td className="py-3 font-mono text-slate-600">{c.referenceNumber}</td>
                            <td className="py-3 text-center font-bold text-slate-800">{c.automatedTally}</td>
                            <td className="py-3 text-center font-bold text-slate-800">{c.rawVoteCount}</td>
                            <td className="py-3 text-center">
                              {c.discrepancy ? (
                                <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  MISMATCH
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Match (100%)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Top Candidate Summary */}
                  {audit.winnerNomineeName && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between flex-wrap gap-2">
                      <span>
                        Leading Candidate / Projected Winner:{' '}
                        <strong className="text-slate-900 text-sm">{audit.winnerNomineeName}</strong>
                      </span>
                      {audit.verifiedByName && (
                        <span className="text-[11px] text-slate-500">
                          Verified by {audit.verifiedByName} on {new Date(audit.verifiedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  {audit.escalationNotes && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      <span className="font-bold">Officer Escalation Notes: </span>
                      {audit.escalationNotes}
                    </div>
                  )}

                  {/* Actions for Officer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      onClick={() => openEscalate(audit)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-all border border-rose-200 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Flag / Escalate Discrepancy
                    </button>

                    <button
                      onClick={() => openSignoff(audit)}
                      disabled={isVerified}
                      className={`px-5 py-2 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 ${
                        isVerified
                          ? 'bg-emerald-600/70 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isVerified ? 'Verified & Signed Off' : 'Sign Off Verified Results'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Signoff Modal */}
      <Modal
        isOpen={signoffModalOpen}
        onClose={() => setSignoffModalOpen(false)}
        title={`Sign Off Results: ${selectedAudit?.categoryName}`}
      >
        <form onSubmit={handleSignoff} className="space-y-4">
          <p className="text-xs text-slate-500">
            By signing off, you officially certify that the vote tallies for <strong>{selectedAudit?.categoryName}</strong> match the raw ballots and that no tampering or anomalies exist.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Audit Sign-off Notes
            </label>
            <textarea
              rows={3}
              value={signoffNotes}
              onChange={(e) => setSignoffNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSignoffModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingSignoff}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              {submittingSignoff ? 'Recording...' : 'Certify & Sign Off Results'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Escalation Modal */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title={`Escalate Discrepancy: ${selectedAudit?.categoryName}`}
      >
        <form onSubmit={handleEscalate} className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
            This will mark the category as <strong>DISCREPANCY</strong> and alert the System Administrator immediately.
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description of Irregularity / Mismatch *
            </label>
            <textarea
              rows={4}
              value={escalationNotes}
              onChange={(e) => setEscalationNotes(e.target.value)}
              placeholder="Detail the vote difference, suspicious pattern, or audit concern..."
              className="w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEscalateModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingEscalate}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow"
            >
              {submittingEscalate ? 'Escalating...' : 'Submit Escalation to Admin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
