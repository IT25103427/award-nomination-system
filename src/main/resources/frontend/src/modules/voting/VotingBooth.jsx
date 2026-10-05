import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Vote, CheckCircle2, Lock, AlertCircle, Building, FileText, Trophy, Clock } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const VotingBooth = ({ setGlobalToast }) => {
  const { user } = useAuth();
  const [ballotCategories, setBallotCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vote confirmation modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  const [casting, setCasting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBallot();
  }, []);

  const fetchBallot = async () => {
    setLoading(true);
    try {
      const res = await api.get('/voting/ballot');
      setBallotCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openVoteConfirm = (category, candidate) => {
    setSelectedCat(category);
    setSelectedCandidate(candidate);
    setError('');
    setConfirmModalOpen(true);
  };

  const handleCastVote = async () => {
    if (!selectedCat || !selectedCandidate) return;

    setCasting(true);
    setError('');
    try {
      await api.post('/voting/cast', {
        categoryId: selectedCat.categoryId,
        nominationId: selectedCandidate.nominationId,
      });

      if (setGlobalToast) {
        setGlobalToast({
          message: `Your vote for ${selectedCandidate.nomineeName} in '${selectedCat.categoryName}' has been securely cast and locked!`,
          type: 'success',
        });
      }
      setConfirmModalOpen(false);
      fetchBallot();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setCasting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Official Voting Booth</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Browse approved finalists in each category and cast your ballot. Exactly one vote per category is permitted and votes cannot be altered once recorded.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading your ballot...</div>
      ) : ballotCategories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 max-w-md mx-auto">
          <Vote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No active categories available</p>
        </div>
      ) : (
        <div className="space-y-8">
          {ballotCategories.map((cat) => {
            const isClosed = !cat.votingOpen;
            const alreadyVoted = cat.hasVoted;

            return (
              <div
                key={cat.categoryId}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Category Header */}
                <div className="p-6 sm:p-7 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs shadow-sm">
                        <Trophy className="w-4 h-4 text-gold-300" />
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900">{cat.categoryName}</h2>
                    </div>
                    {cat.categoryDescription && (
                      <p className="text-xs text-slate-500 max-w-2xl">{cat.categoryDescription}</p>
                    )}
                  </div>

                  {/* Status Indicator for Category */}
                  <div>
                    {alreadyVoted ? (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Voted: {cat.votedNomineeName}</span>
                      </div>
                    ) : isClosed ? (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold">
                        <Lock className="w-4 h-4 text-slate-500" />
                        <span>Voting Closed</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 border border-brand-300 text-xs font-bold animate-pulse">
                        <Clock className="w-4 h-4 text-brand-600" />
                        <span>Voting Open (1 Vote Left)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approved Nominee Cards */}
                <div className="p-6 sm:p-7">
                  {cat.nominees.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      No candidates approved by committee yet for this award.
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {cat.nominees.map((candidate) => {
                        const isThisCandidateVoted = cat.votedNominationId === candidate.nominationId;

                        return (
                          <div
                            key={candidate.nominationId}
                            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                              isThisCandidateVoted
                                ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-400'
                                : 'border-slate-200 bg-white hover:border-brand-300'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="text-base font-bold text-slate-900">
                                    {candidate.nomineeName}
                                  </h3>
                                  {candidate.nomineeOrg && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                      <Building className="w-3.5 h-3.5 text-slate-400" />
                                      {candidate.nomineeOrg}
                                    </p>
                                  )}
                                </div>
                                {isThisCandidateVoted && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                                    YOUR PICK
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                                "{candidate.justification}"
                              </p>
                            </div>

                            {/* Vote Action */}
                            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400">
                                {candidate.documents?.length > 0 ? `${candidate.documents.length} Attachment(s)` : ''}
                              </span>

                              {alreadyVoted ? (
                                <button
                                  disabled
                                  className="px-4 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed flex items-center gap-1.5"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  Ballot Locked
                                </button>
                              ) : isClosed ? (
                                <button
                                  disabled
                                  className="px-4 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed"
                                >
                                  Window Closed
                                </button>
                              ) : (
                                <button
                                  onClick={() => openVoteConfirm(cat, candidate)}
                                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                                >
                                  <Vote className="w-3.5 h-3.5" />
                                  Vote for Candidate
                                </button>
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
          })}
        </div>
      )}

      {/* Vote Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Your Official Vote"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <p>
              <strong className="text-slate-700">Award Category:</strong>{' '}
              <span className="font-semibold text-brand-700">{selectedCat?.categoryName}</span>
            </p>
            <p>
              <strong className="text-slate-700">Selected Nominee:</strong>{' '}
              <span className="font-bold text-slate-900 text-sm block mt-0.5">
                {selectedCandidate?.nomineeName}
              </span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Strict Single Vote Rule:</strong> Once your vote is cast, it will be cryptographically locked and stored permanently. You cannot change or re-cast your vote in this category.
            </p>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleCastVote}
              disabled={casting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Vote className="w-4 h-4" />
              {casting ? 'Recording Ballot...' : 'Confirm & Cast Vote'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
