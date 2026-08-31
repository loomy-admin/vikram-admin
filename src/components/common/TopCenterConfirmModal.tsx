import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface TopCenterConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const TopCenterConfirmModal: React.FC<TopCenterConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const btnVariants = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
    primary: 'bg-[#0f53b4] hover:bg-[#0d479a] text-white shadow-xs',
  };

  const iconBgVariants = {
    danger: 'bg-rose-50 text-rose-600 border-rose-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    primary: 'bg-[#e8f2ff] text-[#0f53b4] border-[#c8def5]',
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12335f]/40 backdrop-blur-xs flex items-start justify-center pt-14 sm:pt-16 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#dcebf9] shadow-[0_22px_60px_rgba(18,51,95,0.18)] max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${iconBgVariants[confirmVariant]}`}>
              <AlertTriangle className="w-5 h-5 shrink-0" />
            </div>
            <h3 className="text-base font-bold text-[#12335f]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-slate-400 hover:text-[#12335f] hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Body */}
        <div className="text-sm text-[#60728a] leading-relaxed">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-[#0f53b4] bg-white border border-[#c8def5] hover:bg-[#f0f7ff] rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer ${btnVariants[confirmVariant]}`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
