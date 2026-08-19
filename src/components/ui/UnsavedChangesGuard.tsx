import { ConfirmModal } from "@/src/components/ui/ConfirmModal";
import { useNavigation } from "expo-router";
import {
  NavigationAction,
  usePreventRemove,
} from "expo-router/react-navigation";
import React, { useEffect, useRef, useState } from "react";

interface UnsavedChangesGuardProps {
  hasUnsavedChanges: boolean;
}

/** Modal confirmation guard for unsaved changes on navigation exit */
export const UnsavedChangesGuard: React.FC<UnsavedChangesGuardProps> = ({
  hasUnsavedChanges,
}) => {
  const navigation = useNavigation();
  const pendingAction = useRef<NavigationAction | null>(null);
  const [visible, setVisible] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  usePreventRemove(hasUnsavedChanges && !discarding, ({ data }) => {
    pendingAction.current = data.action;
    setVisible(true);
  });

  useEffect(() => {
    if (!discarding || !pendingAction.current) return;
    const action = pendingAction.current;
    pendingAction.current = null;
    navigation.dispatch(action);
  }, [discarding, navigation]);

  return (
    <ConfirmModal
      visible={visible}
      title="Discard changes?"
      message="Your unsaved changes will be lost if you leave this page."
      confirmLabel="Discard"
      cancelLabel="Keep Editing"
      showConfirmIcon={false}
      onCancel={() => {
        pendingAction.current = null;
        setVisible(false);
      }}
      onConfirm={() => {
        setVisible(false);
        setDiscarding(true);
      }}
    />
  );
};
