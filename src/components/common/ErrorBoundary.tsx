import { reportError } from "@/src/services/firebase";
import { AppButton } from "@/src/components/ui/AppButton";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    reportError(error, "render-error-boundary");
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            We could not open this screen. Please try again.
          </Text>
          <AppButton
            title="Try Again"
            size="sm"
            onPress={this.handleRetry}
            style={styles.retryButton}
            accessibilityHint="Attempts to open the app again"
          />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F6FB",
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6A6A6A",
    textAlign: "center",
  },
  retryButton: {
    width: 140,
    marginTop: 20,
  },
});
