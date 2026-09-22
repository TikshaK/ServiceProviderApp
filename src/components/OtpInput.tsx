import React, { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts, fontSize } from '../constants';

type OtpInputProps = {
  length?: number;
  value: string;
  onChangeText: (value: string) => void;
  focusColor?: string;
};

export default function OtpInput({
  length = 6,
  value,
  onChangeText,
  focusColor = colors.purple[700],
}: OtpInputProps) {
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const [isFocused, setIsFocused] = useState(false);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');
  const activeIndex = isFocused ? Math.min(value.length, length - 1) : -1;

  const handleChangeText = (text: string) => {
    onChangeText(text.replace(/[^0-9]/g, '').slice(0, length));
  };

  return (
    <Pressable
      accessibilityLabel={`Enter ${length}-digit verification code`}
      accessibilityRole="keyboardkey"
      onPress={() => inputRef.current?.focus()}
      style={styles.container}>
      {digits.map((digit, index) => {
        const highlighted = isFocused && (index === activeIndex || !!digit);
        return (
          <View
            key={index}
            style={[
              styles.cell,
              highlighted && { borderColor: focusColor, backgroundColor: colors.purple[150] },
            ]}>
            <Text style={styles.digit}>{digit}</Text>
          </View>
        );
      })}
      <TextInput
        ref={inputRef}
        autoComplete="sms-otp"
        caretHidden
        importantForAutofill="yes"
        keyboardType="number-pad"
        maxLength={length}
        onBlur={() => setIsFocused(false)}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        style={styles.hiddenInput}
        textContentType="oneTimeCode"
        value={value}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    position: 'relative',
  },
  cell: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white[100],
    shadowColor: colors.black[250],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  digit: {
    fontFamily: fonts.Bold,
    color: colors.black[250],
    fontSize: fontSize[22],
    lineHeight: 28,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    color: colors.black[0],
  },
});
