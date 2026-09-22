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

const PROVIDER_TAB_CONFIG: Record<string, TabConfig> = {
    [navigationStrings.PROVIDER_HOME_STACK]: { icon: 'home', label: 'Home', origin: ICON_TYPE.OCTICONS },
    [navigationStrings.PROVIDER_BOOKINGS_STACK]: { icon: 'calendar-outline', label: 'Bookings', origin: ICON_TYPE.IONICONS },
    [navigationStrings.PROVIDER_SERVICES_STACK]: { icon: 'tools', label: 'Services', origin: ICON_TYPE.FONT_AWESOME5 },
    [navigationStrings.PROVIDER_PROFILE_STACK]: { icon: 'user', label: 'Profile', origin: ICON_TYPE.FEATHER_ICONS },
};

const noTabsRoutes: string[] = [
    navigationStrings.ADD_EDIT_SERVICES,
    navigationStrings.PROVIDER_EDIT_PROFILE,
    navigationStrings.PROVIDER_EARNINGS_REVIEWS,
    navigationStrings.PROVIDER_BOOKING_DETAILS,
];

export const ProviderTabNavigator = () => {
    const insets = useSafeAreaInsets();

    const bottomInset = Math.max(insets.bottom, 12);
    const dynamicTabBar = {
        ...styles.tabBar,
        // height: 40 + bottomInset,
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
                    const tab = PROVIDER_TAB_CONFIG[route.name];



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
                    const tab = PROVIDER_TAB_CONFIG[route.name];
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
                name={navigationStrings.PROVIDER_HOME_STACK}
                component={ProviderHomeStack} />

            <Tab.Screen
                name={navigationStrings.PROVIDER_BOOKINGS_STACK}
                component={ProviderBookingsStack} />
            <Tab.Screen
                name={navigationStrings.PROVIDER_SERVICES_STACK}
                component={ProviderServicesStack}
                listeners={({ navigation }) => ({
                    // Create Listing stays mounted as a tab and may have been left in edit
                    // mode (opened from Vehicle Details' pencil). Flag a reset so a normal
                    // "Sell" tap always opens a blank create form; the screen consumes the
                    // flag on focus.
                    tabPress: () => {

                    },
                })}
            />
            <Tab.Screen
                name={navigationStrings.PROVIDER_PROFILE_STACK}
                component={ProviderProfileStack}
                listeners={({ navigation }) => ({
                    // Tapping Profile always returns to the Profile root — navigating to a
                    // screen already in the stack (Profile) pops everything above it (Edit
                    // Profile, My Listings, etc.), so the tab never reopens on a sub-screen.
                    tabPress: () => {
                        // navigation.navigate(navigationStrings.PROFILE_STACK, {
                        //   screen: navigationStrings.PROFILE,
                        // });
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