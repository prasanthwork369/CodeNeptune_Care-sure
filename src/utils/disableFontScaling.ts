import { TextInput } from 'react-native';

// Text scaling is already forced off inside patchText.ts (every render passes
// allowFontScaling={false} explicitly). TextInput has no equivalent patch, so it's
// disabled here via defaultProps instead.
interface TextInputWithDefaultProps extends TextInput {
  defaultProps?: { allowFontScaling?: boolean };
}

export function disableTextInputFontScaling() {
  const TextInputWithDefaults = TextInput as unknown as TextInputWithDefaultProps;
  TextInputWithDefaults.defaultProps = TextInputWithDefaults.defaultProps || {};
  TextInputWithDefaults.defaultProps!.allowFontScaling = false;
}
