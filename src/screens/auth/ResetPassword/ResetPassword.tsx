import React, { useState } from 'react';
import { Alert, Platform, Pressable, StatusBar, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sendPasswordResetEmail } from '@react-native-firebase/auth';
import { colors, navigationStrings, strings } from '../../../constants';
import { CustomButton, CustomHeader, CustomInput, ICON_TYPE, IconX } from '../../../components';
import { getEmailError, showToast, validateEmail } from '../../../utils';
import { firebaseAuth, isRegisteredEmail } from '../../../services/firebase';
import { styles } from './styles';

type RoleType = 'customer' | 'provider';

type ResetPasswordProps = {
  navigation: any;
  route?: { params?: { role?: RoleType } };
};

export default function ResetPassword({ navigation, route }: ResetPasswordProps) {
  const insets = useSafeAreaInsets();
  const role = route?.params?.role ?? 'customer';
  const isProvider = role === 'provider';

  const [email, setEmail] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState({ email: false });
  const [loading, setLoading] = useState(false);

  const emailError = getEmailError(email, touched.email || submitAttempted);

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setTouched({ email: true });
    if (!validateEmail(email)) return;

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const registered = await isRegisteredEmail(normalizedEmail);
      if (!registered) {
        showToast({ type: 'error', title: strings.alerts.accountNotFound, message: strings.alerts.notRegistered });
        return;
      }

      await sendPasswordResetEmail(firebaseAuth, normalizedEmail);
      Alert.alert(
        strings.resetPassword.successTitle,
        `${strings.resetPassword.successMessage} ${normalizedEmail}. ${strings.resetPassword.successNextStep}`,
        [{ text: strings.resetPassword.successButton, onPress: () => navigation.replace(navigationStrings.LOGIN) }],
      );
    } catch (error: any) {
      if (error?.code === 'auth/invalid-email') {
        showToast({ type: 'error', title: strings.alerts.invalidEmail, message: strings.alerts.validEmail });
      } else if (error?.code === 'auth/user-not-found') {
        showToast({ type: 'error', title: strings.alerts.accountNotFound, message: strings.alerts.notRegistered });
      } else {
        showToast({ type: 'error', title: strings.alerts.unableToSendEmail, message: strings.alerts.resetEmailFailed });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />
      <CustomHeader
        title={isProvider ? strings.resetPassword.providerTitle : strings.resetPassword.customerTitle}
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
        <View style={styles.intro}>
          <View style={styles.logoFrame}>
            <IconX name="lock-reset" origin={ICON_TYPE.MATERIAL_COMMUNITY} color={colors.purple[700]} size={36} />
            <View style={styles.verifiedBadge}>
              <IconX name="verified" origin={ICON_TYPE.MATERIAL_ICONS} color={colors.white[100]} size={12} />
            </View>
          </View>
          <Text style={styles.heading}>{strings.resetPassword.heading}</Text>
          <Text style={styles.subheading}>{strings.resetPassword.subheading}</Text>
        </View>

        {/* Input Form */}
        <View style={styles.form}>
          <CustomInput
            autoCapitalize="none"
            fullWidth
            label={strings.resetPassword.emailLabel}
            labelPosition="above"
            leftIcon={<IconX name="mail" origin={ICON_TYPE.MATERIAL_ICONS} color={colors.grey[700]} size={20} />}
            maxLength={64}
            onChangeText={text => {
              setEmail(text);
            }}
            onBlur={() => setTouched(current => ({ ...current, email: true }))}
            placeholder={strings.resetPassword.emailPlaceholder}
            error={emailError}
            touched={touched.email || submitAttempted}
            value={email}
            keyboardType="email-address"
          />

          <CustomButton
            title={strings.resetPassword.submitEmail}
            onPress={handleSubmit}
            loading={loading}
            rightIcon={<Text style={styles.buttonArrow}>→</Text>}
            variant="primary"
            fullWidth
            rounded
            style={styles.submitButton}
          />
        </View>

        {/* Footer Navigation Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{strings.resetPassword.rememberPasswordPrompt}</Text>
          <Pressable accessibilityRole="button" onPress={() => {
            navigation.goBack();
          }}>
            <Text style={styles.footerLink}>{strings.resetPassword.signIn}</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
