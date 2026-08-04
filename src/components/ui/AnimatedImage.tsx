import { Image } from "expo-image";
import Animated from "react-native-reanimated";

// expo-image downsamples to the view size; RN's Image decodes the full bitmap,
// which is ~48MB for a 12MP prescription capture.
export const AnimatedImage = Animated.createAnimatedComponent(Image);
