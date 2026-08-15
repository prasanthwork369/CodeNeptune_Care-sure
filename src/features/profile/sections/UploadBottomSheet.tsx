import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { UploadSheetOptions } from "./UploadSheetOptions";

interface UploadBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
}

const UploadBottomSheet: React.FC<UploadBottomSheetProps> = ({
  visible,
  onClose,
  onSelectCamera,
  onSelectLibrary,
}) => {
  const adjustedBottom = useAdjustedBottomInset();

  return (
    <GorhomBottomSheet
      isVisible={visible}
      onClose={onClose}
      backgroundStyle={{
        backgroundColor: "#F5F5F7",
        borderTopLeftRadius: exactScale(12),
        borderTopRightRadius: exactScale(12),
      }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: exactScale(20),
          paddingTop: exactScale(12),
          paddingBottom: Math.max(adjustedBottom, exactScale(24)),
        }}
      >
        <UploadSheetOptions
          onSelectCamera={onSelectCamera}
          onSelectLibrary={onSelectLibrary}
          onCancel={onClose}
        />
      </BottomSheetView>
    </GorhomBottomSheet>
  );
};

export default UploadBottomSheet;
