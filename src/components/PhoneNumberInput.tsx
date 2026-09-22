import React from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import CustomInput, { CustomInputProps } from './CustomInput';
import { colors } from '../constants';
import { fontSize, scale, verticalScale } from '../constants/metrics';
import IconX, { ICON_TYPE } from './IconX';

export interface PhoneNumberInputProps extends Omit<CustomInputProps, 'keyboardType'> {
  countryCode?: string;
  onCountryCodePress?: () => void;
}

const PhoneNumberInput = React.forwardRef<React.ElementRef<typeof TextInput>, PhoneNumberInputProps>(({ 
  countryCode = '+1',
  onCountryCodePress,
  onChangeText,
  ...props
}, ref) => (
  <CustomInput
    ref={ref}
    {...props}
    keyboardType="phone-pad"
    onChangeText={value => onChangeText(value.replace(/\D/g, ''))}
    leftIcon={
      <Pressable
        accessibilityLabel="Select country code"
        accessibilityRole="button"
        disabled={!onCountryCodePress}
        onPress={onCountryCodePress}
        style={styles.countryCode}>
        <IconX
          name="public"
          origin={ICON_TYPE.MATERIAL_ICONS}
          color={colors.grey[700]}
          size={fontSize[16]}
        />
        <Text style={styles.countryCodeText}>{countryCode}</Text>
        <IconX
          name="keyboard-arrow-down"
          origin={ICON_TYPE.MATERIAL_ICONS}
          color={colors.grey[450]}
          size={fontSize[16]}
        />
      </Pressable>
    }
  />
));

PhoneNumberInput.displayName = 'PhoneNumberInput';

const styles = {
  countryCode: {
    height: verticalScale(48),
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: scale(4),
    paddingHorizontal: scale(8),
    borderRightWidth: 1,
    borderRightColor: colors.grey[200],
  },
  countryCodeText: {
    color: colors.black[250],
    fontSize: fontSize[13],
    fontWeight: '600' as const,
  },
};

export default PhoneNumberInput;
