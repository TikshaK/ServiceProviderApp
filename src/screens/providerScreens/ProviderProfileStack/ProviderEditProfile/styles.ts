import { StyleSheet } from 'react-native';
import { colors, fonts, scale, verticalScale } from '../../../../constants';
import { fontSize } from '../../../../constants/metrics';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.purple[50]
	},
	content: {
		padding: scale(16),
		paddingBottom: verticalScale(48),
		gap: 16
	},
	avatarSection: { alignItems: 'center', gap: scale(8), paddingVertical: 4 },
	avatarWrap: { width: scale(92), height: verticalScale(92), position: 'relative' },
	avatar: { width: '100%', height: '100%', borderRadius: scale(46), backgroundColor: colors.purple[200] },
	avatarPlaceholder: { width: '100%', height: '100%', borderRadius: scale(46), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[200] },
	cameraButton: { position: 'absolute', right: scale(0), bottom: verticalScale(0), width: scale(30), height: verticalScale(30), borderRadius: scale(15), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[700], borderWidth: scale(2), borderColor: colors.purple[50] },
	changePhotoText: { color: colors.purple[700], fontFamily: fonts.SemiBold, fontSize: fontSize[12] },
	contextRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	screenTitle: {
		color: colors.black[250],
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[18]
	},
	accountBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: scale(5),
		backgroundColor: colors.purple[100],
		borderRadius: scale(8),
		paddingHorizontal: scale(10),
		paddingVertical: 7
	},
	accountBadgeText: {
		color: colors.purple[700],
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[11]
	},
	section: {
		backgroundColor: colors.white[100],
		borderRadius: scale(16),
		padding: scale(16),
		gap: scale(14),
		shadowColor: colors.grey[400],
		shadowOffset: { width: scale(0), height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: scale(4),
		elevation: 2
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 2
	},
	headingGroup: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8
	},
	headingMark: {
		width: scale(8),
		height: verticalScale(18),
		borderRadius: scale(4),
		backgroundColor: colors.purple[600]
	},
	sectionTitle: {
		color: colors.black[250],
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[16]
	},
	step: {
		color: colors.grey[700],
		fontFamily: fonts.Regular,
		fontSize: fontSize[12]
	},
	field: {
		gap: 7
	},
	label: {
		color: colors.black[250],
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[12]
	},
	inputWrap: {
		minHeight: verticalScale(48),
		borderRadius: scale(10),
		borderWidth: scale(1),
		borderColor: colors.grey[200],
		paddingHorizontal: scale(13),
		flexDirection: 'row',
		alignItems: 'center',

		gap: 10
	},
	inputDisabled: {
		backgroundColor: colors.grey[100]
	},
	input: {
		flex: 1,
		color: colors.black[250],
		fontFamily: fonts.Regular,
		fontSize: fontSize[14],
		paddingVertical: 0
	},
	helper: {
		color: colors.grey[700],
		fontFamily: fonts.Regular,
		fontSize: fontSize[12],
		lineHeight: 17
	},
	visibilityRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: scale(12),
		backgroundColor: colors.grey[100],
		borderRadius: scale(12),
		padding: 12
	},
	visibilityIcon: {
		width: scale(38),
		height: verticalScale(38),
		borderRadius: scale(10),

		backgroundColor: colors.white[100],
		alignItems: 'center',
		justifyContent: 'center'
	},
	visibilityCopy: {
		flex: 1,
		gap: 3
	},
	visibilityTitle: {
		color: colors.black[250],
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[14]
	},
	actions: {
		gap: scale(10),
		paddingTop: 2
	},
	saveButton: {
		height: verticalScale(48),
		borderRadius: scale(12),
		backgroundColor: colors.purple[700],
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8
	},
	disabledButton: {
		opacity: 0.65
	},
	saveText: {
		color: colors.white[100],
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[14]
	},
	cancelButton: {
		height: verticalScale(48),
		borderRadius: scale(12),
		backgroundColor: colors.purple[100],
		alignItems: 'center',
		justifyContent: 'center'
	},
	cancelText: {
		color: colors.purple[700],
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[14]
	},
});
