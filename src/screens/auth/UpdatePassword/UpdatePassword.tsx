import React, { useState } from 'react';
import { Platform, Pressable, StatusBar, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, navigationStrings, strings } from '../../../constants';
import { CustomButton, CustomHeader, CustomInput, ICON_TYPE, IconX } from '../../../components';
import { getConfirmPasswordError, getPasswordError, getRequiredError, validateConfirmPassword, validatePassword, validateRequiredValue } from '../../../utils';
import { styles } from './styles';

type UpdatePasswordProps = {
  navigation: any;
};

export default function UpdatePassword({ navigation }: UpdatePasswordProps) {
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentPasswordError = getRequiredError(currentPassword, touched.currentPassword || submitAttempted, 'Current password');
  const newPasswordError = getPasswordError(newPassword, touched.newPassword || submitAttempted);
  const confirmPasswordError = getConfirmPasswordError(newPassword, confirmPassword, touched.confirmPassword || submitAttempted);

  // Password strength calculations
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const score = (hasMinLength ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSymbol ? 1 : 0);

  const isMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return strings.updatePassword.tooShort;
    if (score === 1) return strings.updatePassword.weak;
    if (score === 2) return strings.updatePassword.moderate;
    if (score === 3) return strings.updatePassword.strong;
    return strings.updatePassword.tooShort;
  };

  const getStrengthColor = () => {
    if (newPassword.length === 0) return colors.grey[450];
    if (score === 1) return colors.red[100];
    if (score === 2) return colors.purple[500];
    if (score === 3) return colors.purple[700];
    return colors.grey[450];
  };

  const getBarColor = (barIndex: number) => {
    if (newPassword.length === 0) return colors.purple[200];
    if (barIndex === 1) return score >= 1 ? (score === 1 ? colors.red[100] : colors.purple[500]) : colors.purple[200];
    if (barIndex === 2) return score >= 2 ? (score === 2 ? colors.purple[500] : colors.purple[700]) : colors.purple[200];
    if (barIndex === 3) return score === 3 ? colors.purple[700] : colors.purple[200];
    return colors.purple[200];
  };

  const handleUpdatePassword = () => {
    setSubmitAttempted(true);
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });

    if (
      !validateRequiredValue(currentPassword) ||
      !validatePassword(newPassword) ||
      !validateConfirmPassword(newPassword, confirmPassword)
    ) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigation.navigate(navigationStrings.LOGIN);
      }, 1000);
    }, 1200);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />
      <CustomHeader
        title={strings.updatePassword.title}
        showBackButton
        onLeftPress={() => navigation.goBack()}
      />

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={Platform.OS === 'android' ? 180 : 120}
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
        showsVerticalScrollIndicator={false}>
        {/* Intro Header */}
        <View style={styles.intro}>
          <View style={styles.logoFrame}>
            <IconX name="lock-reset" origin={ICON_TYPE.MATERIAL_COMMUNITY} color={colors.purple[700]} size={32} />
            <View style={styles.verifiedBadge}>
              <IconX name="verified" origin={ICON_TYPE.MATERIAL_ICONS} color={colors.white[100]} size={11} />
            </View>
          </View>
          <Text style={styles.heading}>{strings.updatePassword.heading}</Text>
          {/* <Text style={styles.subheading}>{strings.updatePassword.subheading}</Text> */}
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          {/* Current Password */}
          <CustomInput
            autoCapitalize="none"
            fullWidth
            label={strings.updatePassword.currentPasswordLabel}
            labelPosition="above"
            leftIcon={<IconX name="key" origin={ICON_TYPE.MATERIAL_ICONS} color={colors.grey[700]} size={20} />}
            maxLength={64}
            onChangeText={setCurrentPassword}
            onBlur={() => setTouched(current => ({ ...current, currentPassword: true }))}
            placeholder={strings.updatePassword.currentPasswordPlaceholder}
            error={currentPasswordError}
            touched={touched.currentPassword || submitAttempted}
            secureTextEntry
            showPasswordToggle
            value={currentPassword}
          />

          {/* New Password */}
          <CustomInput
            autoCapitalize="none"
            fullWidth
            label={strings.updatePassword.newPasswordLabel}
            labelPosition="above"
            leftIcon={<IconX name="lock" origin={ICON_TYPE.MATERIAL_ICONS} color={colors.grey[700]} size={20} />}
            maxLength={64}
            onChangeText={setNewPassword}
            onBlur={() => setTouched(current => ({ ...current, newPassword: true }))}
            placeholder={strings.updatePassword.newPasswordPlaceholder}
            error={newPasswordError}
            touched={touched.newPassword || submitAttempted}
            secureTextEntry
            showPasswordToggle
            value={newPassword}
          />


          {/* Confirm Password */}
          <View>
            {isMatch ? (
              <View style={styles.labelRow}>
                <View style={styles.flexSpacer} />
                <View style={styles.matchBadge}>
                  <IconX name="check-circle" origin={ICON_TYPE.MATERIAL_ICONS} color={colors.purple[700]} size={14} />
                  <Text style={styles.matchText}>{strings.updatePassword.matched}</Text>
                </View>
              </View>
            ) : null}
            <CustomInput
              autoCapitalize="none"
              fullWidth
              label={strings.updatePassword.confirmPasswordLabel}
              labelPosition="above"
              leftIcon={<IconX name="verified" origin={ICON_TYPE.MATERIAL_ICONS} color={colors.grey[700]} size={20} />}
              maxLength={64}
              onChangeText={setConfirmPassword}
              onBlur={() => setTouched(current => ({ ...current, confirmPassword: true }))}
              placeholder={strings.updatePassword.confirmPasswordPlaceholder}
              error={confirmPasswordError}
              touched={touched.confirmPassword || submitAttempted}
              secureTextEntry
              showPasswordToggle
              value={confirmPassword}
            />
          </View>

        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <CustomButton
            title={
              isSuccess
                ? strings.updatePassword.updated
                : loading
                  ? strings.updatePassword.updating
                  : strings.updatePassword.submit
            }
            onPress={handleUpdatePassword}
            loading={loading}
            variant={isSuccess ? 'secondary' : 'primary'}
            fullWidth
            rounded
            rightIcon={
              isSuccess ? (
                <IconX name="checkmark-circle" origin={ICON_TYPE.IONICONS} color={colors.white[100]} size={20} />
              ) : (
                <Text style={styles.buttonArrow}>→</Text>
              )
            }
            style={styles.submitButton}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate(navigationStrings.LOGIN)}
            style={styles.cancelButton}>
            <Text style={styles.cancelText}>{strings.updatePassword.cancel}</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
