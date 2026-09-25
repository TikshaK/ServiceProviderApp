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
		paddingTop: verticalScale(0),
		paddingBottom: scale(32),
		gap: scale(12)
	},
	statusCard: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: scale(10),
		padding: scale(16),
		borderRadius: scale(14),
		backgroundColor: colors.white[100],
		shadowColor: colors.black[400],
		shadowOpacity: 0.05,
		shadowRadius: scale(4),
		elevation: 1
	},
	statusIcon: {
		width: scale(40),
		height: scale(40),
		borderRadius: scale(11),
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.purple[200],
	},
	statusCopy: {
		flex: 1,
		gap: scale(5),
	},
	statusHeading: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: scale(6),
	},
	statusTitle: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[17],
		color: colors.black[250],
	},
	scheduleBadge: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[10],
		color: colors.purple[700],
		backgroundColor: colors.purple[200],
		paddingHorizontal: scale(7),
		paddingVertical: scale(3),
		borderRadius: scale(10),
	},
	statusDescription: {
		fontFamily: fonts.Regular,
		fontSize: fontSize[13],
		lineHeight: verticalScale(19),
		color: colors.grey[700],
	},
	card: {
		padding: scale(16),
		borderRadius: scale(14),
		backgroundColor: colors.white[100],
		gap: scale(13),
		shadowColor: colors.black[400],
		shadowOpacity: 0.05,
		shadowRadius: scale(4),
		elevation: 1,
	},
	cardHeading: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	cardLabel: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[11],
		color: colors.grey[700],
		textTransform: 'uppercase',
		letterSpacing: 0.6,
	},
	categoryBadge: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[10],
		color: colors.purple[700],
		backgroundColor: colors.purple[100],
		paddingHorizontal: scale(8),
		paddingVertical: scale(4),
		borderRadius: scale(12),
	},
	serviceRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: scale(12),
	},
	serviceImage: {
		width: scale(64),
		height: scale(64),
		borderRadius: scale(12),
	},
	servicePlaceholder: {
		width: scale(64),
		height: scale(64),
		borderRadius: scale(12),
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.purple[200],
	},
	serviceCopy: {
		flex: 1,
	},
	serviceTitle: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[15],
		color: colors.black[250],
	},
	serviceMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: scale(5),
		marginTop: scale(7),
	},
	servicePrice: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[13],
		color: colors.black[250],
	},
	mutedText: {
		fontFamily: fonts.Regular,
		fontSize: fontSize[11],
		color: colors.grey[700],
	},
	detailRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: scale(10),
	},
	detailIcon: {
		width: scale(32),
		height: scale(32),
		borderRadius: scale(8),
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.purple[100],
	},
	detailCopy: {
		flex: 1,
		gap: scale(3),
	},
	detailValue: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[13],
		color: colors.black[250],
	},
	providerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: scale(11),
	},
	providerImage: {
		width: scale(56),
		height: scale(56),
		borderRadius: scale(28),
	},
	providerPlaceholder: {
		width: scale(56),
		height: scale(56),
		borderRadius: scale(28),
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.purple[200],
	},
	providerCopy: {
		flex: 1,
	},
	providerName: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[16],
		color: colors.black[250],
	},
	ratingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: scale(4),
		marginTop: scale(4),
	},
	rating: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[12],
		color: colors.black[250],
	},
	callButton: {
		height: verticalScale(44),
		borderRadius: scale(11),
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: scale(7),
		backgroundColor: colors.purple[100],
	},
	callText: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[13],
		color: colors.purple[700],
	},
	paymentRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	paymentValue: {
		fontFamily: fonts.Regular,
		fontSize: fontSize[13],
		color: colors.black[250],
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: colors.purple[200],
	},
	totalRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	totalTitle: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[15],
		color: colors.black[250],
	},
	totalAmount: {
		fontFamily: fonts.Bold,
		fontSize: fontSize[22],
		color: colors.purple[700],
	},
	cancelArea: {
		alignItems: 'center',
		gap: scale(7),
		paddingTop: scale(3),
		paddingBottom: scale(16),
	},
	cancelButton: {
		width: '100%',
		height: verticalScale(48),
		borderRadius: scale(11),
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: scale(7),
		backgroundColor: '#FDEBEC',
	},
	cancelText: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[14],
		color: colors.red[200],
	},
	cancelNote: {
		fontFamily: fonts.Regular,
		fontSize: fontSize[11],
		color: colors.grey[700],
		textAlign: 'center',
	},
});
