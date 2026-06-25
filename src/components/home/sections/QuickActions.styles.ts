import { moderateScale } from "react-native-size-matters";
import { StyleSheet } from 'react-native';
import { exactScale } from "@/src/utils/exactScale";

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
        height: exactScale(70),
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#919EAB33',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        padding: exactScale(12),
        gap: exactScale(12),
        shadowColor: '#919EAB',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        shadowOpacity: 0.04,
        elevation: 1,
    },
    iconBox: {
        width: exactScale(36),
        height: exactScale(36),
        borderRadius: 4,
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
        fontSize: moderateScale(14, 0.3),
        color: '#0F172A',
        lineHeight: moderateScale(20, 0.3),
        verticalAlign: 'middle',
    },
});
