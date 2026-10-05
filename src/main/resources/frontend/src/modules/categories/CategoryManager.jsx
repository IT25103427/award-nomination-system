import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Trophy, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const CategoryManager = ({ setGlobalToast }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state for create / edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eligibilityCriteria: '',
    active: true,
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [isAdmin]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/categories?includeInactive=${isAdmin}`);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', eligibilityCriteria: '', active: true });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      eligibilityCriteria: cat.eligibilityCriteria || '',
      active: cat.active,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
        if (setGlobalToast) setGlobalToast({ message: 'Award category updated successfully!', type: 'success' });
      } else {
        await api.post('/categories', formData);
        if (setGlobalToast) setGlobalToast({ message: 'Award category created successfully!', type: 'success' });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete category '${name}'? All associated nominations, votes, and periods will also be removed.`)) {
      return;
    }
    try {
      await api.delete(`/categories/${id}`);
      if (setGlobalToast) {
        setGlobalToast({ message: `Award category '${name}' deleted successfully!`, type: 'success' });
      }
      fetchCategories();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete category';
      if (setGlobalToast) {
        setGlobalToast({ message: errorMsg, type: 'error' });
      } else {
        alert(errorMsg);
      }
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Award Categories</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin ? 'Manage platform categories, criteria, and activation status' : 'Browse active award categories and criteria'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="py-2.5 px-5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create New Category
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or keyword..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Categories Cards / Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading categories...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
          No award categories found matching your query.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                      cat.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {cat.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {cat.description || 'No description provided.'}
                </p>

                {cat.eligibilityCriteria && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-4">
                    <span className="font-bold text-slate-700 block mb-1">Eligibility Criteria:</span>
                    <p className="text-slate-500 leading-snug">{cat.eligibilityCriteria}</p>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Category Modal (Admin Only) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Award Category' : 'Create Award Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Best Innovator"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the award category's purpose..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Eligibility Criteria
            </label>
            <textarea
              rows={3}
              value={formData.eligibilityCriteria}
              onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
              placeholder="Minimum requirements, tenure, department scopes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="categoryActive"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
            <label htmlFor="categoryActive" className="text-xs font-medium text-slate-700">
              Active Category (Accepting Nominations & Voting)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow"
            >
              {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
