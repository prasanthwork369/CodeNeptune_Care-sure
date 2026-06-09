import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useBottomInset = (extra = 0) => {
    const { bottom } = useSafeAreaInsets();
    return bottom + extra;
};
