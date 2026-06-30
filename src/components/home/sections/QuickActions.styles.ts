import { StyleSheet } from 'react-native';
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { typography } from "@/src/constants/typography";

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: exactScale(16),
        marginTop: exactScale(10),
        rowGap: exactScale(12),
    },
    box: {
        width: '48%',
        minHeight: exactScale(70),
        borderRadius: exactScale(6),
        borderWidth: 1,
        borderColor: '#919EAB33',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        padding: exactScale(12),
        gap: exactScale(12),
    },
    iconBox: {
        width: exactScale(36),
        height: exactScale(36),
        borderRadius: exactScale(4),
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconImg: {
        width: exactScale(20),
        height: exactScale(20),
    },
    label: {
        flex: 1,
        fontWeight: '600',
        fontSize: typography.body.fontSize,
        color: '#0F172A',
        lineHeight: typography.body.lineHeight,
        verticalAlign: 'middle',
    },
});
