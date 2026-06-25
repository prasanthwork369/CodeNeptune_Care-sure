import { StyleSheet } from 'react-native';
import { exactScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
    label: {
        fontWeight: '500',
        fontSize: exactScale(14),
        lineHeight: exactScale(20),
        letterSpacing: 0,
        textAlign: 'left',
        verticalAlign: 'middle',
        color: '#0F1724',
    },
    icon: {
        width: exactScale(20),
        height: exactScale(18),
        top: exactScale(1.21),
        left: exactScale(0.67),
        opacity: 1,
    },
});
