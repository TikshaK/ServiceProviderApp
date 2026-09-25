import { StyleSheet } from 'react-native';
import { colors, fonts, fontSize, scale, verticalScale } from '../../../../constants';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.purple[50],
	},
	header: {
		minHeight: verticalScale(56),
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.white[100],
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.purple[200],
		paddingHorizontal: scale(8),
	},
	headerButton: {
		width: scale(44),
		height: verticalScale(44),
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerTitle: {
		flex: 1,
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[18],
		color: colors.black[250],
	},
	headerSpacer: {
		width: scale(44),
	},
	content: {
		padding: scale(16),
		paddingBottom: scale(40),
		gap: scale(24),
	},
	avatarSection: {
		alignItems: 'center',
		paddingTop: scale(8),
	},
	avatarWrap: {
		width: scale(112),
		height: scale(112),
		position: 'relative',
	},
	avatar: {
		width: '100%',
		height: '100%',
		borderRadius: scale(56),
		backgroundColor: colors.purple[200],
		borderWidth: scale(4),
		borderColor: colors.purple[200],
	},
	cameraButton: {
		position: 'absolute',
		right: scale(0),
		bottom: verticalScale(0),
		width: scale(38),
		height: scale(38),
		borderRadius: scale(19),
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.purple[600],
		borderWidth: scale(3),
		borderColor: colors.purple[50],
	},
	photoActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: scale(12),
		marginTop: scale(12),
	},
	photoActionText: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[12],
		color: colors.purple[700],
	},
	photoDot: {
		width: scale(4),
		height: scale(4),
		borderRadius: scale(2),
		backgroundColor: colors.grey[400],
	},
	removePhotoText: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[12],
		color: colors.red[200],
	},
	form: {
		gap: scale(16),
	},
	field: {
		gap: scale(6),
	},
	label: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[12],
		color: colors.grey[700],
	},
	inputWrap: {
		minHeight: verticalScale(48),
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: scale(14),
		borderRadius: scale(11),
		backgroundColor: colors.white[100],
		shadowColor: colors.black[400],
		shadowOpacity: 0.04,
		shadowRadius: scale(3),
		elevation: 1,
	},
	inputDisabled: {
		backgroundColor: colors.grey[100],
	},
	input: {
		flex: 1,
		fontFamily: fonts.Regular,
		fontSize: fontSize[14],
		color: colors.black[250],
		paddingVertical: 0,
	},
	helper: {
		fontFamily: fonts.Regular,
		fontSize: fontSize[11],
		color: colors.grey[700],
	},
	actions: {
		gap: scale(10),
		paddingTop: scale(4),
	},
	saveButton: {
		height: verticalScale(48),
		borderRadius: scale(11),
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: scale(7),
		backgroundColor: colors.purple[600],
	},
	disabledButton: {
		opacity: 0.65,
	},
	saveText: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[14],
		color: colors.white[100],
	},
	cancelButton: {
		height: verticalScale(48),
		borderRadius: scale(11),
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.purple[100],
	},
	cancelText: {
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[14],
		color: colors.black[250],
	},
});
