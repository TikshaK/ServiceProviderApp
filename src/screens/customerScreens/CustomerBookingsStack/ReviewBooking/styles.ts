import { StyleSheet } from 'react-native';
import { colors, fonts, fontSize, scale, verticalScale } from '../../../../constants';

export const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: colors.purple[50]
        },
        submittingOverlay: {
                ...StyleSheet.absoluteFill,
                zIndex: 10,
                alignItems: 'center',
                justifyContent: 'center',
                gap: scale(10),
                backgroundColor: 'rgba(19, 27, 46, 0.72)',
        },
        submittingText: {
                fontFamily: fonts.SemiBold,
                fontSize: fontSize[14],
                color: colors.white[100],
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
                gap: scale(14)
        },
        successBanner: {
                flexDirection: 'row',
                alignItems: 'flex-start',

                gap: scale(10),
                padding: scale(14),
                borderRadius: scale(12),
                backgroundColor: colors.purple[700]
        },
        successCopy: {
                flex: 1,
                gap: scale(3)
        },
        successTitle: {
                fontFamily: fonts.SemiBold,
                fontSize: fontSize[14],
                color: colors.white[100]
        },
        successText: {
                fontFamily: fonts.Regular,
                fontSize: fontSize[12],
                lineHeight: verticalScale(17),
                color: colors.white[100]
        },
        summaryCard: {
                padding: scale(16),
                borderRadius: scale(14),
                backgroundColor: colors.white[100],
                gap: scale(14),
                shadowColor: colors.black[400]
                , shadowOpacity: 0.05,
                shadowRadius: scale(4),
                elevation: 1
        },
        metadata: {
                flexDirection: 'row',
                justifyContent:
                        'space-between',
                padding: scale(11),
                borderRadius: scale(10), backgroundColor: colors.purple[100]
        },
        metadataLeft: {
                flexDirection:
                        'row',
                alignItems: 'center',
                gap: scale(8),
                width: "70%"
        },
        cardLabel: { fontFamily: fonts.SemiBold, fontSize: fontSize[10], color: colors.grey[700], textTransform: 'uppercase', letterSpacing: 0.5 },
        metadataDate: { fontFamily: fonts.SemiBold, fontSize: fontSize[13], color: colors.black[250], marginTop: scale(3) },
        paid: { alignItems: 'flex-end' },
        paidAmount: { fontFamily: fonts.Bold, fontSize: fontSize[16], color: colors.purple[700], marginTop: scale(3) },
        providerRow: { flexDirection: 'row', alignItems: 'center', gap: scale(11) },
        providerImage: { width: scale(56), height: scale(56), borderRadius: scale(28) },
        providerPlaceholder: { width: scale(56), height: scale(56), borderRadius: scale(28), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[200] },
        providerCopy: { flex: 1, gap: scale(3) },
        providerName: { fontFamily: fonts.SemiBold, fontSize: fontSize[16], color: colors.black[250] },
        providerBusiness: { fontFamily: fonts.Regular, fontSize: fontSize[12], color: colors.grey[700] },
        serviceBadge: { alignSelf: 'flex-start', fontFamily: fonts.SemiBold, fontSize: fontSize[10], color: colors.purple[700], backgroundColor: colors.purple[100], paddingHorizontal: scale(8), paddingVertical: scale(4), borderRadius: scale(12), marginTop: scale(2) },
        card: { padding: scale(16), borderRadius: scale(14), backgroundColor: colors.white[100], gap: scale(12), shadowColor: colors.black[400], shadowOpacity: 0.05, shadowRadius: scale(4), elevation: 1 },
        heading: { fontFamily: fonts.SemiBold, fontSize: fontSize[18], color: colors.black[250], textAlign: 'center' },
        subtitle: { fontFamily: fonts.Regular, fontSize: fontSize[13], lineHeight: verticalScale(18), color: colors.grey[700], textAlign: 'center' },
        stars: { flexDirection: 'row', justifyContent: 'center', gap: scale(3), marginVertical: scale(3) },
        starButton: { padding: scale(2) },
        ratingBadge: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: scale(5), paddingHorizontal: scale(11), paddingVertical: scale(6), borderRadius: scale(14), backgroundColor: colors.purple[200] },
        ratingBadgeText: { fontFamily: fonts.SemiBold, fontSize: fontSize[12], color: colors.purple[700] },
        chips: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(7) },
        chip: { flexDirection: 'row', alignItems: 'center', gap: scale(4), paddingHorizontal: scale(10), paddingVertical: scale(7), borderRadius: scale(20), backgroundColor: colors.purple[100] },
        chipSelected: { backgroundColor: colors.purple[600] },
        chipText: { fontFamily: fonts.SemiBold, fontSize: fontSize[11], color: colors.grey[700] },
        chipTextSelected: { color: colors.white[100] },
        reviewHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        reviewLabel: { fontFamily: fonts.SemiBold, fontSize: fontSize[14], color: colors.black[250] },
        counter: { fontFamily: fonts.Regular, fontSize: fontSize[11], color: colors.grey[700] },
        reviewInput: { minHeight: verticalScale(112), padding: scale(11), borderRadius: scale(11), backgroundColor: colors.purple[100], fontFamily: fonts.Regular, fontSize: fontSize[13], lineHeight: verticalScale(19), color: colors.black[250] },
        actions: { gap: scale(10) },
        submitButton: { height: verticalScale(48), borderRadius: scale(11), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(7), backgroundColor: colors.purple[700] },
        submitText: { fontFamily: fonts.SemiBold, fontSize: fontSize[14], color: colors.white[100] },
        skipButton: { height: verticalScale(48), borderRadius: scale(11), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[100] },
        skipText: { fontFamily: fonts.SemiBold, fontSize: fontSize[14], color: colors.grey[700] },
});
