import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  StyleSheet,
  View,
} from 'react-native';
import { colors, fonts, fontSize } from '../constants';

export interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  rounded?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  rounded = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  testID,
}) => {
  // Get button styles based on variant
  const getVariantStyles = () => {
    if (disabled || loading) {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: colors.purple[900],
            borderWidth: 0,
            borderColor: 'transparent',
          };
        case 'secondary':
          return {
            backgroundColor: colors.grey[200],
            borderWidth: 0,
            borderColor: 'transparent',
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.purple[900],
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            borderWidth: 0,
            borderColor: 'transparent',
          };
        case 'danger':
          return {
            backgroundColor: colors.grey[200],
            borderWidth: 0,
            borderColor: 'transparent',
          };
        case 'success':
          return {
            backgroundColor: colors.purple[900],
            borderWidth: 0,
            borderColor: 'transparent',
          };
        default:
          return {
            backgroundColor: colors.green[200],
            borderWidth: 0,
            borderColor: 'transparent',
          };
      }
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.purple[600],
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: colors.green[500],
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.purple[700],
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: colors.red[100],
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'success':
        return {
          backgroundColor: colors.green[100],
          borderWidth: 0,
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.purple[700],
          borderWidth: 0,
          borderColor: 'transparent',
        };
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    if (disabled || loading) {
      switch (variant) {
        case 'outline':
        case 'ghost':
          return colors.purple[600];
        case 'primary':
        case 'secondary':
        case 'danger':
        case 'success':
        default:
          return colors.purple[700];
      }
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
      case 'success':
        return colors.white[100];
      case 'outline':
      case 'ghost':
        return colors.purple[700];
      default:
        return colors.white[100];
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          minHeight: 36,
          borderRadius: rounded ? 18 : 8,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          minHeight: 56,
          borderRadius: rounded ? 28 : 14,
        };
      default: // medium
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          minHeight: 44,
          borderRadius: rounded ? 22 : 10,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textColor = getTextColor();

  // Determine loading text color
  const loadingTextColor = variant === 'outline' || variant === 'ghost'
    ? colors.green[500]
    : colors.white[100];

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        variantStyles,
        sizeStyles,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            color={loadingTextColor}
            size="small"
          />
          <Text style={[styles.loadingText, { color: loadingTextColor }]}>
            Loading...
          </Text>
        </View>
      ) : (
        <>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              { color: textColor },
              size === 'small' && styles.textSmall,
              size === 'large' && styles.textLarge,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 1,
  },
  text: {
    fontFamily: fonts.SemiBold,
    fontSize: fontSize[18],
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  textSmall: {
    fontFamily: fonts.Medium,
    fontSize: fontSize[15],
    fontWeight: '500',
  },
  textLarge: {
    fontFamily: fonts.Bold,
    fontSize: fontSize[20],
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontFamily: fonts.SemiBold,
    fontSize: fontSize[18],
    fontWeight: '600',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default CustomButton;
