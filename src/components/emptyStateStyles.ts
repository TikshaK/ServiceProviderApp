import { StyleSheet } from 'react-native';
import { colors, fonts, fontSize, scale } from '../constants';

export const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: scale(24), paddingVertical: scale(36), borderRadius: scale(14), backgroundColor: colors.white[100] },
  icon: { width: scale(58), height: scale(58), borderRadius: scale(29), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple[100], marginBottom: scale(10) },
  title: { fontFamily: fonts.SemiBold, fontSize: fontSize[16], color: colors.black[250], textAlign: 'center' },
  message: { fontFamily: fonts.Regular, fontSize: fontSize[12], color: colors.grey[700], textAlign: 'center', marginTop: scale(5) },
});
