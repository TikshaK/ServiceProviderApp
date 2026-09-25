import { StyleSheet } from 'react-native';
import { colors, fonts, fontSize, 
	scale, verticalScale } from '../../../../constants';

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
	contextRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	heading: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[18],
		color: colors.black[250]
	},
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: scale(4),
		borderRadius: scale(20),
		paddingHorizontal: scale(12),
		paddingVertical: scale(8),
		backgroundColor: colors.purple[700]
	},
	addText: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[12],
		color: colors.white[100]
	},
	list: {
		gap: scale(10)
	},
	addressCard: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: scale(10),
		padding: scale(14),
		borderRadius: scale(14),
		backgroundColor: colors.white[100],
		shadowColor: colors.black[400],
		shadowOpacity: 0.05,
		shadowRadius: scale(4),
		elevation: 1
	},
	addressMain: {
		flex: 1,
		flexDirection: 'row',
		gap: scale(10)
	},
	addressIcon: {
		width: scale(40),
		height: scale(40),
		borderRadius: scale(20),
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.purple[100]
	},
	addressCopy: {
		flex: 1,
		gap: scale(3)
	},
	addressTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: scale(6),
		flexWrap: 'wrap'
	},
	addressLabel: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[15],
		color: colors.black[250]
	},
	defaultBadge: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[10],
		color: colors.purple[700],
		backgroundColor: colors.purple[200],
		paddingHorizontal: scale(7),
		paddingVertical: scale(3),

		borderRadius: scale(10),
		textTransform: 'uppercase'
	},
	addressText: {
		fontFamily: fonts.Regular,

		fontSize: fontSize[13],
		lineHeight: verticalScale(19),
		color: colors.grey[700]
	},
	zipText: {
		fontFamily: fonts.Regular,
		fontSize: fontSize[11],
		color: colors.grey[700]
	},
	editButton: {
		width: scale(36),
		height: scale(36),
		borderRadius: scale(18),
		alignItems: 'center',
		justifyContent: 'center'
	},
	deleteButton: {
		width: scale(36),
		height: scale(36),
		borderRadius: scale(18),
		alignItems: 'center',
		justifyContent: 'center',
		//   backgroundColor: colors.red[50]
	},
});
