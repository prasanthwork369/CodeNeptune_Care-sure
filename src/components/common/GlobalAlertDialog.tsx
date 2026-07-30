import React from "react";
import { useUIStore } from "@/src/store/uiStore";
import { ConfirmModal } from "@/src/components/ui/ConfirmModal";

export const GlobalAlertDialog = () => {
  const globalAlert = useUIStore((s) => s.globalAlert);

  if (!globalAlert) return null;

  return (
    <ConfirmModal
      visible={true}
      title={globalAlert.title}
      message={globalAlert.message}
      icon={globalAlert.icon}
      iconBg={globalAlert.iconBg}
      confirmBg={globalAlert.confirmBg}
      cancelLabel={globalAlert.cancelLabel}
      confirmLabel={globalAlert.confirmLabel}
      onCancel={globalAlert.onCancel}
      onConfirm={globalAlert.onConfirm}
    />
  );
};
