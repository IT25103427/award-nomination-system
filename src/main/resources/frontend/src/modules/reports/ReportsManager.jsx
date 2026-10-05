import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, Plus, RefreshCw, Trash2, Eye, FileText, Calendar, Filter } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const ReportsManager = ({ setGlobalToast }) => {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate / Regenerate Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    reportType: 'NOMINATIONS',
    categoryId: '',
    status: '',
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // View report details modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchCategories();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports');
      setReports(res.data.data || []);
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

  const openGenerateModal = () => {
    setEditingId(null);
    setForm({
      title: 'Annual Award Nominations Report',
      reportType: 'NOMINATIONS',
      categoryId: '',
      status: '',
    });
    setError('');
    setModalOpen(true);
  };

  const openRegenerateModal = (report) => {
    setEditingId(report.id);
    let params = {};
    try {
      params = JSON.parse(report.parametersJson || '{}');
    } catch (e) {}

    setForm({
      title: report.title,
      reportType: report.reportType,
      categoryId: params.categoryId ? params.categoryId.toString() : '',
      status: params.status || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please provide a report title.');
      return;
    }

    setGenerating(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        reportType: form.reportType,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        status: form.status || null,
      };

      if (editingId) {
        await api.put(`/reports/${editingId}`, payload);
        if (setGlobalToast) setGlobalToast({ message: 'Report regenerated with updated filters!', type: 'success' });
      } else {
        await api.post('/reports', payload);
        if (setGlobalToast) setGlobalToast({ message: 'New audit report generated!', type: 'success' });
      }
      setModalOpen(false);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = async (id, title) => {
    if (!window.confirm(`Delete report '${title}'?`)) return;
    try {
      await api.delete(`/reports/${id}`);
      if (setGlobalToast) setGlobalToast({ message: 'Report deleted', type: 'success' });
      fetchReports();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete report');
    }
  };

  const viewReport = (r) => {
    setActiveReport(r);
    try {
      setParsedData(JSON.parse(r.dataJson || '{}'));
    } catch (e) {
      setParsedData(null);
    }
    setViewModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Generate Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Program Manager analytical reporting: generate, re-filter, and download detailed reports on nominations, voting turnout, and outcomes
          </p>
        </div>
        <button
          onClick={openGenerateModal}
          className="py-2.5 px-5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Generate New Report
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading saved reports...</div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 max-w-md mx-auto">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No generated reports on record</p>
          <p className="text-xs text-slate-400 mt-1">Generate a report to analyze nominations, voter turnout, or outcomes.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {r.reportType}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{r.title}</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Generated by {r.generatedByName} on {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => viewReport(r)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Report
                </button>
                <button
                  onClick={() => openRegenerateModal(r)}
                  className="px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  title="Update filters & regenerate"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-filter & Regenerate
                </button>
                <button
                  onClick={() => handleDeleteReport(r.id, r.title)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate / Regenerate Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Update Filters & Regenerate Report' : 'Generate Compliance Report'}
      >
        <form onSubmit={handleSaveReport} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Report Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Report Type *
            </label>
            <select
              value={form.reportType}
              onChange={(e) => setForm({ ...form, reportType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-xs"
            >
              <option value="NOMINATIONS">Nominations Analysis (Dossiers, Categories, Statuses)</option>
              <option value="VOTING">Voting Ballots & Turnout (Category votes & breakdown)</option>
              <option value="OUTCOMES">Award Outcomes (Winners, Verification Status)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Category Scope (Optional)
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-xs"
            >
              <option value="">All Award Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {form.reportType === 'NOMINATIONS' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Status Filter (Optional)
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border text-xs"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="APPROVED">Approved Only</option>
                <option value="REJECTED">Rejected Only</option>
                <option value="WITHDRAWN">Withdrawn Only</option>
              </select>
            </div>
          )}

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
              disabled={generating}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Processing...' : editingId ? 'Update & Regenerate' : 'Generate Report'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Report Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={activeReport?.title || 'Report View'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b text-slate-500">
            <span>Type: <strong>{activeReport?.reportType}</strong></span>
            <span>Generated: {new Date(activeReport?.createdAt).toLocaleString()}</span>
          </div>

          {/* Table display of parsed report items */}
          {parsedData?.items && (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-slate-400 uppercase text-[10px]">
                    <th className="pb-1.5">Ref #</th>
                    <th className="pb-1.5">Nominee</th>
                    <th className="pb-1.5">Category</th>
                    <th className="pb-1.5">Department</th>
                    <th className="pb-1.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedData.items.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-mono text-slate-600">{row.referenceNumber}</td>
                      <td className="py-2 font-bold text-slate-800">{row.nomineeName}</td>
                      <td className="py-2 text-brand-600">{row.categoryName}</td>
                      <td className="py-2 text-slate-500">{row.nomineeOrg || '-'}</td>
                      <td className="py-2 font-semibold">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {parsedData?.categories && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <p className="font-bold text-slate-800">Total Votes Cast: {parsedData.totalVotesCast}</p>
              {parsedData.categories.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>{c.categoryName}</span>
                    <span className="text-brand-600">{c.voteCount} Votes</span>
                  </div>
                  <div className="space-y-1 pl-2 text-slate-600">
                    {c.candidates?.map((cand, ci) => (
                      <div key={ci} className="flex justify-between text-[11px]">
                        <span>{cand.nomineeName}</span>
                        <span className="font-mono">{cand.votes} votes</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {parsedData?.outcomes && (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-slate-400 uppercase text-[10px]">
                    <th className="pb-1.5">Category</th>
                    <th className="pb-1.5">Verification</th>
                    <th className="pb-1.5">Declared Winner</th>
                    <th className="pb-1.5">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedData.outcomes.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-bold text-slate-800">{row.categoryName}</td>
                      <td className="py-2 font-semibold text-emerald-700">{row.verificationStatus}</td>
                      <td className="py-2 font-bold text-brand-600">{row.winnerName}</td>
                      <td className="py-2">{row.published ? 'Yes (Live)' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-3 border-t flex justify-end">
            <button
              onClick={() => setViewModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
