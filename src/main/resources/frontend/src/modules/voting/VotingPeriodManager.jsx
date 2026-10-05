import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Plus, Edit2, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';

export const VotingPeriodManager = ({ setGlobalToast }) => {
  const [periods, setPeriods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    categoryId: '',
    startDate: '',
    endDate: '',
    status: 'OPEN',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPeriods();
    fetchCategories();
  }, []);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const res = await api.get('/voting-periods');
      setPeriods(res.data.data || []);
    } catch (e) {
      console.error(e);
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

  const openCreate = () => {
    setEditingId(null);
    const now = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    setForm({
      categoryId: '',
      startDate: now.toISOString().slice(0, 16),
      endDate: nextWeek.toISOString().slice(0, 16),
      status: 'OPEN',
    });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      categoryId: p.categoryId ? p.categoryId.toString() : '',
      startDate: p.startDate ? p.startDate.slice(0, 16) : '',
      endDate: p.endDate ? p.endDate.slice(0, 16) : '',
      status: p.status,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      setError('Please provide both start and end timestamps.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
      };

      if (editingId) {
        await api.put(`/voting-periods/${editingId}`, payload);
        if (setGlobalToast) setGlobalToast({ message: 'Voting window updated successfully!', type: 'success' });
      } else {
        await api.post('/voting-periods', payload);
        if (setGlobalToast) setGlobalToast({ message: 'New voting window scheduled!', type: 'success' });
      }
      setModalOpen(false);
      fetchPeriods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save voting period');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this voting window?')) return;
    try {
      await api.delete(`/voting-periods/${id}`);
      if (setGlobalToast) setGlobalToast({ message: 'Voting period deleted', type: 'success' });
      fetchPeriods();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete period');
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Voting Period Window Scheduler</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure global or category-specific start and end dates for official voter balloting
          </p>
        </div>
        <button
          onClick={openCreate}
          className="py-2.5 px-5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule New Window
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading voting windows...</div>
      ) : periods.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No voting periods scheduled</p>
          <p className="text-xs text-slate-400 mt-1">Schedule a window to allow voters to cast ballots.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {periods.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{p.categoryName}</span>
                  <StatusBadge status={p.status} />
                  {p.currentlyActive && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      LIVE NOW
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Start: {new Date(p.startDate).toLocaleString()}</span>
                  </div>
                  <span>&rarr;</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>End: {new Date(p.endDate).toLocaleString()}</span>
                  </div>
                </div>

                {p.setByName && (
                  <p className="text-[11px] text-slate-400">Scheduled by: {p.setByName}</p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Voting Window' : 'Schedule New Voting Period'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Category Scope
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-xs"
            >
              <option value="">All Categories (Global Voting Window)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Window Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-xs"
            >
              <option value="OPEN">OPEN (Accepting Votes During Window)</option>
              <option value="SCHEDULED">SCHEDULED (Opens Automatically)</option>
              <option value="CLOSED">CLOSED (Voting Disabled)</option>
            </select>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow"
            >
              {saving ? 'Saving...' : editingId ? 'Update Period' : 'Save Window'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
