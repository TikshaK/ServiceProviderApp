import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, fonts, navigationStrings } from '../../constants';
import { fontSize } from '../../constants/metrics';
import { CustomerHome, CustomerBookings, CustomerNotifications, CustomerProfile, CustomerServiceDetails, CustomerSearchFilterServices, CustomerBookService, BookingServiceSuccess, CustomerBookingDetails, ReviewBooking, EditCustomerProfile, SavedAddresses, AddEditAddress } from '../../screens/customerScreens';

const Stack = createNativeStackNavigator();
interface NavigationProps {
  navigation: any;
  route: any;
}

const CustomerPlaceholderScreen: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>{title}</Text>
    <Text style={styles.placeholderSub}>Coming Soon</Text>
  </View>
);

const commonDetailScreens = () => [];

const CustomerHomeStack: React.FC<NavigationProps> = ({ navigation, route }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
      <Stack.Screen
        name={navigationStrings.CUSTOMER_HOME}
        component={CustomerHome}
      />
      <Stack.Screen
        name={navigationStrings.CUSTOMER_SEARCH_FILTER_SERVICES}
        component={CustomerSearchFilterServices}
      />
      <Stack.Screen
        name={navigationStrings.CUSTOMER_SERVICE_DETAILS}
        component={CustomerServiceDetails}
      />
      <Stack.Screen
        name={navigationStrings.CUSTOMER_BOOK_SERVICE}
        component={CustomerBookService}
      />
      <Stack.Screen
        name={navigationStrings.CUSTOMER_BOOKING_SUCCESS}
        component={BookingServiceSuccess}
      />
      {commonDetailScreens()}
    </Stack.Navigator>
  );
};

const CustomerBookingsStack: React.FC<NavigationProps> = ({ navigation, route }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
      <Stack.Screen
        name={navigationStrings.CUSTOMER_BOOKINGS}
        component={CustomerBookings}
      />
      <Stack.Screen
        name={navigationStrings.CUSTOMER_BOOKING_DETAILS}
        component={CustomerBookingDetails}
      />
      <Stack.Screen
        name={navigationStrings.CUSTOMER_SEARCH_FILTER_SERVICES}
        component={CustomerSearchFilterServices}
      />
      <Stack.Screen
        name={navigationStrings.CUSTOMER_REVIEW_BOOKING}
        component={ReviewBooking}
      />
      {commonDetailScreens()}
    </Stack.Navigator>
  );
};

const CustomerNotificationsStack: React.FC<NavigationProps> = ({ navigation, route }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
      <Stack.Screen
        name={navigationStrings.NOTIFICATIONS}
        component={CustomerNotifications}
      />
      {commonDetailScreens()}
    </Stack.Navigator>
  );
};

const CustomerProfileStack: React.FC<NavigationProps> = ({ navigation, route }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
      <Stack.Screen
        name={navigationStrings.CUSTOMER_PROFILE}
        component={CustomerProfile}
      />
      <Stack.Screen
        name={navigationStrings.CUSTOMER_EDIT_PROFILE}
        component={EditCustomerProfile}
      />
      <Stack.Screen
        name={navigationStrings.CUSTOMER_SAVED_ADDRESSES}
        component={SavedAddresses}
      />
      <Stack.Screen
        name={navigationStrings.CUSTOMER_ADD_EDIT_ADDRESS}
        component={AddEditAddress}
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

export { CustomerHomeStack, CustomerBookingsStack, CustomerNotificationsStack, CustomerProfileStack };

