import { openLegalLink } from "@/src/utils/browser";
import React, { useEffect } from "react";

// ─── Component ────────────────────────────────────────────────────────────────

interface PolicyLinkProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  url?: string;
}

export const PolicyLink: React.FC<PolicyLinkProps> = ({
  isVisible,
  onClose,
  url,
}) => {
  useEffect(() => {
    if (!isVisible || !url) return;

    let active = true;
    void openLegalLink(url).then(
      () => {
        if (active) onClose();
      },
      () => {
        if (active) onClose();
      },
    );

    return () => {
      active = false;
    };
  }, [isVisible, url, onClose]);

  return null;
};
