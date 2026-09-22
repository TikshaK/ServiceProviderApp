import { StyleSheet } from 'react-native';
import { colors, fonts, fontSize, scale, verticalScale } from '../constants';

export const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: scale(20), backgroundColor: 'rgba(19,27,46,0.48)' },
  card: { width: '100%', maxWidth: scale(360), padding: scale(20), borderRadius: scale(18), backgroundColor: colors.white[100], alignItems: 'center' },
  icon: { width: scale(52), height: scale(52), borderRadius: scale(26), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[100], marginBottom: scale(12) },
  iconDestructive: { backgroundColor: '#FDEBEC' },
  title: { fontFamily: fonts.SemiBold, fontSize: fontSize[18], color: colors.black[250], textAlign: 'center' },
  message: { fontFamily: fonts.Regular, fontSize: fontSize[13], lineHeight: verticalScale(19), color: colors.grey[700], textAlign: 'center', marginTop: scale(8) },
  actions: { width: '100%', gap: scale(9), marginTop: scale(18) },
  confirmButton: { minHeight: verticalScale(46), borderRadius: scale(11), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[700] },
  confirmButtonDestructive: { backgroundColor: colors.red[200] },
  confirmText: { fontFamily: fonts.SemiBold, fontSize: fontSize[14], color: colors.white[100] },
  cancelButton: { minHeight: verticalScale(46), borderRadius: scale(11), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[100] },
  cancelText: { fontFamily: fonts.SemiBold, fontSize: fontSize[14], color: colors.black[250] },
});
