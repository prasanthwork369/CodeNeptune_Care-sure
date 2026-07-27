import { moderateScale } from "@/src/utils/exactScale";
import React from "react";
import {
  KeyboardTypeOptions,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { RequiredMark } from "./RequiredMark";

type FormFieldVariant = "outline" | "boxed";

// Opaque green so the caret is always visible. A translucent selectionColor
// makes the cursor invisible: on iOS the caret and selection share this color,
// and on older Android (e.g. Android 10) selectionColor also tints the cursor
// drawable, overriding cursorColor. The caret must stay opaque; the selection
// highlight being solid green is acceptable.
const SELECTION_COLOR = "#0F7635";

// Android tints the drag handle with selectionColor unless this is given, so the
// dark green read as a heavy blob. A lighter brand green keeps it legible.
const SELECTION_HANDLE_COLOR = "#16A34A";

export type FormFieldProps = {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  error?: string;
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  onLayout?: (y: number) => void;
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  importantForAutofill?:
    | "auto"
    | "no"
    | "noExcludeDescendants"
    | "yes"
    | "yesExcludeDescendants";
  rightSlot?: React.ReactNode;
  variant?: FormFieldVariant;
  required?: boolean;
};

// Two visual variants preserved from the layouts this was extracted from:
// - "outline": border directly on the TextInput, used by AddAddressLayout
//   (supports focus-chaining refs/onSubmitEditing/onLayout for scroll-to-field).
// - "boxed": input wrapped in a fixed-height bordered box that can also hold
//   a rightSlot (e.g. a "Verify" button) and a disabled/read-only appearance,
//   used by MyProfileLayout.
export const FormField = React.forwardRef<TextInput, FormFieldProps>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      editable = true,
      keyboardType = "default",
      maxLength,
      error,
      returnKeyType = "next",
      onSubmitEditing,
      onFocus,
      onLayout,
      autoComplete = "off",
      textContentType = "none",
      importantForAutofill = "no",
      rightSlot,
      variant = "outline",
      required = false,
    },
    ref,
  ) => {
    if (variant === "boxed") {
      return (
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: moderateScale(13),
              fontWeight: "600",
              color: "#222222",
              marginBottom: 6,
            }}
          >
            {label}
            {required && <RequiredMark />}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: editable ? "#FFFFFF" : "#F5F6FB",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E8E8E8",
              paddingHorizontal: 14,
              minHeight: 48,
            }}
          >
            <TextInput
              ref={ref}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="#6A6A6A"
              editable={editable}
              keyboardType={keyboardType}
              // Explicit caret/selection colors — some OEM keyboards/themes
              // render the default caret invisible against the white field.
              cursorColor="#0F7635"
              selectionColor={SELECTION_COLOR}
              caretHidden={false}
              // Vertical padding (not a fixed height) sizes the field so the
              // caret has room to draw — a height-constrained input clips the
              // blinking caret on Android 10. The padded area stays the tap target.
              style={{
                flex: 1,
                paddingVertical: 12,
                fontSize: moderateScale(14),
                color: editable ? "#111827" : "#637381",
                paddingLeft: 0,
                // With a rightSlot the flex:1 input ends flush against the badge,
                // so a caret at the end of a long value lands on the clip edge and
                // never paints. This gutter keeps it inside the drawable bounds.
                paddingRight: rightSlot ? 10 : 0,
              }}
            />
            {rightSlot}
          </View>
          {error ? (
            <Text
              style={{
                fontSize: moderateScale(12),
                fontWeight: "500",
                color: "#EF4444",
                marginTop: 4,
              }}
            >
              {error}
            </Text>
          ) : null}
        </View>
      );
    }

    return (
      <View
        className="mb-5"
        onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}
      >
        <Text
          style={{
            fontSize: moderateScale(13),
            fontWeight: "600",
            color: "#222222",
            marginBottom: 8,
          }}
        >
          {label}
          {required && <RequiredMark />}
        </Text>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6A6A6A"
          keyboardType={keyboardType}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          submitBehavior={returnKeyType === "done" ? "blurAndSubmit" : "submit"}
          // Explicit caret/selection colors so the cursor is visible on all
          // devices (some OEM themes render the default caret invisible).
          cursorColor="#0F7635"
          selectionColor={SELECTION_COLOR}
          selectionHandleColor={SELECTION_HANDLE_COLOR}
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          importantForAutofill={importantForAutofill}
          onFocus={onFocus}
          className="bg-white rounded-[8px] px-4 py-[14px] font-inter-regular text-[#1A1C1E]"
          style={{
            fontSize: moderateScale(15),
            borderWidth: 1,
            borderColor: error ? "#EF4444" : "#E8E8E8",
          }}
        />
        {error ? (
          <Text
            style={{
              fontSize: moderateScale(12),
              fontWeight: "500",
              color: "#EF4444",
              marginTop: 4,
            }}
          >
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);
FormField.displayName = "FormField";
