import React from 'react';
import { useUIStore } from '@/src/store/uiStore';
import { AlertDialog } from '@/src/components/ui/AlertDialog';

export const GlobalAlertDialog = () => {
  const globalAlert = useUIStore((s) => s.globalAlert);
  const setGlobalAlert = useUIStore((s) => s.setGlobalAlert);

  if (!globalAlert) return null;

  return (
    <AlertDialog
      visible={true}
      onClose={() => setGlobalAlert(null)}
      icon={globalAlert.icon}
      title={globalAlert.title}
      buttons={globalAlert.buttons}
    />
  );
};
