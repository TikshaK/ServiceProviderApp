import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../../constants';
import { fontSize, scale, verticalScale } from '../../../../constants/metrics';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.purple[50]
	},
	header: {
		paddingHorizontal: scale(16),
		paddingTop: verticalScale(12),
		paddingBottom: 8
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12
	},
	headerTitle: {
		flex: 1,
		fontSize: fontSize[20],
		fontFamily: fonts.Bold,
		color: colors.black[250],
		marginLeft: 4
	},
	iconButton: {
		width: scale(40),
		height: verticalScale(40),
		borderRadius: scale(20),
		alignItems: 'center',
		justifyContent: 'center'
	},
	resultsHeader: { paddingHorizontal: scale(16), paddingTop: verticalScale(10), paddingBottom: verticalScale(8), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	resultsCount: { fontSize: fontSize[11], fontFamily: fonts.SemiBold, color: colors.grey[450], textTransform: 'uppercase', letterSpacing: 1 },
	verified: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	verifiedText: { fontSize: fontSize[11], fontFamily: fonts.Regular, color: colors.grey[450] },
	list: { paddingHorizontal: scale(16), paddingBottom: verticalScale(32), gap: 12 },
	card: { backgroundColor: colors.white[100], borderRadius: scale(16), padding: scale(14), gap: scale(12), shadowColor: colors.black[250], shadowOffset: { width: scale(0), height: 1 }, shadowOpacity: 0.05, shadowRadius: scale(3), elevation: 1 },
	cardTop: { flexDirection: 'row', gap: 12 },
	image: { width: scale(64), height: verticalScale(64), borderRadius: scale(12), backgroundColor: colors.purple[100], alignItems: 'center', justifyContent: 'center' },
	cardCopy: { flex: 1, minWidth: 0 },
	titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
	title: { flex: 1, fontSize: fontSize[16], fontFamily: fonts.SemiBold, color: colors.black[250] },
	provider: { fontSize: fontSize[13], fontFamily: fonts.Regular, color: colors.grey[700], marginTop: 2 },
	ratingRow: { flexDirection: 'row', alignItems: 'center', gap: scale(4), marginTop: 5 },
	rating: { fontSize: fontSize[12], fontFamily: fonts.SemiBold, color: colors.black[250] },
	reviews: { fontSize: fontSize[12], fontFamily: fonts.Regular, color: colors.grey[450] },
	favoriteButton: { padding: 2 },
	detailBar: { backgroundColor: colors.purple[100], borderRadius: scale(12), paddingHorizontal: scale(12), paddingVertical: verticalScale(8), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	detailStats: { flexDirection: 'row', alignItems: 'center', gap: 12 },
	stat: { gap: 1 },
	statLabel: { fontSize: fontSize[11], fontFamily: fonts.Regular, color: colors.grey[450] },
	statValue: { fontSize: fontSize[14], fontFamily: fonts.SemiBold, color: colors.black[250] },
	divider: { width: scale(1), height: verticalScale(28), backgroundColor: colors.grey[300] },
	detailsButton: { flexDirection: 'row', alignItems: 'center', gap: scale(2), backgroundColor: colors.purple[600], borderRadius: scale(10), paddingHorizontal: scale(12), paddingVertical: 9 },
	detailsText: { fontSize: fontSize[12], fontFamily: fonts.SemiBold, color: colors.white[100] },
	emptyState: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: scale(32), paddingVertical: 64 },
	emptyIcon: { width: scale(56), height: verticalScale(56), borderRadius: scale(28), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[200], marginBottom: 12 },
	emptyTitle: { fontSize: fontSize[16], fontFamily: fonts.SemiBold, color: colors.black[250] },
	emptyText: { fontSize: fontSize[13], fontFamily: fonts.Regular, color: colors.grey[450], textAlign: 'center', marginTop: verticalScale(4), lineHeight: 18 },
	resetButton: { marginTop: verticalScale(16), paddingHorizontal: scale(16), paddingVertical: verticalScale(10), borderRadius: scale(10), backgroundColor: colors.purple[100] },
	resetText: { fontSize: fontSize[13], fontFamily: fonts.SemiBold, color: colors.purple[700] },
	loading: { marginTop: 40 },
	  tabsScrollView: {
    maxHeight: verticalScale(50),
    marginVertical: verticalScale(1),
  },
});
