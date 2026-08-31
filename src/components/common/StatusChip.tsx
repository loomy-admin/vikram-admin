import React from 'react';
import { SchoolStatus, StudentStatus, AccessCodeStatus, ContentStatus, AdminStatus } from '../../types';

type AnyStatus = SchoolStatus | StudentStatus | AccessCodeStatus | ContentStatus | AdminStatus | string;

interface StatusChipProps {
  status: AnyStatus;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let label = status;

  switch (normalized) {
    case 'ACTIVE':
    case 'VISIBLE':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      dotColor = 'bg-emerald-500';
      label = normalized === 'VISIBLE' ? 'Visible' : 'Active';
      break;
    case 'UNUSED':
      styles = 'bg-sky-50 text-sky-700 border-sky-200/80';
      dotColor = 'bg-sky-500';
      label = 'Unused';
      break;
    case 'USED':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      dotColor = 'bg-emerald-500';
      label = 'Used';
      break;
    case 'PENDING':
      styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
      dotColor = 'bg-amber-500';
      label = 'Pending';
      break;
    case 'INACTIVE':
    case 'HIDDEN':
      styles = 'bg-slate-100 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      label = normalized === 'HIDDEN' ? 'Hidden' : 'Inactive';
      break;
    default:
      styles = 'bg-slate-100 text-slate-700 border-slate-200';
      dotColor = 'bg-slate-400';
      label = status;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${styles} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};
