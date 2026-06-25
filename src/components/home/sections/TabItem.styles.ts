import { StyleSheet } from 'react-native';
import { exactScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
    iconWrap: { width: exactScale(40), height: exactScale(40) },
    icon: { width: exactScale(28), height: exactScale(28) },
    emoji: { fontSize: exactScale(28) },
    label: { fontSize: exactScale(13) },
});
