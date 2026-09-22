import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
  Image,
  StyleSheet,
} from 'react-native';
import IconX, { ICON_TYPE } from './IconX';
import { colors, fonts } from '../constants';
import { fontSize, sWidth, verticalScale } from '../constants/metrics';

export type InputVariant = 'default' | 'floating' | 'outlined';
export type InputSize = 'small' | 'medium' | 'large';
export type LabelPosition = 'floating' | 'above';

export interface CustomInputProps extends TextInputProps {
  // Core props
  label?: string;
  value: string | undefined;
  onChangeText: (text: string) => void;
  placeholder?: string;

  // Validation & Error
  error?: string;
  touched?: boolean;
  helperText?: string;

  // Styling
  variant?: InputVariant;
  labelPosition?: LabelPosition;
  size?: InputSize;
  fullWidth?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  focusColor?: string;
  required?: boolean;
  dropStyle?: ViewStyle;

  // Icons
  leftIcon?: any;
  rightIcon?: any;
  onRightIconPress?: () => void;
  showPasswordToggle?: boolean;
  iconSize?: number;

  // NEW: Control clear button visibility
  showClearButton?: boolean;

  // State
  loading?: boolean;
  disabled?: boolean;

  // Phone number specific
  isPhone?: boolean;
  countryCode?: string;
  flagImage?: any;
  onCountryPress?: () => void;

  // Props
  onBlur?: () => void;
  onFocus?: () => void;
  onClear?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: 'next' | 'done' | 'go' | 'search';
}

const CustomInput = forwardRef<React.ElementRef<typeof TextInput>, CustomInputProps>(({
  // Core props
  label,
  value,
  onChangeText,
  placeholder,

  // Validation
  error,
  touched,
  helperText,

  // Styling
  variant = 'floating',
  labelPosition = 'floating',
  size = 'medium',
  fullWidth = true,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  focusColor = colors.green[500],
  required = false,
  dropStyle,

  // Icons
  leftIcon,
  rightIcon,
  onRightIconPress,
  showPasswordToggle = false,
  iconSize = 20,

  // NEW: Default to true
  showClearButton = true,

  // State
  loading = false,
  disabled = false,

  // Phone
  isPhone = false,
  countryCode = '+233',
  flagImage,
  onCountryPress,

  // Props
  onBlur,
  onFocus,
  onClear,
  secureTextEntry = false,
  editable = true,
  onSubmitEditing,
  returnKeyType = 'next',
  ...restProps
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  useImperativeHandle(ref, () => inputRef.current as React.ElementRef<typeof TextInput>);

  const hasValue = value && value.trim().length > 0;
  const isActive = isFocused || hasValue;
  const hasError = error && touched;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const getSecureTextEntry = () => {
    if (showPasswordToggle) {
      return !isPasswordVisible;
    }
    return secureTextEntry;
  };

  const getColor = () => {
    if (hasError) return colors.red?.[100] || '#D92D20';
    if (isFocused) return focusColor;
    return colors.grey[300];
  };

  const isLabelAbove = labelPosition === 'above';

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    if (typeof leftIcon === 'number') {
      return (
        <Image
          source={leftIcon}
          style={[styles.iconLeft, { width: iconSize, height: iconSize }]}
          resizeMode="contain"
        />
      );
    }

    return (
      <View style={styles.iconLeftContainer}>
        {leftIcon}
      </View>
    );
  };

  const renderRightIcon = () => {
    const color = getColor();

    if (showPasswordToggle) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.iconRightContainer}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <IconX
            origin={ICON_TYPE.FEATHER_ICONS}
            name={isPasswordVisible ? 'eye' : 'eye-off'}
            size={iconSize}
            color={isFocused ? focusColor : colors.grey[400]}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      if (typeof rightIcon === 'number') {
        return (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconRightContainer}
            activeOpacity={0.7}
            disabled={!onRightIconPress}
          >
            <Image
              source={rightIcon}
              style={[styles.iconRight, { width: iconSize, height: iconSize }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.iconRightContainer}
          activeOpacity={0.7}
          disabled={!onRightIconPress}
        >
          {rightIcon}
        </TouchableOpacity>
      );
    }

    // Clear button - only show if showClearButton is true
    if (hasValue && !disabled && !showPasswordToggle && showClearButton) {
      return (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.iconRightContainer}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconX
            origin={ICON_TYPE.IONICONS}
            name="close-circle"
            color={colors.grey[400]}
            size={18}
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderPhoneInput = () => {
    return (
      <View style={styles.phoneContainer}>
        <TouchableOpacity
          style={styles.countryCodeButton}
          onPress={onCountryPress}
          disabled={!onCountryPress}
          activeOpacity={0.7}
        >
          {flagImage && (
            <Image
              source={flagImage}
              style={styles.flagImage}
              resizeMode="contain"
            />
          )}
          <Text
            style={styles.countryCodeText}
          >
            {countryCode}
          </Text>
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            styles[`${size}Text`],
            inputStyle,
          ]}
          value={value || ''}
          // Phone inputs only ever hold the Ghana national number (the +233
          // country code is shown separately), so keep the field digits-only —
          // phone-pad still surfaces + * # which would otherwise slip in.
          onChangeText={(text) => onChangeText(text.replace(/\D/g, ''))}
          placeholder={placeholder}
          placeholderTextColor={colors.grey[400]}
          editable={editable && !disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="phone-pad"
          maxLength={restProps.maxLength ?? 10}
          secureTextEntry={getSecureTextEntry()}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          {...restProps}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const color = getColor();

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
      {isLabelAbove && label && (
        <Text
          style={[
            styles.labelAbove,
            required && styles.labelAboveRequired,
            isFocused && { color: focusColor },
            hasError && styles.labelAboveError,
            labelStyle,
          ]}
        >
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          isLabelAbove && styles.inputWithLabelAbove,
          styles[`${size}Size`],
          isFocused && styles.inputActive,
          hasError && styles.inputError,
          disabled && styles.inputDisabled,
          fullWidth && styles.fullWidth,
          isFocused && !hasError ? { borderColor: focusColor } : {},
          !label && styles.inputWithoutLabel,
          dropStyle,
          // ✅ Add special styling for multiline
          restProps.multiline && styles.multilineInput,
          {

          }
        ]}
      >
        {renderLeftIcon()}

        {isPhone ? (
          renderPhoneInput()
        ) : (
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              styles[`${size}Text`],
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
              isLabelAbove && styles.inputWithLabelAboveText,
              inputStyle,
              // ✅ Fixed multiline text style
              restProps.multiline && styles.multilineText,
            ]}
            value={value || ''}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.grey[400]}
            editable={editable && !disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={getSecureTextEntry()}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            multiline={restProps.multiline}
            textAlignVertical={restProps.multiline ? 'top' : undefined}
            {...restProps}
          />
        )}

        {renderRightIcon()}
      </View>

      {!isLabelAbove && (label && (hasValue || isFocused)) && (
        <Text
          style={[
            styles.label,
            styles.floatingLabel,
            isFocused && styles.labelActive,
            hasError && styles.labelError,
            { color: isFocused ? focusColor : colors.grey[400] },
            labelStyle,
          ]}
        >
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
      )}

      {(helperText || hasError) && (
        <View style={styles.helperContainer}>
          <Text
            style={[
              styles.helperText,
              hasError && styles.errorText,
              errorStyle,
            ]}
          >
            {hasError ? error : helperText}
          </Text>
        </View>
      )}
    </View>
  );
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    position: 'relative',
  },

  fullWidth: {
    width: '100%',
  },

  labelAbove: {
    fontSize: fontSize[14],
    fontFamily: fonts.Medium,
    color: colors.black[500],
    marginBottom: 6,
  },
  labelAboveRequired: {},
  labelAboveError: {
    color: colors.red?.[100] || '#D92D20',
  },

  label: {
    position: 'absolute',
    top: -10,
    left: 18,
    paddingHorizontal: 6,
    backgroundColor: colors.white[100],
    fontSize: fontSize[13],
    fontFamily: fonts.Medium,
    color: colors.grey[400],
    zIndex: 10,
  },

  floatingLabel: {},
  labelActive: {
    color: colors.green[500],
  },
  labelError: {
    color: colors.red?.[100] || '#D92D20',
  },
  requiredStar: {
    color: colors.red?.[100] || '#D92D20',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.grey[300],
    borderWidth: 1.4,
    borderRadius: 14,
    backgroundColor: colors.white[100],
    paddingHorizontal: 16,
    minHeight: 56,
    position: 'relative',
  },

  inputWithLabelAbove: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.grey[300],
    backgroundColor: colors.white[100],
  },

  inputWithoutLabel: {
    minHeight: 48,
  },

  inputActive: {
    borderColor: colors.green[500],
  },
  inputError: {
    borderColor: colors.red?.[100] || '#D92D20',
  },
  inputDisabled: {
    backgroundColor: colors.grey[100],
    opacity: 0.7,
  },

  // ✅ Fixed: Multiline input with fixed height
  multilineInput: {
    minHeight: 120,
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },

  input: {
    flex: 1,
    fontSize: fontSize[16],
    lineHeight: 22,
    color: colors.black[500],
    padding: 0,
    margin: 0,
    fontFamily: fonts.Regular,
    ...Platform.select({
      ios: {
        paddingVertical: 0,
      },
    }),
  },

  inputWithLabelAboveText: {
    fontSize: fontSize[15],
    lineHeight: 20,
    height: verticalScale(48),
    paddingVertical: 0,
    textAlignVertical: 'center',
  },

  // ✅ Fixed: Multiline text style
  multilineText: {
    textAlignVertical: 'top',
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
    minHeight: 100,
  },

  smallText: {
    fontSize: fontSize[14],
    lineHeight: 20,
  },
  mediumText: {
    fontSize: fontSize[16],
    lineHeight: 22,
  },
  largeText: {
    fontSize: fontSize[18],
    lineHeight: 24,
  },

  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },

  smallSize: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  mediumSize: {
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  largeSize: {
    minHeight: 64,
    paddingHorizontal: 20,
    borderRadius: 16,
  },

  iconLeftContainer: {
    height: verticalScale(48),
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLeft: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  iconRightContainer: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRight: {
    width: 20,
    height: 20,
  },

  phoneContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: colors.grey[300],
    marginRight: 10,
    gap: 4,
  },

  flagImage: {
    width: sWidth * 0.05,
    height: sWidth * 0.05,
    borderRadius: 20,
  },

  countryCodeText: {
    fontSize: fontSize[16],
    color: colors.black[500],
    fontFamily: fonts.Medium,
  },

  helperContainer: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: fontSize[11],
    color: colors.grey[400],
    fontFamily: fonts.Regular,
  },
  errorText: {
    color: colors.red?.[100] || '#D92D20',
  },

  loadingContainer: {
    minHeight: 56,
    backgroundColor: colors.grey[100],
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.grey[400],
    fontSize: fontSize[14],
    fontFamily: fonts.Regular,
  },
});