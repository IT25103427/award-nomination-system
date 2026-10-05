import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trophy, Award, Calendar, Sparkles, Building, Hash, ThumbsUp } from 'lucide-react';

export const PublicWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const res = await api.get('/results/published');
      setWinners(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex p-3 rounded-2xl bg-gold-50 text-gold-600 mb-3 shadow-sm border border-gold-200">
          <Trophy className="w-8 h-8 text-gold-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Official Award Winners Gallery
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Celebrating excellence, innovation, and leadership. These award recipients were nominated by peers, vetted by the committee, and elected through community balloting.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading published award recipients...</div>
      ) : winners.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Winners Announced Yet</h3>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            The voting and independent audit period is currently active. Official award winners will be published here once the Results Verification Officer and Program Manager conclude the cycle.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {winners.map((w) => (
            <div
              key={w.categoryId}
              className="bg-white rounded-3xl border border-gold-200/80 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Gold header */}
                <div className="bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 p-5 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold-100 block">
                      Award Category
                    </span>
                    <h3 className="text-lg font-extrabold tracking-tight drop-shadow-sm">
                      {w.categoryName}
                    </h3>
                  </div>
                  <Sparkles className="w-6 h-6 text-gold-200 group-hover:rotate-12 transition-transform" />
                </div>

                {/* Nominee details */}
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5">
                      Ref: {w.referenceNumber}
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {w.nomineeName}
                    </h4>
                    {w.nomineeOrg && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {w.nomineeOrg}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{w.justification}"
                  </p>
                </div>
              </div>

              {/* Card Footer: Vote Count & Date */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 text-brand-700 font-bold">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{w.voteCount} Verified Votes</span>
                </div>
                {w.publishedAt && (
                  <span className="text-[10px] text-slate-400">
                    {new Date(w.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
