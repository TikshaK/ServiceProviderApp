import React, { useEffect } from 'react';
import { navigationStrings } from '../../constants';
import { Login, ResetPassword, SignUp, UpdatePassword, Verification, Welcome } from '../../screens/auth';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../../store';

const Stack = createNativeStackNavigator();

type AuthStackProps = {
  initialRouteName?: string;
  verificationParams?: {
    role?: string;
    email?: string;
  };
};

function AuthStackNavigator({
  initialRouteName = navigationStrings.WELCOME,
  verificationParams,
}: AuthStackProps) {
  const authEmail = useAppSelector(state => state.auth.email);
  const verificationEmail = verificationParams?.email ?? authEmail;

  useEffect(() => {
    console.log('[AuthStack] mounted:', {
      initialRouteName,
      verificationEmail,
    });

    return () => console.log('[AuthStack] unmounted:', initialRouteName);
  }, [initialRouteName, verificationEmail]);

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name={navigationStrings.WELCOME} component={Welcome} />
      <Stack.Screen name={navigationStrings.SIGNUP} component={SignUp} />
      <Stack.Screen name={navigationStrings.LOGIN} component={Login} />
      <Stack.Screen
        name={navigationStrings.VERIFICATION}
        component={Verification}
        initialParams={{
          email: verificationEmail ?? undefined,
          role: verificationParams?.role,
        }}
      />
      <Stack.Screen name={navigationStrings.RESETPASSWORD} component={ResetPassword} />
      <Stack.Screen name={navigationStrings.UPDATEPASSWORD} component={UpdatePassword} />
    </Stack.Navigator>
  );
}

const AuthStack = (props: AuthStackProps) => <AuthStackNavigator {...props} />;

export const VerificationStack = (props: AuthStackProps) => (
  <AuthStackNavigator
    {...props}
    initialRouteName={navigationStrings.VERIFICATION}
  />
);

export default AuthStack;
