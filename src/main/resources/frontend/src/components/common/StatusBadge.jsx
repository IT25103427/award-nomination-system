import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'APPROVED':
      case 'VERIFIED':
      case 'OPEN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PENDING':
      case 'SCHEDULED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'REJECTED':
      case 'DISCREPANCY':
      case 'CLOSED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'WITHDRAWN':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      case 'WON':
      case 'PUBLISHED':
        return 'bg-gold-100 text-gold-800 border-gold-400 font-semibold';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}>
      {normalized}
    </span>
  );
};
