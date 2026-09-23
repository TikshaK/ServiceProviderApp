import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconX } from '../../components';
import { colors, fonts, navigationStrings, sWidth } from '../../constants';
import { ICON_TYPE } from '../../components/IconX';
import { fontSize } from '../../constants/metrics';
import { CustomerBookingsStack, CustomerHomeStack, CustomerNotificationsStack, CustomerProfileStack } from '../Stacks/CustomerStacks';
import { ProviderBookingsStack, ProviderHomeStack, ProviderProfileStack, ProviderServicesStack } from '../Stacks/ProviderStacks';

const Tab = createBottomTabNavigator();

const ComingSoonScreen: React.FC = () => (
    <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Coming Soon</Text>
    </View>
);

type TabConfig = {
    icon: string;
    label: string;
    origin: ICON_TYPE;
    isFab?: boolean;
};


const CUSTOMER_TAB_CONFIG: Record<string, TabConfig> = {
    [navigationStrings.CUSTOMER_HOME_STACK]: { icon: 'home', label: 'Home', origin: ICON_TYPE.OCTICONS },
    [navigationStrings.CUSTOMER_BOOKINGS_STACK]: { icon: 'calendar-outline', label: 'Bookings', origin: ICON_TYPE.IONICONS },
    [navigationStrings.CUSTOMER_NOTIFICATIONS_STACK]: { icon: 'bell-outline', label: 'Notifications', origin: ICON_TYPE.MATERIAL_COMMUNITY },
    [navigationStrings.CUSTOMER_PROFILE_STACK]: { icon: 'user', label: 'Profile', origin: ICON_TYPE.FEATHER_ICONS },
};


const noTabsRoutes: string[] = [
    navigationStrings.CUSTOMER_SEARCH_FILTER_SERVICES,
    navigationStrings.CUSTOMER_SERVICE_DETAILS,
    navigationStrings.CUSTOMER_BOOK_SERVICE,
    navigationStrings.CUSTOMER_BOOKING_SUCCESS,
    navigationStrings.CUSTOMER_BOOKING_DETAILS,
    navigationStrings.CUSTOMER_REVIEW_BOOKING,
    navigationStrings.CUSTOMER_EDIT_PROFILE,
    navigationStrings.CUSTOMER_SAVED_ADDRESSES,
    navigationStrings.CUSTOMER_ADD_EDIT_ADDRESS,
];


export const CustomerTabNavigator = () => {
    const insets = useSafeAreaInsets();

    // Add the bottom safe-area inset to the tab bar so it clears the system
    // gesture/nav bar. On Android 15+ (edge-to-edge is forced) this inset is the
    // nav-bar height; on iOS it's the home-indicator height; on older Androids
    // that aren't edge-to-edge it's ~0, so those devices are unaffected. A small
    // floor keeps a comfortable gap when the inset is 0.
    const bottomInset = Math.max(insets.bottom, 12);
    const dynamicTabBar = {
        ...styles.tabBar,
        paddingBottom: bottomInset,
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarButton: (props) => (
                    <TouchableOpacity
                        {...(props as React.ComponentProps<typeof TouchableOpacity>)}
                        activeOpacity={1}
                    />
                ),
                tabBarStyle: ((route) => {
                    const routeName = getFocusedRouteNameFromRoute(route);

                    // If we're on the root tab screen, show tabs
                    if (!routeName) {
                        return dynamicTabBar;
                    }

                    // Check if the current nested route is in our 'hidden' list
                    if (noTabsRoutes.includes(routeName)) {
                        return { display: 'none' };
                    }

                    // Default style when tabs should be visible
                    return dynamicTabBar;
                })(route),
                tabBarIcon: ({ focused }) => {
                    const tab = CUSTOMER_TAB_CONFIG[route.name];


                    return (
                        <IconX
                            name={tab?.icon}
                            size={22}
                            color={focused ? colors.purple[700] : colors.black[250]}
                            origin={tab?.origin}
                        />
                    );
                },
                tabBarLabel: ({ focused }) => {
                    const tab = CUSTOMER_TAB_CONFIG[route.name];
                    return (
                        <Text
                            allowFontScaling={false}
                            numberOfLines={1}
                            style={[styles.tabLabel, focused && styles.tabLabelActive]}
                        >
                            {tab?.label}
                        </Text>
                    );
                },
            })}
        >
            <Tab.Screen
                name={navigationStrings.CUSTOMER_HOME_STACK}
                component={CustomerHomeStack}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate(navigationStrings.CUSTOMER_HOME_STACK, {
                            screen: navigationStrings.CUSTOMER_HOME,
                        });
                    },
                })}
            />
            <Tab.Screen
                name={navigationStrings.CUSTOMER_BOOKINGS_STACK}
                component={CustomerBookingsStack}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate(navigationStrings.CUSTOMER_BOOKINGS_STACK, {
                            screen: navigationStrings.CUSTOMER_BOOKINGS,
                        });
                    },
                })}
            />
            <Tab.Screen
                name={navigationStrings.CUSTOMER_NOTIFICATIONS_STACK}
                component={CustomerNotificationsStack}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate(navigationStrings.CUSTOMER_NOTIFICATIONS_STACK, {
                            screen: navigationStrings.NOTIFICATIONS,
                        });
                    },
                })}
            />
            <Tab.Screen
                name={navigationStrings.CUSTOMER_PROFILE_STACK}
                component={CustomerProfileStack}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate(navigationStrings.CUSTOMER_PROFILE_STACK, {
                            screen: navigationStrings.CUSTOMER_PROFILE,
                        });
                    },
                })}
            />
        </Tab.Navigator>
    );
};


const styles = StyleSheet.create({
    tabBar: {
        height: 78,
        paddingTop: 8,
        paddingBottom: 18,
        backgroundColor: colors.white[100],
        borderTopWidth: 1,
        borderTopColor: colors.grey?.[100] ?? '#EEEEEE',
        display: 'flex', // ✅ Ensure it's visible by default
    },
    tabLabel: {
        fontSize: fontSize[11],
        fontFamily: fonts.Regular,
        color: colors.grey[400],
    },
    tabLabelActive: {
        color: colors.purple[700],
        fontFamily: fonts.SemiBold,
    },
    fabButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -sWidth * 0.1,
        borderWidth: 3,
        borderColor: colors.white[100],
        shadowColor: colors.grey[400],
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 4
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white[100],
    },
    placeholderText: {
        fontSize: fontSize[16],
        fontFamily: fonts.Regular,
        color: colors.grey[400],
    },
});