import React from 'react';
import {
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, fontSize, scale, verticalScale } from '../constants';
import IconX, { ICON_TYPE } from './IconX';

export interface CustomHeaderProps {
  title?: string;
  leftIcon?: string;
  leftIconType?: ICON_TYPE;
  onLeftPress?: () => void;
  rightIcon?: string;
  rightIconType?: ICON_TYPE;
  onRightPress?: () => void;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  centerComponent?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showBackButton?: boolean;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  customLayout?: boolean;
  disabled?: boolean;
}

const CustomHeader = ({
  title,
  leftIcon,
  leftIconType = ICON_TYPE.IONICONS,
  onLeftPress,
  rightIcon,
  rightIconType = ICON_TYPE.IONICONS,
  onRightPress,
  leftComponent,
  rightComponent,
  centerComponent,
  containerStyle,
  titleStyle,
  showBackButton = false,
  backgroundColor = colors.purple[50],
  statusBarStyle = 'dark-content',
  customLayout = false,
  disabled = false,
}: CustomHeaderProps) => {
  const insets = useSafeAreaInsets();
  const iconColor = colors.black[250];

  const renderIconButton = (name: string, origin: ICON_TYPE, onPress?: () => void, disabled?: boolean) => (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.iconButton, disabled && { opacity: 0.5 }]}
      activeOpacity={disabled ? 1 : 0.7}>
      <IconX name={name} origin={origin} size={fontSize[24]} color={iconColor} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { 
        // paddingTop: insets.top,
         backgroundColor
         }, containerStyle]}>
      <StatusBar barStyle={statusBarStyle} />
      <View style={[styles.headerContent, customLayout && styles.headerContentCustom, { backgroundColor }]}>
        {customLayout ? (
          <>
            <View style={styles.customLeft}>{leftComponent}</View>
            <View style={styles.customRight}>{rightComponent}</View>
          </>
        ) : (
          <>
            <View style={styles.sideSection}>
              {leftComponent || (showBackButton
                ? renderIconButton('arrow-back-outline', ICON_TYPE.IONICONS, onLeftPress, disabled)
                : leftIcon
                  ? renderIconButton(leftIcon, leftIconType, onLeftPress)
                  : <View style={styles.placeholder} />)}
            </View>
            <View style={styles.centerSection}>
              {centerComponent || (title ? <Text numberOfLines={1} style={[styles.title, titleStyle]}>{title}</Text> : <View />)}
            </View>
            <View style={[styles.sideSection, styles.rightSection]}>
              {rightComponent || (rightIcon
                ? renderIconButton(rightIcon, rightIconType, onRightPress)
                : <View style={styles.placeholder} />)}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  headerContent: {
    minHeight: verticalScale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.purple[200],
  },
  sideSection: {
    width: scale(48),
    minHeight: verticalScale(48),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSection: { alignItems: 'flex-end' },
  centerSection: {
    flex: 1,
    minHeight: verticalScale(48),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(8),
  },
  title: {
    fontFamily: fonts.SemiBold,
    color: colors.black[250],
    fontSize: fontSize[16],
    fontWeight: '600',
    textAlign: 'center',
  },
  iconButton: {
    width: scale(44),
    height: verticalScale(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: { width: scale(44), height: verticalScale(44) },
  headerContentCustom: {
    paddingHorizontal: scale(16),
    gap: scale(12),
  },
  customLeft: {
    flex: 1,
    minWidth: 0,
    minHeight: verticalScale(48),
    justifyContent: 'center',
  },
  customRight: {
    flexShrink: 0,
    minHeight: verticalScale(48),
    justifyContent: 'center',
  },
});

export default CustomHeader;
