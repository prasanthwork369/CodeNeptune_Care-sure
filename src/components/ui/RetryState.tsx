import React from "react";
import { Text, View } from "react-native";
import { AppButton } from "./AppButton";
import { styles as s } from "./RetryState.styles";

interface RetryStateProps {
  onRetry: () => void;
  title?: string;
  message?: string;
  retrying?: boolean;
}

export const RetryState: React.FC<RetryStateProps> = ({
  onRetry,
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  retrying = false,
}) => (
  <View style={s.container}>
    <Text style={s.titleText}>
      {title}
    </Text>
    <Text style={s.messageText}>
      {message}
    </Text>
    <AppButton
      title="Retry"
      size="sm"
      loading={retrying}
      onPress={onRetry}
      style={s.button}
      accessibilityHint="Attempts to load the content again"
    />
  </View>
);
