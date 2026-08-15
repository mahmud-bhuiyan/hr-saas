import type { ReactNode } from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingText?: string;
  confirmVariant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
}

export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  loadingText,
  confirmVariant = "primary",
  size = "sm",
}: ConfirmModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            loading={loading}
            loadingText={loadingText ?? confirmLabel}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {children}
    </Modal>
  );
};
