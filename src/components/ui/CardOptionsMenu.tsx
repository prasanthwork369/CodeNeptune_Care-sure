import React, { useRef } from "react";
import {
  Modal,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";

export interface CardOptionsMenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  rowStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  dividerStyle?: StyleProp<ViewStyle>;
}

interface CardOptionsMenuProps {
  items: CardOptionsMenuItem[];
  onClose: () => void;
  popoverStyle: StyleProp<ViewStyle>;
  backdropStyle?: StyleProp<ViewStyle>;
  /** Wraps the menu in a transparent RN Modal instead of an inline absolute overlay. */
  useModal?: boolean;
  modalVisible?: boolean;
  modalWrapperStyle?: StyleProp<ViewStyle>;
}

const defaultBackdropStyle: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const MenuContent: React.FC<
  Pick<
    CardOptionsMenuProps,
    "items" | "onClose" | "popoverStyle" | "backdropStyle"
  >
> = ({ items, onClose, popoverStyle, backdropStyle }) => (
  <>
    <Touchable
      activeOpacity={1}
      onPress={onClose}
      style={[defaultBackdropStyle, backdropStyle]}
    />
    <View style={popoverStyle}>
      {items.map((item) => (
        <React.Fragment key={item.key}>
          {item.dividerStyle && <View style={item.dividerStyle} />}
          <Touchable
            activeOpacity={0.7}
            onPress={item.onPress}
            style={item.rowStyle}
          >
            {item.icon}
            <Text style={item.textStyle}>{item.label}</Text>
          </Touchable>
        </React.Fragment>
      ))}
    </View>
  </>
);

/**
 * Shared tap-away popover for card "3-dot" menus (e.g. prescription/order
 * cards, notification rows). Callers own the visual styling (popoverStyle,
 * per-item rowStyle/textStyle) so each usage can match its own design
 * exactly, while this component owns the positioning/tap-away/render shape.
 */
export const CardOptionsMenu: React.FC<CardOptionsMenuProps> = ({
  items,
  onClose,
  popoverStyle,
  backdropStyle,
  useModal,
  modalVisible,
  modalWrapperStyle,
}) => {
  // Null until first opened, so hidden rows don't each mount a native Modal.
  const hasOpened = useRef(false);
  if (modalVisible) hasOpened.current = true;

  if (useModal) {
    if (!modalVisible && !hasOpened.current) return null;
    return (
      <Modal
        transparent
        visible={!!modalVisible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={modalWrapperStyle ?? { flex: 1 }}>
          <MenuContent
            items={items}
            onClose={onClose}
            popoverStyle={popoverStyle}
            backdropStyle={backdropStyle}
          />
        </View>
      </Modal>
    );
  }

  return (
    <MenuContent
      items={items}
      onClose={onClose}
      popoverStyle={popoverStyle}
      backdropStyle={backdropStyle}
    />
  );
};
