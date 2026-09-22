import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import AuthStack from './Stacks/AuthStack';
import { ProviderTabNavigator } from './Tabs/ProviderTabNavigator';
import { CustomerTabNavigator } from './Tabs/CustomerTabNavigator';
import { useAuth } from '../hooks/useAuth';
import { colors, navigationStrings } from '../constants';

export function RootNavigator() {
  const { isAuthenticated, isLoading, isHydrating, emailVerified, role, email, uid } = useAuth();

  console.log('[RootNavigator] auth state:', {
    isAuthenticated,
    isLoading,
    isHydrating,
    emailVerified,
    uid,
    role,
  });

  if (isLoading || isHydrating) {
    console.log('[RootNavigator] rendering loader');
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.purple[50] 
        }}>
        <ActivityIndicator size="large" color={colors.purple[700]} />
      </View>
    );
  }

  if (!isAuthenticated) {
    console.log('[RootNavigator] rendering signed-out auth stack');
    return <AuthStack key="auth-signed-out" initialRouteName={navigationStrings.WELCOME} />;
  }

  // Only verified Firebase users reach the authenticated app stacks.
  // Customer routing is only used when the profile explicitly resolves to 'customer'.
  if (role === 'customer') {
    return <CustomerTabNavigator />;
  }

  return <ProviderTabNavigator />;
}
