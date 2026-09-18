import { useEffect, useRef, useState } from "react";
import { AppGateScreen } from "@/src/components/common/AppGateScreen";
import { SoftUpdateModal } from "@/src/components/common/SoftUpdateModal";
import { UpdateReadyBanner } from "@/src/components/common/UpdateReadyBanner";
import { useAppGate } from "@/src/hooks/system/useAppGate";
import { useInAppUpdate } from "@/src/hooks/system/useInAppUpdate";
import { useOtaUpdate } from "@/src/hooks/system/useOtaUpdate";
import { useSoftUpdate } from "@/src/hooks/system/useSoftUpdate";
import { analyticsService } from "@/src/services/firebase";

export const AppGate = () => {
  const { reason, maintenanceMessage } = useAppGate();
  const soft = useSoftUpdate();
  const update = useInAppUpdate();
  const ota = useOtaUpdate();
  const acceptedRef = useRef(false);
  const [immediateFailed, setImmediateFailed] = useState(false);

  useEffect(() => {
    if (reason) analyticsService.logAppBlocked(reason);
  }, [reason]);

  useEffect(() => {
    if (soft.shouldPrompt) analyticsService.logSoftUpdatePrompt("shown");
  }, [soft.shouldPrompt]);

  useEffect(() => {
    if (reason !== "update" || !update.isSupported) return;
    update.runImmediateUpdate().then((ok) => setImmediateFailed(!ok));
  }, [reason, update.isSupported]); // eslint-disable-line react-hooks/exhaustive-deps

  if (reason) {
    return (
      <AppGateScreen
        reason={reason}
        maintenanceMessage={maintenanceMessage}
        onUpdatePress={
          update.isSupported
            ? () => {
                update
                  .runImmediateUpdate()
                  .then((ok) => setImmediateFailed(!ok));
              }
            : undefined
        }
        updateLabel={immediateFailed ? "Retry" : undefined}
      />
    );
  }

  return (
    <>
      <SoftUpdateModal
        visible={soft.shouldPrompt}
        latestVersion={soft.latestVersion}
        onDismiss={() => {
          if (!acceptedRef.current) {
            analyticsService.logSoftUpdatePrompt("dismissed");
          }
          acceptedRef.current = false;
          soft.dismiss();
        }}
        onUpdate={() => {
          acceptedRef.current = true;
          analyticsService.logSoftUpdatePrompt("accepted");
          update.runFlexibleUpdate();
        }}
      />
      <UpdateReadyBanner
        visible={update.isDownloaded || ota.isDownloaded}
        onRestart={
          update.isDownloaded ? update.restartAndInstall : ota.restartAndInstall
        }
      />
    </>
  );
};
