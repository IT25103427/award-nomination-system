import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Shield, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';

export const UserDirectory = ({ setGlobalToast }) => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = roleFilter ? `/users?role=${roleFilter}` : '/users';
      const res = await api.get(url);
      setUsers(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role?role=${newRole}`);
      if (setGlobalToast) setGlobalToast({ message: `User role updated to ${newRole}`, type: 'success' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const filtered = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const allRoles = ['ADMIN', 'NOMINATOR', 'COMMITTEE_MEMBER', 'VOTER', 'RESULTS_OFFICER', 'PROGRAM_MANAGER'];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Directory & Roles</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          View registered accounts across all 6 roles and adjust role privileges
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 grid sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="">All Roles</option>
            {allRoles.map((r) => (
              <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading user records...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="p-4 font-bold">User</th>
                  <th className="p-4 font-bold">Username</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold text-center">Verified</th>
                  <th className="p-4 font-bold">Assigned Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">
                      {u.fullName}
                      <span className="block text-[11px] font-normal text-slate-400">{u.email}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{u.username}</td>
                    <td className="p-4 text-slate-600">{u.mobileNumber}</td>
                    <td className="p-4 text-center">
                      {u.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                          <XCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-brand-500"
                      >
                        {allRoles.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
