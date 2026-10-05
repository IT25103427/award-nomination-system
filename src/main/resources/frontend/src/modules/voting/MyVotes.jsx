import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Vote, CheckCircle2, Trophy, Clock, ShieldCheck } from 'lucide-react';

export const MyVotes = ({ setCurrentView }) => {
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyVotes();
  }, []);

  const fetchMyVotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/voting/my-status');
      setMyVotes(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Ballot History</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Your permanent, immutable record of participation across award categories
          </p>
        </div>
        <button
          onClick={() => setCurrentView('voting-booth')}
          className="py-2.5 px-5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition-all self-start sm:self-auto"
        >
          Open Voting Booth &rarr;
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200 text-brand-900 text-xs flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
        <span>
          <strong>Cryptographic Integrity:</strong> All cast votes are secured by unique database constraints. In accordance with system regulations, cast votes cannot be modified or withdrawn.
        </span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading your vote transactions...</div>
      ) : myVotes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 max-w-md mx-auto">
          <Vote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">You haven't cast any votes yet</p>
          <p className="text-xs text-slate-400 mt-1">Visit the voting booth to vote for your preferred finalists.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myVotes.map((v) => (
            <div
              key={v.categoryId}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200 inline-block">
                  {v.categoryName}
                </span>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Selected Finalist: {v.nomineeName}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Recorded: {new Date(v.castAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
