import React, { useEffect, useState } from 'react';
import { Alert, AppState, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CustomHeader, ICON_TYPE, IconX } from '../../../components';
import CustomButton from '../../../components/CustomButton';
import { colors, navigationStrings, strings } from '../../../constants';
import { firebaseAuth } from '../../../services/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { useAppSelector } from '../../../store';
import { styles } from './styles';

type VerificationRouteParams = {
  role?: string;
  email?: string;
  isFromResetPassword?: boolean;
};

export default function Verification({
  route,
  navigation,
}: {
  route: { params?: VerificationRouteParams };
  navigation: any;
}) {
  const insets = useSafeAreaInsets();
  const { refreshSession } = useAuth();
  const authEmail = useAppSelector(state => state.auth.email);
  const emailVerified = useAppSelector(state => state.auth.emailVerified);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { email, isFromResetPassword } = route.params || {};
  const displayEmail = email || authEmail || strings.verification.email;

  useEffect(() => {
    if (emailVerified && !isFromResetPassword) {
      setVerified(true);
    }
  }, [emailVerified, isFromResetPassword]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        refreshSession();
      }
    });

    return () => subscription.remove();
  }, [refreshSession]);

  useEffect(() => {
    let navigateTimer: ReturnType<typeof setTimeout>;
    if (verified && isFromResetPassword) {
      navigateTimer = setTimeout(() => {
        navigation.navigate(navigationStrings.UPDATEPASSWORD);
      }, 500);
    }
    return () => {
      if (navigateTimer) clearTimeout(navigateTimer);
    };
  }, [verified, isFromResetPassword, navigation]);

  const handleVerify = async () => {
    // setTouched(true);
    setError('');

    setLoading(true);

    try {
      const user = firebaseAuth.currentUser;
      if (!user) {
        setError('Session expired. Please sign in again.');
        navigation.replace(navigationStrings.LOGIN);
        return;
      }

      await user.reload();

      if (!firebaseAuth.currentUser?.emailVerified) {
        Alert.alert(
          'Email not verified',
          'Please open the verification link in your email and verify your email before continuing.',
        );
        return;
      }

      // Re-sync Redux, profile data, and the cached local profile. RootNavigator
      // will switch from AuthStack to the role-specific app stack.
      await refreshSession();
      setVerified(true);
    } catch {
      setError('Unable to check verification status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <CustomHeader
        title={strings.verification.headerTitle}
        showBackButton
        onLeftPress={() => navigation.goBack()}
      />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        enableOnAndroid={false}
        enableAutomaticScroll={false}
        keyboardOpeningTime={0}
        enableResetScrollToCoords={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.shield}>
            <IconX
              name="shield-check"
              origin={ICON_TYPE.MATERIAL_COMMUNITY}
              color={styles.shieldIcon.color}
              size={styles.shieldIcon.fontSize}
            />
            <View style={styles.lockBadge}>
              <IconX name="lock-outline" origin={ICON_TYPE.MATERIAL_COMMUNITY} color={colors.white[100]} size={12} />
            </View>
          </View>
          <View accessibilityLabel="Step 2 of 4" style={styles.progress}>
            <View style={styles.progressActive} />
            <View style={styles.progressActive} />
            <View style={styles.progressInactive} />
            <View style={styles.progressInactive} />
          </View>
          <Text style={styles.heading}>{strings.verification.heading}</Text>
          <Text style={styles.instructions}>{strings.verification.instructions}</Text>
          <View style={styles.emailTag}>
            <IconX name="mail" origin={ICON_TYPE.MATERIAL_ICONS} color={styles.emailIcon.color} size={styles.emailIcon.fontSize} />
            <Text style={styles.emailAddress}>{displayEmail}</Text>
          </View>
        </View>

        <View style={styles.otpSection}>
          {/* <OtpInput value={pin} onChangeText={value => { setPin(value); setTouched(false); setError(''); }} /> */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={styles.openMailHint}>{strings.verification.openMailHint}</Text>
          {/* <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>{strings.verification.resendPrompt}</Text>
            {seconds > 0 ? (
              <Text style={styles.countdown}>◷ 0:{String(seconds).padStart(2, '0')}</Text>
            ) : (
              <Pressable accessibilityRole="button" onPress={resendCode} style={styles.resendButton}>
                <Text style={styles.resendText}>{strings.verification.resend}</Text>
              </Pressable>
            )}
          </View> */}
          <CustomButton
            disabled={verified}
            fullWidth
            loading={loading}
            rightIcon={<Text style={styles.buttonIcon}>→</Text>}
            size="medium"
            title={verified ? strings.verification.verified : strings.verification.verify}
            onPress={handleVerify}
            style={styles.verifyButton}
            textStyle={styles.verifyButtonText}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
