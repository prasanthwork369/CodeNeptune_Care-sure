import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {}

/**
 * A reusable Text component that wraps the globally-patched React Native Text.
 * All default text properties, font scaling limits, and native font/weight overrides
 * are automatically inherited from the global patch.
 */
export const Text = React.forwardRef<RNText, TextProps>((props, ref) => {
  return <RNText ref={ref} {...props} />;
});

Text.displayName = 'Text';


