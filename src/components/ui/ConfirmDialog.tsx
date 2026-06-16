import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BigButton } from './BigButton';

interface ConfirmDialogProps {
  message: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  message,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return createPortal(
    <div
      className="dialog-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <BigButton variant={confirmVariant} onClick={onConfirm}>
          {confirmLabel}
        </BigButton>
        <BigButton variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </BigButton>
      </div>
    </div>,
    document.body,
  );
}
