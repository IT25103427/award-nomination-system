import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Trophy,
  Users,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Vote,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Send
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const Dashboard = ({ setCurrentView }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myNominations, setMyNominations] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (['ADMIN', 'PROGRAM_MANAGER', 'RESULTS_OFFICER'].includes(user?.role)) {
        const statsRes = await api.get('/results/statistics');
        setStats(statsRes.data.data);
      }

      if (user?.role === 'NOMINATOR' || user?.role === 'ADMIN') {
        const nomRes = await api.get('/nominations/my');
        setMyNominations(nomRes.data.data || []);
      }

      if (user?.role === 'VOTER' || user?.role === 'ADMIN') {
        const votesRes = await api.get('/voting/my-status');
        setMyVotes(votesRes.data.data || []);
      }

      if (['COMMITTEE_MEMBER', 'ADMIN'].includes(user?.role)) {
        const queueRes = await api.get('/approval/queue?status=PENDING');
        setPendingReviews(queueRes.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (r) => {
    switch (r) {
      case 'ADMIN': return 'Administrator';
      case 'NOMINATOR': return 'Award Nominator';
      case 'COMMITTEE_MEMBER': return 'Award Committee Member';
      case 'VOTER': return 'Community Voter';
      case 'RESULTS_OFFICER': return 'Results Verification Officer';
      case 'PROGRAM_MANAGER': return 'Awards Program Manager';
      default: return r;
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-gold-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{getRoleDisplayName(user?.role)} Workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="mt-2 text-sm text-brand-100/90 leading-relaxed">
            {user?.role === 'ADMIN' && 'Manage award categories, audit review decisions, user accounts, and maintain platform security.'}
            {user?.role === 'NOMINATOR' && 'Submit high-impact candidate nominations with supporting evidence, track evaluations, and manage your portfolio.'}
            {user?.role === 'COMMITTEE_MEMBER' && 'Review incoming candidate dossiers, verify criteria eligibility, and cast formal approval/rejection decisions.'}
            {user?.role === 'VOTER' && 'Exercise your vote in the active award categories. Exactly one ballot is permitted per category.'}
            {user?.role === 'RESULTS_OFFICER' && 'Cross-check automated candidate vote tallies against raw ballots, flag discrepancies, and sign off verified results.'}
            {user?.role === 'PROGRAM_MANAGER' && 'Oversee voting period windows, generate analytical reports, track overall participation velocity, and officially announce verified winners.'}
          </p>
        </div>
      </div>

      {/* Role specific metric cards */}
      {['ADMIN', 'PROGRAM_MANAGER', 'RESULTS_OFFICER'].includes(user?.role) && stats && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            System High-Level Analytics
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Total Nominations</span>
                <FileText className="w-5 h-5 text-brand-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalNominations}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                <span className="text-emerald-600 font-bold">{stats.approvedNominations} Approved</span>
                <span>•</span>
                <span className="text-amber-600 font-bold">{stats.pendingNominations} Pending</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Total Votes Cast</span>
                <Vote className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalVotesCast}</p>
              <p className="text-[11px] text-slate-500 mt-2">Enforced 1-vote/category</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Award Categories</span>
                <Trophy className="w-5 h-5 text-gold-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCategories}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                <span className="text-brand-600 font-bold">{stats.openVotingPeriods} Open Windows</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Published Winners</span>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.publishedWinners}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-2">
                {stats.verifiedResults} Categories Verified
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action cards tailored per role */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Nominator Actions */}
        {user?.role === 'NOMINATOR' && (
          <>
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Submit New Nomination</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Put forward a deserving colleague or team. Provide nominee details, impact justification, and supporting documents.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('submit-nomination')}
                className="mt-6 w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                Launch Submission Form &rarr;
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">My Submitted Portfolio</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  View your {myNominations.length} candidate nominations, check committee reviews, edit pending files, or withdraw if needed.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('my-nominations')}
                className="mt-6 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                View My Submissions &rarr;
              </button>
            </div>
          </>
        )}

        {/* Committee Actions */}
        {user?.role === 'COMMITTEE_MEMBER' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between md:col-span-2">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Nomination Review Queue</h3>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                  {pendingReviews.length} Pending Review
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                You have {pendingReviews.length} nomination dossiers awaiting evaluation. Check supporting documents, verify eligibility criteria, and record Approve/Reject decisions with audit comments.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('approval-queue')}
              className="mt-6 py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              Open Committee Review Queue &rarr;
            </button>
          </div>
        )}

        {/* Voter Actions */}
        {user?.role === 'VOTER' && (
          <>
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Vote className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Official Voting Booth</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Browse approved finalists across all award categories and cast your ballot. Votes are immutable once cast.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('voting-booth')}
                className="mt-6 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                Go to Voting Booth &rarr;
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">My Ballot Participation</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  You have cast ballots in {myVotes.length} categories. View your participation status.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('my-votes')}
                className="mt-6 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                View Voting History &rarr;
              </button>
            </div>
          </>
        )}

        {/* Results Officer Actions */}
        {user?.role === 'RESULTS_OFFICER' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between md:col-span-2">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Audit & Verify Vote Tallies</h3>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                Perform independent reconciliation between automated candidate tallies and raw database vote transactions. Flag any discrepancy, escalate to Admin, or sign off with verified status.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('results-audit')}
              className="mt-6 py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              Open Audit Console &rarr;
            </button>
          </div>
        )}

        {/* Program Manager Actions */}
        {user?.role === 'PROGRAM_MANAGER' && (
          <>
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Voting Windows</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Configure and schedule voting start and closing deadlines globally or per award category.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('voting-periods')}
                className="mt-6 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                Manage Dates &rarr;
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Publish Final Winners</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Review verified candidate results and trigger public announcements once officer sign-off is complete.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('manager-publish')}
                className="mt-6 w-full py-2.5 px-4 bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                Publishing Desk &rarr;
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Generate Reports</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Generate, re-filter, and download detailed analytical reports on nominations, voting turnout, and outcomes.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('reports')}
                className="mt-6 w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                Generate Reports &rarr;
              </button>
            </div>
          </>
        )}

        {/* Admin Quick Actions */}
        {user?.role === 'ADMIN' && (
          <>
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Award Categories</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Create, edit, activate or delete award categories and set criteria.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('categories')}
                className="mt-6 w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition-all"
              >
                Manage Categories &rarr;
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">User Directory</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  View registered accounts, verify statuses, and manage role privileges.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('user-management')}
                className="mt-6 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow transition-all"
              >
                Manage Users &rarr;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
