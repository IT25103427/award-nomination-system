import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Edit, AlertOctagon, ExternalLink, Calendar, Search, Copy } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const MyNominations = ({ setGlobalToast, setCurrentView }) => {
  const { user } = useAuth();
  const [nominations, setNominations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingNomination, setEditingNomination] = useState(null);
  const [editForm, setEditForm] = useState({
    categoryId: '',
    nomineeName: '',
    nomineeEmail: '',
    nomineePhone: '',
    nomineeOrg: '',
    justification: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMyNominations();
    fetchCategories();
  }, []);

  const fetchMyNominations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/nominations/my');
      setNominations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (nom) => {
    setEditingNomination(nom);
    setEditForm({
      categoryId: nom.categoryId,
      nomineeName: nom.nomineeName,
      nomineeEmail: nom.nomineeEmail,
      nomineePhone: nom.nomineePhone || '',
      nomineeOrg: nom.nomineeOrg || '',
      justification: nom.justification,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/nominations/${editingNomination.id}`, editForm);
      if (setGlobalToast) setGlobalToast({ message: 'Nomination updated successfully!', type: 'success' });
      setEditModalOpen(false);
      fetchMyNominations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update nomination');
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async (id, ref) => {
    if (!window.confirm(`Are you sure you want to withdraw nomination ${ref}? This will mark it as WITHDRAWN on record.`)) {
      return;
    }
    try {
      await api.post(`/nominations/${id}/withdraw`);
      if (setGlobalToast) setGlobalToast({ message: `Nomination ${ref} has been withdrawn.`, type: 'success' });
      fetchMyNominations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw nomination');
    }
  };

  const filtered = nominations.filter((n) =>
    n.nomineeName.toLowerCase().includes(search.toLowerCase()) ||
    n.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
    n.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Submitted Nominations</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Review the progress of your submitted candidates, make edits before review, or withdraw
          </p>
        </div>
        <button
          onClick={() => setCurrentView('submit-nomination')}
          className="py-2.5 px-5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition-all self-start sm:self-auto"
        >
          + Submit New Candidate
        </button>
      </div>

      {/* Search filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by nominee, reference ID, or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading your nominations...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 max-w-lg mx-auto">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No submissions found</p>
          <p className="text-xs text-slate-400 mt-1">Submit your first candidate nomination to start tracking.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((nom) => {
            const isPending = nom.status === 'PENDING';

            return (
              <div
                key={nom.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <span className="text-xs font-mono font-bold text-slate-800">{nom.referenceNumber}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(nom.referenceNumber);
                          alert('Copied ' + nom.referenceNumber);
                        }}
                        className="text-slate-400 hover:text-brand-600"
                        title="Copy Reference"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <StatusBadge status={nom.status} />
                    <span className="text-xs font-semibold text-brand-600">{nom.categoryName}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{nom.nomineeName}</h3>
                    <p className="text-xs text-slate-500">
                      {nom.nomineeOrg ? `${nom.nomineeOrg} • ` : ''}{nom.nomineeEmail}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{nom.justification}"
                  </p>

                  {nom.latestReviewComments && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                      <span className="font-bold">Committee Review Notes: </span>
                      {nom.latestReviewComments}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Submitted: {new Date(nom.submittedAt).toLocaleDateString()}</span>
                    {nom.documents?.length > 0 && (
                      <span>{nom.documents.length} Attachment(s)</span>
                    )}
                  </div>
                </div>

                {/* Actions: Edit or Withdraw if PENDING */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => openEdit(nom)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 w-full justify-center"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleWithdraw(nom.id, nom.referenceNumber)}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 w-full justify-center"
                      >
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Withdraw
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic px-2 py-1 bg-slate-50 rounded-lg">
                      Review completed ({nom.status.toLowerCase()})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Nomination Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Nomination Details"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Award Category
            </label>
            <select
              value={editForm.categoryId}
              onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-sm"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Nominee Name
            </label>
            <input
              type="text"
              value={editForm.nomineeName}
              onChange={(e) => setEditForm({ ...editForm, nomineeName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Nominee Email
            </label>
            <input
              type="email"
              value={editForm.nomineeEmail}
              onChange={(e) => setEditForm({ ...editForm, nomineeEmail: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Department / Org
            </label>
            <input
              type="text"
              value={editForm.nomineeOrg}
              onChange={(e) => setEditForm({ ...editForm, nomineeOrg: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Justification Statement
            </label>
            <textarea
              rows={4}
              value={editForm.justification}
              onChange={(e) => setEditForm({ ...editForm, justification: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-sm"
              required
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow"
            >
              {saving ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
