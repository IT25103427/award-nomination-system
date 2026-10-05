import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Trophy,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart3,
  Building,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ProgramManager = ({ setGlobalToast, setCurrentView }) => {
  const [categoriesAudit, setCategoriesAudit] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [auditRes, statsRes] = await Promise.all([
        api.get('/results/tallies'),
        api.get('/results/statistics'),
      ]);
      setCategoriesAudit(auditRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (categoryId, categoryName) => {
    if (!window.confirm(`OFFICIAL PUBLICATION: Publish final winner for '${categoryName}' to the public and all voters?`)) {
      return;
    }

    setPublishingId(categoryId);
    try {
      const res = await api.post('/results/publish', { categoryId });
      const winner = res.data.data;
      if (setGlobalToast) {
        setGlobalToast({
          message: `Winner announced: ${winner.nomineeName} won '${winner.categoryName}' with ${winner.voteCount} verified votes!`,
          type: 'success',
        });
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish winner');
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Awards Program Manager Desk
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Oversee category lifecycles, monitor turnout velocity, and publish verified award winners
          </p>
        </div>
        <button
          onClick={() => setCurrentView('voting-periods')}
          className="py-2.5 px-5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          Schedule Voting Windows
        </button>
      </div>

      {/* Analytics Summary */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              All Nominations
            </span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalNominations}</span>
            <div className="text-[11px] text-slate-500 mt-1">
              {stats.approvedNominations} Approved • {stats.pendingNominations} Pending
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Votes Recorded
            </span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalVotesCast}</span>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              Across {stats.totalCategories} Categories
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Audited & Verified
            </span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.verifiedResults}</span>
            <div className="text-[11px] text-slate-500 mt-1">Signed by Results Officer</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Publicly Published
            </span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.publishedWinners}</span>
            <div className="text-[11px] text-purple-600 font-semibold mt-1">Winners Live in Gallery</div>
          </div>
        </div>
      )}

      {/* Winner Publication Manager */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Category Publication Control</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading categories...</div>
        ) : (
          <div className="grid gap-4">
            {categoriesAudit.map((cat) => {
              const isVerified = cat.verificationStatus === 'VERIFIED';
              const isPublished = cat.published;

              return (
                <div
                  key={cat.categoryId}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">{cat.categoryName}</h3>
                      <StatusBadge status={cat.verificationStatus} />
                      {isPublished ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 text-[10px] font-bold border border-gold-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-gold-600" />
                          WINNER PUBLISHED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          Hidden from Voters
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>
                        Projected Winner:{' '}
                        <strong className="text-slate-900">{cat.winnerNomineeName || 'Pending Votes'}</strong>
                      </p>
                      <p className="text-slate-400">
                        Total Raw Votes: {cat.totalRawVotes} | Total Candidates: {cat.candidates?.length || 0}
                      </p>
                    </div>

                    {cat.verifiedByName && (
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Signed off as VERIFIED by Officer {cat.verifiedByName} on {new Date(cat.verifiedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Publish Action */}
                  <div className="shrink-0 flex items-center gap-3">
                    {isPublished ? (
                      <div className="flex items-center gap-2">
                        <span className="px-4 py-2 bg-gold-50 text-gold-800 font-bold text-xs rounded-xl border border-gold-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-gold-600" />
                          Published on {new Date(cat.publishedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => setCurrentView('public-winners')}
                          className="px-3 py-2 text-xs font-semibold text-brand-600 hover:underline"
                        >
                          View in Gallery &rarr;
                        </button>
                      </div>
                    ) : isVerified ? (
                      <button
                        onClick={() => handlePublish(cat.categoryId, cat.categoryName)}
                        disabled={publishingId === cat.categoryId}
                        className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Trophy className="w-4 h-4 text-gold-100" />
                        {publishingId === cat.categoryId ? 'Publishing...' : 'Publish Official Winner'}
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="px-4 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl inline-block cursor-not-allowed">
                          Awaiting Officer Verification
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">Officer sign-off required</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
