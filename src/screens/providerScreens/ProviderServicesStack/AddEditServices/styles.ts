import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../../constants';
import { fontSize, scale, verticalScale } from '../../../../constants/metrics';

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
	quickDelete: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: scale(6),
		backgroundColor: '#FFDDD8',
		borderRadius: scale(8),
		paddingHorizontal: scale(12),
		paddingVertical: 8
	},
	quickDeleteText: {
		color: colors.red[200],
		fontFamily: fonts.SemiBold,
		fontSize: fontSize[12]
	},
	section: {
		backgroundColor: colors.white[100],
		borderRadius: scale(16),
		padding: scale(16),
		gap: scale(12),
		shadowColor: colors.grey[400],
		shadowOffset: {
			width: scale(0),
			height: 1
		},
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
	step: { color: colors.grey[700], fontFamily: fonts.Regular, fontSize: fontSize[12] },
	label: { color: colors.black[250], fontFamily: fonts.SemiBold, fontSize: fontSize[12], marginBottom: -6 },
	required: { color: colors.red[200] },
	imagePickerButton: { minHeight: verticalScale(104), borderRadius: scale(12), borderWidth: scale(1), borderStyle: 'dashed', borderColor: colors.purple[300], alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[50], gap: 4 },
	imagePickerTitle: { color: colors.purple[700], fontFamily: fonts.SemiBold, fontSize: fontSize[14] },
	imagePickerHelper: { color: colors.grey[700], fontFamily: fonts.Regular, fontSize: fontSize[11] },
	imageList: { gap: scale(10), paddingTop: 4 },
	imageTile: { width: scale(96), height: verticalScale(96), borderRadius: scale(12), overflow: 'hidden', position: 'relative', backgroundColor: colors.grey[100] },
	selectedImage: { width: '100%', height: '100%' },
	removeImageButton: { position: 'absolute', top: verticalScale(6), right: scale(6), width: scale(24), height: verticalScale(24), borderRadius: scale(12), alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(19,27,46,0.75)' },
	coverImage: { ...StyleSheet.absoluteFill },
	coverShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.25)' },
	changeImageButton: { position: 'absolute', bottom: verticalScale(12), left: scale(12), flexDirection: 'row', alignItems: 'center', gap: scale(6), backgroundColor: colors.white[100], borderRadius: scale(8), paddingHorizontal: scale(12), paddingVertical: 8 },
	changeImageText: { color: colors.purple[700], fontFamily: fonts.SemiBold, fontSize: fontSize[12] },
	input: { height: verticalScale(48), borderRadius: scale(10), backgroundColor: colors.white[100], borderWidth: scale(1), borderColor: colors.grey[200], paddingHorizontal: scale(14), color: colors.black[250], fontFamily: fonts.Regular, fontSize: fontSize[14] },
	selectField: { minHeight: verticalScale(48), borderRadius: scale(10), backgroundColor: colors.white[100], borderWidth: scale(1), borderColor: colors.grey[200], paddingHorizontal: scale(14), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
	selectCompact: { paddingHorizontal: 10 },
	selectText: { flex: 1, color: colors.black[250], fontFamily: fonts.Regular, fontSize: fontSize[14] },
	twoColumn: { flexDirection: 'row', gap: 12 },
	column: { flex: 1, gap: 12 },
	priceInputWrap: { height: verticalScale(48), borderRadius: scale(10), borderWidth: scale(1), borderColor: colors.grey[200], flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
	currency: { color: colors.black[250], fontFamily: fonts.SemiBold, fontSize: fontSize[16] },
	priceInput: { flex: 1, color: colors.black[250], fontFamily: fonts.Regular, fontSize: fontSize[14], padding: scale(0), marginLeft: 8 },
	helper: { color: colors.grey[700], fontFamily: fonts.Regular, fontSize: fontSize[12], lineHeight: 17 },
	textArea: { minHeight: verticalScale(112), borderRadius: scale(10), backgroundColor: colors.white[100], borderWidth: scale(1), borderColor: colors.grey[200], padding: scale(14), color: colors.black[250], fontFamily: fonts.Regular, fontSize: fontSize[14], lineHeight: 20 },
	counterRow: { alignItems: 'flex-end' },
	statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
	statusCopy: { flex: 1, gap: 4 },
	statusTitle: { color: colors.black[250], fontFamily: fonts.SemiBold, fontSize: fontSize[14] },
	actions: { gap: scale(10), paddingTop: 2 },
	saveButton: { height: verticalScale(48), borderRadius: scale(12), backgroundColor: colors.purple[700], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
	saveButtonDisabled: { opacity: 0.6 },
	saveText: { color: colors.white[100], fontFamily: fonts.SemiBold, fontSize: fontSize[14] },
	cancelButton: { height: verticalScale(48), borderRadius: scale(12), backgroundColor: colors.purple[100], alignItems: 'center', justifyContent: 'center' },
	cancelText: { color: colors.purple[700], fontFamily: fonts.SemiBold, fontSize: fontSize[14] },
	deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(6), paddingVertical: 8 },
	deleteText: { color: colors.red[200], fontFamily: fonts.SemiBold, fontSize: fontSize[13] },
	modalBackdrop: { flex: 1, backgroundColor: 'rgba(19,27,46,0.45)', justifyContent: 'flex-end' },
	optionsSheet: { backgroundColor: colors.white[100], borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: scale(20), paddingBottom: verticalScale(32), gap: 4 },
	optionsTitle: { color: colors.black[250], fontFamily: fonts.SemiBold, fontSize: fontSize[18], marginBottom: 8 },
	optionRow: { minHeight: verticalScale(48), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.grey[200] },
	optionText: { flex: 1, color: colors.black[250], fontFamily: fonts.Regular, fontSize: fontSize[14] },
});
