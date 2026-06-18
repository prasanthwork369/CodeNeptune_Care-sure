import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        marginTop: scale(10),
        rowGap: scale(12),
    },
    box: {
        width: '48%',
        height: moderateScale(70, 0.3),
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#919EAB33',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(12, 0.3),
        gap: moderateScale(12, 0.3),
        shadowColor: '#919EAB',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        shadowOpacity: 0.04,
        elevation: 1,
    },
    iconBox: {
        width: moderateScale(36, 0.3),
        height: moderateScale(36, 0.3),
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconImg: {
        width: moderateScale(20, 0.3),
        height: moderateScale(20, 0.3),
    },
    label: {
        flex: 1,
        fontFamily: 'Inter-SemiBold',
        fontSize: moderateScale(14, 0.3),
        color: '#0F172A',
        lineHeight: moderateScale(20, 0.3),
        verticalAlign: 'middle',
    },
});
