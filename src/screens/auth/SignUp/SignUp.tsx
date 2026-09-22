import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, images, strings, navigationStrings } from '../../../constants';
import { CustomHeader, CustomInput, ICON_TYPE, IconX, PhoneNumberInput } from '../../../components';
import { getEmailError, getFullNameError, getPasswordError, getPhoneError, getRequiredError, validateEmail, validateFullName, validatePassword, validatePhoneNumber, validateRequiredValue } from '../../../utils';
import { styles } from './styles';
import { createUserWithEmailAndPassword, sendEmailVerification } from '@react-native-firebase/auth';
import { firebaseAuth, saveUserProfile } from '../../../services/firebase';
import { storage } from '../../../services/storage';
import storageKeys from '../../../constants/storageKeys';
import { UserRole } from '../../../types/user';

type AccountRole = UserRole;

type SignUpProps = {
  navigation: any;
  route?: { params?: { role?: AccountRole } };
};

type FieldProps = {
  label: string;
  icon: string;
  iconOrigin?: ICON_TYPE;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  maxLength?: number;
  error?: string;
  touched?: boolean;
  onBlur?: () => void;
  disabled?: boolean;
};

function FormField({
  label,
  icon,
  iconOrigin = ICON_TYPE.MATERIAL_ICONS,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  maxLength,
  error,
  touched,
  onBlur,
  disabled = false,
}: FieldProps) {
  return (
    <CustomInput
      autoCapitalize="none"
      fullWidth
      iconSize={20}
      label={label}
      labelPosition="above"
      leftIcon={<IconX name={icon} origin={iconOrigin} color={colors.grey[700]} size={20} />}
      onChangeText={onChangeText}
      maxLength={maxLength}
      error={error}
      touched={touched}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      keyboardType={keyboardType}
    />
  );
}

export default function SignUp({ navigation, route }: SignUpProps) {
  const role = route?.params?.role ?? 'customer';
  const [fullName, setFullName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [category] = useState('');
  const [experience, setExperience] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState({ fullName: false, serviceName: false, experience: false, email: false, phone: false, password: false, terms: false });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const isProvider = role === 'provider';
  const touch = (field: keyof typeof touched) => setTouched(current => ({ ...current, [field]: true }));
  const fullNameError = getFullNameError(fullName, touched.fullName || submitAttempted);
  const serviceNameError = getRequiredError(serviceName, touched.serviceName || submitAttempted, 'Service name');
  const experienceError = getRequiredError(experience, touched.experience || submitAttempted, 'Experience');
  const emailError = getEmailError(email, touched.email || submitAttempted);
  const phoneError = getPhoneError(phone, touched.phone || submitAttempted);
  const passwordError = getPasswordError(password, touched.password || submitAttempted);

  const handleSubmit = async () => {
    console.log('[SignUp] submit started | role:', role);
    setSubmitAttempted(true);

    setTouched({
      fullName: true,
      serviceName: isProvider,
      experience: isProvider,
      email: true,
      phone: true,
      password: true,
      terms: true,
    });

    const valid =
      validateFullName(fullName) &&
      validateEmail(email) &&
      validatePhoneNumber(phone) &&
      validatePassword(password) &&
      acceptedTerms &&
      (!isProvider ||
        (validateRequiredValue(serviceName) &&
          validateRequiredValue(experience)));

    if (!valid) {
      console.warn('[SignUp] validation failed');
      return;
    }

    setLoading(true);
    setAuthError('');

    try {
      console.log('[SignUp] creating Firebase account');
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
      );

      const { uid } = userCredential.user;
      console.log('[SignUp] Firebase account created | uid:', uid);

      const profilePayload = {
        email: email.trim(),
        fullName: fullName.trim(),
        phone,
        role,
        serviceName: isProvider ? serviceName.trim() : undefined,
        experience: isProvider ? experience.trim() : undefined,
        category: isProvider ? category.trim() || undefined : undefined,
      };
      console.log('[SignUp] saving profile | uid:', uid);
      const savedProfile = await saveUserProfile(uid, profilePayload);
      storage.set(storageKeys.USER_DATA, JSON.stringify(savedProfile));
      console.log('[SignUp] profile saved | uid:', uid);

      console.log('[SignUp] sending verification email | uid:', uid);
      await sendEmailVerification(userCredential.user);
      console.log('[SignUp] verification email sent | uid:', uid);

      navigation.navigate(navigationStrings.VERIFICATION, {
        role,
        email: email.trim(),
      });

    } catch (error: any) {
      console.error('[SignUp] failed | code:', error?.code ?? 'unknown', '| message:', error?.message ?? error);
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered');
      } else if (error.code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters');
      } else {
        setAuthError('Unable to create account. Please try again.');
      }
    } finally {
      console.log('[SignUp] submit finished');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title={isProvider ? strings.signUp.providerRegistration : strings.signUp.customerRegistration}
        showBackButton
        onLeftPress={() => {
          if (!loading) {
            navigation.goBack();
          }
        }}
      />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        enableOnAndroid
        bounces={false}
        enableAutomaticScroll
        extraScrollHeight={Platform.OS === 'android' ? 180 : 120}
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.logoFrame}>
            <Image source={images.logo} style={styles.logo} />
          </View>
          <Text style={styles.heading}>
            {isProvider ? strings.signUp.providerHeading : strings.signUp.customerHeading}
          </Text>
          <Text style={styles.subheading}>
            {isProvider
              ? strings.signUp.providerSubheading
              : strings.signUp.customerSubheading}
          </Text>
        </View>

        <View style={styles.form}>
          <FormField
            icon="badge"
            iconOrigin={ICON_TYPE.MATERIAL_ICONS}
            label={isProvider ? strings.signUp.fullLegalName : strings.signUp.fullName}
            maxLength={35}
            error={fullNameError}
            touched={touched.fullName || submitAttempted}
            onBlur={() => touch('fullName')}
            onChangeText={setFullName}
            placeholder={isProvider ? 'Jane Doe' : 'Alex Johnson'}
            value={fullName}
            disabled={loading}
          />

          {isProvider ? (
            <>
              <FormField
                icon="storefront"
                iconOrigin={ICON_TYPE.MATERIAL_ICONS}
                label={strings.signUp.serviceName}
                maxLength={35}
                error={serviceNameError}
                touched={touched.serviceName || submitAttempted}
                onBlur={() => touch('serviceName')}
                onChangeText={setServiceName}
                placeholder="Apex Home & Repair LLC"
                value={serviceName}
                disabled={loading}
              />
              <FormField
                icon="history-edu"
                iconOrigin={ICON_TYPE.MATERIAL_ICONS}
                label={strings.signUp.experience}
                maxLength={2}
                error={experienceError}
                touched={touched.experience || submitAttempted}
                onBlur={() => touch('experience')}
                onChangeText={setExperience}
                placeholder="Select your experience"
                value={experience}
                keyboardType="phone-pad"
                disabled={loading}
              />
              <FormField
                icon="mail"
                iconOrigin={ICON_TYPE.MATERIAL_ICONS}
                keyboardType="email-address"
                label={strings.signUp.businessEmail}
                maxLength={35}
                error={emailError}
                touched={touched.email || submitAttempted}
                onBlur={() => touch('email')}
                onChangeText={setEmail}
                placeholder="pro@repairservice.com"
                value={email}
                disabled={loading}
              />
              <PhoneNumberInput
                label={strings.signUp.mobilePhone}
                labelPosition="above"
                maxLength={10}
                error={phoneError}
                touched={touched.phone || submitAttempted}
                onBlur={() => touch('phone')}
                onChangeText={setPhone}
                placeholder="(555) 019-2834"
                value={phone}
                disabled={loading}
              />
            </>
          ) : (
            <>
              <FormField
                icon="mail"
                iconOrigin={ICON_TYPE.MATERIAL_ICONS}
                keyboardType="email-address"
                label={strings.signUp.email}
                maxLength={35}
                error={emailError}
                touched={touched.email || submitAttempted}
                onBlur={() => touch('email')}
                onChangeText={setEmail}
                placeholder="jane.doe@example.com"
                value={email}
                disabled={loading}
              />
              <PhoneNumberInput
                label={strings.signUp.phone}
                labelPosition="above"
                maxLength={10}
                error={phoneError}
                touched={touched.phone || submitAttempted}
                onBlur={() => touch('phone')}
                onChangeText={setPhone}
                placeholder="(555) 019-2834"
                value={phone}
                disabled={loading}
              />
            </>
          )}

          <CustomInput
            autoCapitalize="none"
            fullWidth
            label={strings.signUp.password}
            labelPosition="above"
            leftIcon={<IconX name="lock" origin={ICON_TYPE.MATERIAL_ICONS} color={colors.grey[700]} size={20} />}
            maxLength={10}
            error={passwordError}
            touched={touched.password || submitAttempted}
            onBlur={() => touch('password')}
            onChangeText={setPassword}
            placeholder="Create a secure password"
            secureTextEntry
            showPasswordToggle
            value={password}
            disabled={loading}
          />

          <Pressable accessibilityRole="checkbox" disabled={loading} accessibilityState={{ checked: acceptedTerms }} onPress={() => setAcceptedTerms(current => !current)} style={styles.termsRow}>
            <View style={[styles.checkbox, acceptedTerms && styles.checkedBox]}>
              {acceptedTerms ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </View>
            <Text style={styles.termsText}>
              {strings.signUp.termsAgreement} <Text style={styles.linkText}>{isProvider ? strings.signUp.providerTerms : strings.signUp.terms}</Text> {strings.signUp.agreementJoiner} <Text style={styles.linkText}>{isProvider ? strings.signUp.backgroundCheck : strings.signUp.privacy}</Text>.
            </Text>
          </Pressable>
          {submitAttempted && !acceptedTerms ? <Text style={styles.validationError}>Please accept the terms to continue</Text> : null}
          {authError ? <Text style={styles.validationError}>{authError}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={handleSubmit}
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressedButton, loading && styles.pressedButton]}>
            <Text style={styles.submitText}>
              {loading ? 'Creating account...' : isProvider ? strings.signUp.providerSubmit : strings.signUp.customerSubmit}
            </Text>
            {!loading ? <Text style={styles.submitArrow}>→</Text> : null}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerPrompt}>{strings.common.alreadyHaveAccount}</Text>
          <Pressable accessibilityRole="button"
            disabled={loading}
            onPress={() => navigation.replace(navigationStrings.LOGIN)}>
            <Text style={styles.signInText}>{strings.common.signIn}</Text>
          </Pressable>
        </View>

      </KeyboardAwareScrollView>
    </View>
  );
}

