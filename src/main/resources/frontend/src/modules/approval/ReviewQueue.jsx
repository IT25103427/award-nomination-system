import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  CheckSquare,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  MessageSquare,
  History,
  Download,
  AlertTriangle,
  Search,
  ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const ReviewQueue = ({ setGlobalToast }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [nominations, setNominations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Decision Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [decision, setDecision] = useState('APPROVED');
  const [comments, setComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Audit History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyReviews, setHistoryReviews] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [selectedCategory, selectedStatus, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQueue = async () => {
    setLoading(true);
    try {
      let url = '/approval/queue?';
      if (selectedCategory) url += `categoryId=${selectedCategory}&`;
      if (selectedStatus) url += `status=${selectedStatus}&`;
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;

      const res = await api.get(url);
      setNominations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (nom, defaultDecision) => {
    setSelectedNomination(nom);
    setDecision(defaultDecision);
    setComments('');
    setReviewModalOpen(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!selectedNomination) return;

    setSubmittingReview(true);
    try {
      await api.post('/approval/review', {
        nominationId: selectedNomination.id,
        decision,
        comments,
      });

      if (setGlobalToast) {
        setGlobalToast({
          message: `Nomination for ${selectedNomination.nomineeName} marked as ${decision}. Notification sent to nominator.`,
          type: 'success',
        });
      }
      setReviewModalOpen(false);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const openHistory = async (nom) => {
    setSelectedNomination(nom);
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/approval/history/${nom.id}`);
      setHistoryReviews(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteSpam = async (nom) => {
    if (!window.confirm(`ADMIN ACTION: Permanently DELETE nomination ${nom.referenceNumber} (${nom.nomineeName}) from the database? This is an irreversible removal of invalid/spam entries.`)) {
      return;
    }
    try {
      await api.delete(`/nominations/${nom.id}`);
      if (setGlobalToast) setGlobalToast({ message: `Nomination ${nom.referenceNumber} permanently deleted.`, type: 'success' });
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete nomination');
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nomination Review & Evaluation Desk</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Evaluate submitted dossiers against eligibility criteria, log audit decisions, and curate candidates for voting
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Award Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Status Filter
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Review (Action Required)</option>
            <option value="APPROVED">Approved For Voting</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn by Nominator</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Search Candidate
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Candidate or ref code..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Queue items */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading evaluation queue...</div>
      ) : nominations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 max-w-md mx-auto">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No dossiers match current filters</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the status filter or category.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {nominations.map((nom) => (
            <div
              key={nom.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              {/* Top Row: Ref, Status, Category, Nominator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {nom.referenceNumber}
                  </span>
                  <StatusBadge status={nom.status} />
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                    {nom.categoryName}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Nominator: <strong className="text-slate-600">{nom.nominatorName}</strong> ({nom.nominatorEmail})
                </span>
              </div>

              {/* Nominee & Justification */}
              <div className="space-y-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{nom.nomineeName}</h3>
                  <p className="text-xs text-slate-500">
                    {nom.nomineeOrg ? `${nom.nomineeOrg} • ` : ''}{nom.nomineeEmail}
                    {nom.nomineePhone ? ` • ${nom.nomineePhone}` : ''}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-800 block mb-1">Merit & Impact Justification:</span>
                  <p>{nom.justification}</p>
                </div>
              </div>

              {/* Attached Supporting Documents */}
              {nom.documents && nom.documents.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Supporting Documents ({nom.documents.length}):
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {nom.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={`/${doc.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-xs text-slate-700 font-medium transition-colors border border-slate-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-brand-600" />
                        <span className="truncate max-w-[200px]">{doc.fileName}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Action Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 gap-3">
                <button
                  onClick={() => openHistory(nom)}
                  className="text-xs text-slate-500 hover:text-brand-600 font-semibold flex items-center gap-1.5 self-start"
                >
                  <History className="w-3.5 h-3.5" />
                  View Audit Trail History
                </button>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {nom.status !== 'WITHDRAWN' && (
                    <>
                      <button
                        onClick={() => openReviewModal(nom, 'APPROVED')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve Candidate
                      </button>
                      <button
                        onClick={() => openReviewModal(nom, 'REJECTED')}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-rose-200"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject with Comments
                      </button>
                    </>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteSpam(nom)}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Permanently remove invalid or spam nomination"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Spam
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Decision Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review Decision for ${selectedNomination?.nomineeName}`}
      >
        <form onSubmit={submitReview} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <p>
              <strong>Category:</strong> {selectedNomination?.categoryName}
            </p>
            <p className="mt-1">
              <strong>Reference:</strong> {selectedNomination?.referenceNumber}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Decision *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('APPROVED')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  decision === 'APPROVED'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Approve for Voting
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  decision === 'REJECTED'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                Reject Nomination
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Reviewer Audit Notes / Feedback {decision === 'REJECTED' ? '(Recommended)' : '(Optional)'}
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={decision === 'REJECTED' ? 'Explain reasons for non-qualification or criteria deficiency...' : 'Add committee evaluation notes...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This comment is preserved in the audit log and emailed to the nominator.
            </p>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className={`px-5 py-2 text-white font-semibold text-xs rounded-xl shadow transition-all ${
                decision === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submittingReview ? 'Recording...' : `Confirm & Record ${decision}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Audit Trail History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Audit Trail: ${selectedNomination?.referenceNumber}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Immutable log of all evaluations, review decisions, and remarks recorded for candidate{' '}
            <strong>{selectedNomination?.nomineeName}</strong>.
          </p>

          {loadingHistory ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading audit log...</div>
          ) : historyReviews.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border">
              No formal reviews recorded yet for this nomination.
            </div>
          ) : (
            <div className="space-y-3">
              {historyReviews.map((rev) => (
                <div key={rev.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={rev.decision} />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rev.decidedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-800">
                    Evaluated by: <strong>{rev.reviewedByName}</strong>
                  </p>
                  {rev.comments && (
                    <div className="p-2 bg-white rounded border border-slate-200/80 text-slate-600 italic">
                      "{rev.comments}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
