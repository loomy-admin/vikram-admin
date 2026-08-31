import React from 'react';
import { TopCenterConfirmModal } from './TopCenterConfirmModal';

export { TopCenterConfirmModal };

interface ConfirmDialogProps {
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

export const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  return <TopCenterConfirmModal {...props} />;
};
