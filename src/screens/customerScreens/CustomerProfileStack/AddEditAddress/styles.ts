import { StyleSheet } from 'react-native';
import { colors, fonts, fontSize, scale, verticalScale } from '../../../../constants';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.purple[50]
    },
    header: {
        minHeight: verticalScale(56),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(8),
        backgroundColor: colors.white[100],
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.purple[200]
    },
    headerButton: {
        width: scale(44),
        height: verticalScale(44),
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontFamily: fonts.SemiBold,
        fontSize: fontSize[16],
        color: colors.black[250]
    },
    profileIcon: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.purple[600]
    },
    content: {
        padding: scale(16),
        paddingBottom: scale(32),
        gap: scale(16)
    },
    fieldCard: {
        padding: scale(14),
        borderRadius: scale(14),
        backgroundColor: colors.white[100],
        gap: scale(8),
        shadowColor: colors.black[400],
        shadowOpacity: 0.04,
        shadowRadius: scale(3),
        elevation: 1
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    label: {
        fontFamily: fonts.SemiBold,
        fontSize: fontSize[12],
        color: colors.grey[700]
    },
    required: {
        fontFamily: fonts.SemiBold,
        fontSize: fontSize[11],
        color: colors.purple[700]
    },
    helper: {
        fontFamily: fonts.Regular,
        fontSize: fontSize[11],
        color: colors.grey[700]
    },
    textAreaWrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: scale(8),
        padding: scale(11),
        minHeight: verticalScale(94),
        borderRadius: scale(10),
        backgroundColor: colors.purple[50]
    },
    textArea: {
        flex: 1,
        minHeight: verticalScale(70),
        padding: scale(0),
        fontFamily: fonts.Regular,
        fontSize: fontSize[14],
        lineHeight: verticalScale(20),
        color: colors.black[250]
    },
    zipWrap: {
        height: verticalScale(48),
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        paddingHorizontal: scale(11),
        borderRadius: scale(10),
        backgroundColor: colors.purple[50]
    },
    zipInput: {
        flex: 1,
        padding: scale(0),
        fontFamily: fonts.Regular,
        fontSize: fontSize[14],
        color: colors.black[250],
        letterSpacing: 1
    },
    validBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(3),
        paddingHorizontal: scale(7),
        paddingVertical: scale(4),
        borderRadius: scale(12),
        backgroundColor: colors.purple[200]
    },
    validText: {
        fontFamily: fonts.SemiBold,
        fontSize: fontSize[10],
        color: colors.purple[700]
    },
    defaultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        padding: scale(14),
        borderRadius: scale(14),
        backgroundColor: colors.white[100],
        shadowColor: colors.black[400],
        shadowOpacity: 0.04,
        shadowRadius: scale(3),
        elevation: 1
    },
    defaultIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.purple[200]
    },
    defaultCopy: {
        flex: 1
    },
    defaultTitle: {
        fontFamily: fonts.SemiBold,
        fontSize: fontSize[14],
        color: colors.black[250],
        marginBottom: scale(3)
    },
    saveButton: {
        height: verticalScale(48),
        borderRadius: scale(11),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(7),
        backgroundColor: colors.purple[700],
        marginTop: scale(4)
    },
    disabledButton: {
        opacity: 0.65
    },
    saveText: {
        fontFamily: fonts.SemiBold,
        fontSize: fontSize[14],
        color: colors.white[100]
    },
});
