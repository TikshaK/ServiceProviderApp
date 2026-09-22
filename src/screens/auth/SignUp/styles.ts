import { StyleSheet } from 'react-native';
import { colors, fonts, images, fontSize, scale, verticalScale, strings } from '../../../constants';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.purple[50]
    },
    header: {
        height: verticalScale(64),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        backgroundColor: colors.purple[50],
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.purple[200],
    },
    backButton: {
        width: scale(44),
        height: scale(44),
        alignItems: 'center',
        justifyContent: 'center'
    },
    backIcon: {
        fontFamily: fonts.Regular,
        color: colors.black[250],
        fontSize: fontSize[34],
        lineHeight: verticalScale(36),
        fontWeight: '300'
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        marginRight: 'auto'
    },
    headerLogo: {
        width: scale(28),
        height: scale(28)

    },
    brandName: {
        fontFamily: fonts.Bold,
        color: colors.black[250],
        fontSize: fontSize[16],
        fontWeight: '700'
    },
    headerTitle: {
        maxWidth: scale(150),
        marginLeft: 'auto',
        marginRight: scale(12),
        fontFamily: fonts.Medium,
        color: colors.grey[700],
        fontSize: fontSize[13],
        fontWeight: '500',
    },
    profileCircle: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.purple[700]
    },
    profileIcon: {
        color: colors.white[100],
        fontSize: fontSize[12]
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(24)
    },
    intro: {
        alignItems: 'center',
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(20)
    },
    logoFrame: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(16),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.purple[200],
        marginBottom: verticalScale(16)
    },
    logo: {
        width: scale(40),
        height: scale(40)
    },
    heading: {
        fontFamily: fonts.Bold,
        color: colors.black[250],
        fontSize: fontSize[26],
        lineHeight: verticalScale(34),
        fontWeight: '700'
    },
    subheading: {
        maxWidth: scale(300),
        fontFamily: fonts.Regular,
        color: colors.grey[700],
        fontSize: fontSize[14],
        lineHeight: verticalScale(20),
        textAlign: 'center',
        marginTop: verticalScale(4)
    },
    form: {
        gap: verticalScale(14)
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: scale(10),
        marginTop: verticalScale(2)
    },
    checkbox: {
        width: scale(18),
        height: scale(18),
        borderRadius: scale(4),
        borderWidth: scale(1),
        borderColor: colors.grey[450],
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(1)
    },
    checkedBox: {
        backgroundColor: colors.purple[600],
        borderColor: colors.purple[600]
    },
    checkboxMark: {
        fontFamily: fonts.Bold,
        color: colors.white[100],
        fontSize: fontSize[13],
        lineHeight: verticalScale(16),
        fontWeight: '700'
    },
    termsText: {
        flex: 1,
        fontFamily: fonts.Regular,
        color: colors.grey[700],
        fontSize: fontSize[13],
        lineHeight: 18
    },
    validationError: {
        fontFamily: fonts.Regular,
        color: colors.red[200],
        fontSize: fontSize[12],
        marginTop: verticalScale(-8),
    },
    linkText: {
        fontFamily: fonts.SemiBold,
        color: colors.purple[700],
        fontWeight: '600'
    },
    submitButton: {
        height: verticalScale(48),
        borderRadius: scale(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
        backgroundColor: colors.purple[600],
        marginTop: verticalScale(4),
        shadowColor: colors.purple[700],
        shadowOffset: { width: scale(0), height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: scale(8),
        elevation: 3
    },
    pressedButton: {
        opacity: 0.86
    },
    submitText: {
        fontFamily: fonts.SemiBold,
        color: colors.white[100],
        fontSize: fontSize[14],
        lineHeight: verticalScale(20),
        fontWeight: '600'
    },
    submitArrow: {
        fontFamily: fonts.Regular,
        color: colors.white[100],
        fontSize: fontSize[20],
        lineHeight: 20
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(6),
        paddingTop: verticalScale(28),
        paddingBottom: verticalScale(16)
    },
    footerPrompt: {
        fontFamily: fonts.Regular,
        color: colors.grey[700],
        fontSize: fontSize[14],
        lineHeight: 20
    },
    signInText: {
        fontFamily: fonts.SemiBold,
        color: colors.purple[700],
        fontSize: fontSize[14],
        lineHeight: verticalScale(20),
        fontWeight: '600'
    },
    trustBadge: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(5),
        borderRadius: scale(20),
        backgroundColor: colors.purple[100]
    },
    trustIcon: {
        fontFamily: fonts.Bold,
        color: colors.purple[600],
        fontSize: fontSize[12],
        fontWeight: '700'
    },
    trustText: {
        fontFamily: fonts.Regular,
        color: colors.grey[700],
        fontSize: fontSize[12],
        lineHeight: 16
    },
});