import React, { useState } from 'react';
import { Image, Keyboard, Pressable, StyleProp, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { colors, fonts } from '../constants';
import { fontSize, scale } from '../constants/metrics';
import IconX, { ICON_TYPE } from './IconX';

interface CalendarInputProps {
  label?: string;
  value?: Date | null;
  onChangeText: (value: Date) => void;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode | number;
  rightIcon?: React.ReactNode | number;
  focusColor?: string;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

function formatDate(value: Date) {
  return value.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(value: Date) {
  return value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatValue(value: Date, mode: CalendarInputProps['mode']) {
  if (mode === 'time') return formatTime(value);
  if (mode === 'datetime') return `${formatDate(value)} at ${formatTime(value)}`;
  return formatDate(value);
}

function renderAdornment(adornment: React.ReactNode | number | undefined, side: 'left' | 'right') {
  if (typeof adornment === 'number') {
    return <Image source={adornment} style={side === 'left' ? styles.leftImage : styles.rightImage} />;
  }
  return adornment;
}

export default function CalendarInput({
  label,
  value,
  onChangeText,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  focusColor = colors.purple[700],
  mode = 'date',
  placeholder = 'Select',
  minimumDate,
  maximumDate,
  disabled = false,
}: CalendarInputProps) {
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(value);
  const displayValue = value ? formatValue(value, mode) : '';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (hasValue || isFocused) ? <Text style={[styles.label, labelStyle, { color: isFocused || hasValue ? focusColor : colors.grey[700] }]}>{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        disabled={disabled}
        onPress={() => {
          Keyboard.dismiss();
          setIsFocused(true);
          setOpen(true);
        }}
        style={[styles.inputWrapper, disabled ? styles.disabled : null, error ? styles.errorBorder : null, (isFocused || hasValue) && !error ? { borderColor: focusColor } : null]}
      >
        {leftIcon ? renderAdornment(leftIcon, 'left') : <IconX name={mode === 'time' ? 'time-outline' : 'calendar-outline'} origin={ICON_TYPE.IONICONS} size={20} color={disabled ? colors.grey[450] : focusColor} />}
        <TextInput editable={false} pointerEvents="none" value={displayValue} placeholder={placeholder} placeholderTextColor={colors.grey[450]} style={[styles.input, inputStyle]} />
        {rightIcon ? renderAdornment(rightIcon, 'right') : <IconX name="chevron-down" origin={ICON_TYPE.IONICONS} size={18} color={disabled ? colors.grey[450] : colors.grey[700]} />}
      </Pressable>
      <DatePicker
        modal
        open={open}
        date={value ?? minimumDate ?? new Date()}
        mode={mode}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onConfirm={selectedValue => {
          setOpen(false);
          setIsFocused(false);
          onChangeText(selectedValue);
        }}
        onCancel={() => {
          setOpen(false);
          setIsFocused(false);
        }}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  label: { position: 'absolute', top: -scale(8), left: scale(10), zIndex: 1, paddingHorizontal: scale(5), backgroundColor: colors.white[100], fontFamily: fonts.SemiBold, fontSize: fontSize[11] },
  inputWrapper: { minHeight: scale(48), flexDirection: 'row', alignItems: 'center', gap: scale(9), paddingHorizontal: scale(11), borderWidth: 1, borderColor: colors.purple[200], borderRadius: scale(12), backgroundColor: colors.purple[50] },
  disabled: { opacity: 0.6 },
  input: { flex: 1, paddingVertical: 0, fontFamily: fonts.SemiBold, fontSize: fontSize[13], color: colors.black[250] },
  leftImage: { width: scale(20), height: scale(20) },
  rightImage: { width: scale(20), height: scale(20) },
  errorBorder: { borderColor: colors.red[200] },
  errorText: { marginTop: scale(4), fontFamily: fonts.Regular, fontSize: fontSize[11], color: colors.red[200] },
});