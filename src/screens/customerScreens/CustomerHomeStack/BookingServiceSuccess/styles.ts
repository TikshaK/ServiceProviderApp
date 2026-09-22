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
        borderBottomWidth: StyleSheet.hairlineWidth,
         borderBottomColor: colors.purple[200] 
        },
	headerButton: { 
        width: scale(44), 
        height: verticalScale(44), 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
	headerSpacer: { 
        flex: 1 
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
	celebration: { alignItems: 'center', paddingTop: scale(14), gap: scale(7) },
	halo: { width: scale(112), height: scale(112), borderRadius: scale(56), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[200], marginBottom: scale(6) },
	checkCircle: { width: scale(80), height: scale(80), borderRadius: scale(40), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[700], shadowColor: colors.purple[700], shadowOpacity: 0.25, shadowRadius: scale(10), elevation: 5 },
	heading: { fontFamily: fonts.Bold, fontSize: fontSize[26], color: colors.black[250] },
	subtitle: { fontFamily: fonts.Regular, fontSize: fontSize[14], color: colors.grey[700], textAlign: 'center' },
	summaryCard: { padding: scale(16), borderRadius: scale(16), backgroundColor: colors.white[100], gap: scale(13), shadowColor: colors.black[400], shadowOpacity: 0.05, shadowRadius: scale(4), elevation: 1 },
	summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: scale(10) },
	providerImage: { width: scale(48), height: scale(48), borderRadius: scale(11) },
	providerImagePlaceholder: { width: scale(48), height: scale(48), borderRadius: scale(11), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[200] },
	summaryCopy: { flex: 1, minWidth: 0 },
	serviceTitle: { fontFamily: fonts.SemiBold, fontSize: fontSize[15], color: colors.black[250] },
	providerLine: { flexDirection: 'row', alignItems: 'center', gap: scale(4), marginTop: scale(4) },
	providerName: { fontFamily: fonts.Regular, fontSize: fontSize[12], color: colors.grey[700] },
	rating: { fontFamily: fonts.SemiBold, fontSize: fontSize[11], color: colors.black[250] },
	confirmed: { fontFamily: fonts.SemiBold, fontSize: fontSize[10], color: colors.purple[700], backgroundColor: colors.purple[100], paddingHorizontal: scale(8), paddingVertical: scale(5), borderRadius: scale(12) },
	divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.purple[200] },
	detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: scale(10) },
	detailIcon: { width: scale(32), height: scale(32), borderRadius: scale(8), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[100] },
	detailCopy: { flex: 1, gap: scale(2) },
	detailLabel: { fontFamily: fonts.Regular, fontSize: fontSize[11], color: colors.grey[700] },
	detailValue: { fontFamily: fonts.SemiBold, fontSize: fontSize[13], color: colors.black[250] },
	detailMuted: { fontFamily: fonts.Regular, fontSize: fontSize[11], color: colors.grey[700] },
	paymentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: scale(2) },
	paymentLabel: { fontFamily: fonts.SemiBold, fontSize: fontSize[12], color: colors.grey[700] },
	payment: { fontFamily: fonts.Bold, fontSize: fontSize[18], color: colors.black[250] },
	actions: { gap: scale(10) },
	primaryButton: { height: verticalScale(48), borderRadius: scale(11), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(6), backgroundColor: colors.purple[700] },
	primaryText: { fontFamily: fonts.SemiBold, fontSize: fontSize[14], color: colors.white[100] },
	secondaryButton: { height: verticalScale(48), borderRadius: scale(11), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[100] },
	secondaryText: { fontFamily: fonts.SemiBold, fontSize: fontSize[14], color: colors.purple[700] },
});
