import type { ImageSource } from "expo-image";
import React from "react";
import { ConfirmModal } from "@/src/components/ui/ConfirmModal";

/** Prescription-specific confirm modal — thin wrapper over ConfirmModal with domain defaults. */
interface RemoveConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: ImageSource;
  iconBg?: string;
  confirmBg?: string;
}

export const RemoveConfirmModal: React.FC<RemoveConfirmModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  title = "Remove Prescription",
  message = "Are you sure you want to remove this prescription from your list?",
  confirmLabel = "Remove",
  cancelLabel = "Cancel",
  icon,
  iconBg = "#FDEAEA",
  confirmBg = "#C22923",
}) => (
  <ConfirmModal
    visible={visible}
    onConfirm={onConfirm}
    onCancel={onCancel}
    title={title}
    message={message}
    confirmLabel={confirmLabel}
    cancelLabel={cancelLabel}
    icon={icon}
    iconBg={iconBg}
    confirmBg={confirmBg}
  />
);
