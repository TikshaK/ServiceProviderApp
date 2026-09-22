import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, fonts, navigationStrings } from '../../constants';
import { fontSize } from '../../constants/metrics';
import { ProviderHome, ProviderBookings, BookingDetails, ProviderServices, ProviderProfile, AddEditServices, ProviderEditProfile, EarningsAndReviews } from '../../screens/providerScreens';

const Stack = createNativeStackNavigator();
interface NavigationProps {
  navigation: any;
  route: any;
}

const ProviderPlaceholderScreen: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>{title}</Text>
    <Text style={styles.placeholderSub}>Coming Soon</Text>
  </View>
);

const commonDetailScreens = () => [];

const ProviderHomeStack: React.FC<NavigationProps> = ({ navigation, route }) => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'ios_from_right' }}
    >
      <Stack.Screen
        name={navigationStrings.PROVIDER_HOME}
        component={ProviderHome}
      />
      {commonDetailScreens()}
    </Stack.Navigator>
  );
};

const ProviderBookingsStack: React.FC<NavigationProps> = ({ navigation, route }) => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'ios_from_right' }}
    >
      <Stack.Screen
        name={navigationStrings.PROVIDER_BOOKINGS}
        component={ProviderBookings}
      />
      <Stack.Screen
        name={navigationStrings.PROVIDER_BOOKING_DETAILS}
        component={BookingDetails}
      />
      {commonDetailScreens()}
    </Stack.Navigator>
  );
};

const ProviderServicesStack: React.FC<NavigationProps> = ({ navigation, route }) => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'ios_from_right' }}
    >
      <Stack.Screen
        name={navigationStrings.PROVIDER_SERVICES}
        component={ProviderServices}
      />
      <Stack.Screen
        name={navigationStrings.ADD_EDIT_SERVICES}
        component={AddEditServices}
      />
      {commonDetailScreens()}
    </Stack.Navigator>
  );
};

const ProviderProfileStack: React.FC<NavigationProps> = ({ navigation, route }) => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'ios_from_right' }}
    >
      <Stack.Screen
        name={navigationStrings.PROVIDER_PROFILE}
        component={ProviderProfile}
      />
      <Stack.Screen
        name={navigationStrings.PROVIDER_EDIT_PROFILE}
        component={ProviderEditProfile}
      />
      <Stack.Screen
        name={navigationStrings.PROVIDER_EARNINGS_REVIEWS}
        component={EarningsAndReviews}
      />
      {commonDetailScreens()}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white[100],
  },
  placeholderTitle: {
    fontSize: fontSize[20],
    fontFamily: fonts.SemiBold,
    color: colors.black[500],
    marginBottom: 8,
  },
  placeholderSub: {
    fontSize: fontSize[14],
    fontFamily: fonts.Regular,
    color: colors.grey[400],
  },
});

export { ProviderHomeStack, ProviderBookingsStack, ProviderServicesStack, ProviderProfileStack };

