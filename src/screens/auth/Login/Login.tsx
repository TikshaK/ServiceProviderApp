import React, { useState } from 'react';
import { Platform, Pressable, StatusBar, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword, signOut } from '@react-native-firebase/auth';
import { colors, navigationStrings, strings } from '../../../constants';
import { CustomButton, CustomHeader, CustomInput, ICON_TYPE, IconX } from '../../../components';
import { firebaseAuth, getUserProfile } from '../../../services/firebase';
import { getEmailError, getPasswordError, validateEmail, validatePassword } from '../../../utils';
import { setInteractiveLoginInProgress, syncAuthenticatedUser, useAppDispatch } from '../../../store';
import { styles } from './styles';

type LoginProps = {
  navigation: any;
};

export default function Login({ navigation }: LoginProps) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const emailError = getEmailError(email, touched.email || submitAttempted);
  const passwordError = getPasswordError(password, touched.password || submitAttempted);

  const handleLogin = async () => {
    console.log('[Login] handleLogin called with email:', email.trim());
    setSubmitAttempted(true);
    setTouched({ email: true, password: true });
    setAuthError('');

    const emailOk = validateEmail(email);
    const passwordOk = validatePassword(password);
    console.log('[Login] validation -> emailValid:', emailOk, '| passwordValid:', passwordOk);
    if (!emailOk || !passwordOk) {
      console.warn('[Login] validation failed. Aborting before hitting Firebase.');
      return;
    }

    setLoading(true);
    setInteractiveLoginInProgress(true);

    try {
      console.log('[Login] calling signInWithEmailAndPassword(email):', email.trim());
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      const { uid, email: fbEmail, emailVerified } = userCredential.user;
      console.log('[Login] signInWithEmailAndPassword SUCCESS -> uid:', uid, '| email:', fbEmail, '| emailVerified:', emailVerified);

      const currentUser = firebaseAuth.currentUser;
      if (currentUser) {
        console.log('[Login] currentUser present, calling reload()...');
        await currentUser.reload();
        console.log('[Login] reload() done -> emailVerified:', currentUser.emailVerified, '| email:', currentUser.email);

        if (!currentUser.emailVerified) {
          await signOut(firebaseAuth);
          setAuthError('Please verify your email from your inbox, then try signing in again.');
          return;
        }

        console.log('[Login] fetching profile from DB for uid:', currentUser.uid);
        const profile = await getUserProfile(currentUser.uid);
        console.log('[Login] getUserProfile result:', profile ? `role=${profile.role} | fullName=${profile.fullName} | serviceName=${profile.serviceName ?? '-'}` : 'NO PROFILE FOUND');
        console.log('[Login] profile role resolved by database:', profile?.role ?? 'unknown');
        await syncAuthenticatedUser(dispatch, currentUser);
      } else {
        console.warn('[Login] signIn succeeded but currentUser is null!');
      }
    } catch (error: any) {
      console.error('[Login] FAILED -> code:', error?.code ?? 'N/A', '| message:', error?.message ?? error, '| nativeErrorMessage:', error?.nativeErrorMessage ?? 'N/A');
      switch (error.code) {
        case 'auth/invalid-credential':
          setAuthError('Invalid email or password');
          break;
        case 'auth/invalid-email':
          setAuthError('Invalid email address');
          break;
        case 'auth/user-disabled':
          setAuthError('This account has been disabled');
          break;
        case 'auth/too-many-requests':
          setAuthError('Too many login attempts. Please try again later.');
          break;
        default:
          setAuthError('Unable to sign in. Please try again.');
      }
    } finally {
      setInteractiveLoginInProgress(false);
      console.log('[Login] finished. Loading set to false. Awaiting onAuthStateChanged to drive navigation.');
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />
      <CustomHeader 
      title="Sign In" 
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
            <IconX name="lock-open" origin={ICON_TYPE.MATERIAL_ICONS} color={colors.purple[700]} size={32} />
          </View>
          <Text style={styles.heading}>{strings.login.heading}</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            autoCapitalize="none"
            fullWidth
            label={strings.login.email}
            labelPosition="above"
            leftIcon={<IconX name="mail" origin={ICON_TYPE.MATERIAL_ICONS} color={colors.grey[700]} size={20} />}
            maxLength={64}
            onChangeText={setEmail}
            onBlur={() => setTouched(current => ({ ...current, email: true }))}
            placeholder={strings.login.emailPlaceholder}
            error={emailError}
            touched={touched.email || submitAttempted}
            value={email}
            keyboardType="email-address"
          />

          <CustomInput
            autoCapitalize="none"
            fullWidth
            label={strings.login.password}
            labelPosition="above"
            leftIcon={<IconX name="lock" origin={ICON_TYPE.MATERIAL_ICONS} color={colors.grey[700]} size={20} />}
            maxLength={64}
            onChangeText={setPassword}
            onBlur={() => setTouched(current => ({ ...current, password: true }))}
            placeholder={strings.login.passwordPlaceholder}
            error={passwordError}
            touched={touched.password || submitAttempted}
            secureTextEntry
            showPasswordToggle
            value={password}
          />

          {authError ? <Text style={styles.validationError}>{authError}</Text> : null}

          <View style={styles.optionsRow}>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate(navigationStrings.RESETPASSWORD)}>
              <Text style={styles.forgotText}>{strings.login.forgotPassword}</Text>
            </Pressable>
          </View>

          <CustomButton
            title={strings.login.submit}
            onPress={handleLogin}
            rightIcon={<Text style={styles.buttonArrow}>→</Text>}
            variant="primary"
            fullWidth
            rounded
            loading={loading}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{strings.login.noAccount}</Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.replace(navigationStrings.SIGNUP)}>
            <Text style={styles.footerLink}>{strings.login.signUp}</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
