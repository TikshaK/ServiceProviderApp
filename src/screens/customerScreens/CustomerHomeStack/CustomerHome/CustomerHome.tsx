import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { CustomSearchBar, EmptyState, ICON_TYPE, IconX } from '../../../../components';
import { useFocusEffect } from '@react-navigation/native';
import { colors, navigationStrings, SERVICE_CATEGORIES, strings } from '../../../../constants';
import { useAppSelector } from '../../../../store';
import { getAddresses, getServices } from '../../../../services/firebase';
import { styles } from './styles';

const CATEGORY_META = [
    { id: '1', name: 'Plumbing', icon: 'plumbing', color: '#2563EB', bgColor: '#EFF6FF', origin: ICON_TYPE.MATERIAL_ICONS },
    { id: '2', name: 'Electrical', icon: 'bolt', color: '#D97706', bgColor: '#FFFBEB', origin: ICON_TYPE.MATERIAL_ICONS },
    { id: '3', name: 'Cleaning', icon: 'cleaning-services', color: '#059669', bgColor: '#ECFDF5', origin: ICON_TYPE.MATERIAL_ICONS },
    { id: '4', name: 'AC Repair', icon: 'ac-unit', color: '#0891B2', bgColor: '#ECFEFF', origin: ICON_TYPE.MATERIAL_ICONS },
    { id: '5', name: 'Painting', icon: 'format-paint', color: '#E11D48', bgColor: '#FFF1F2', origin: ICON_TYPE.MATERIAL_ICONS },
    { id: '6', name: 'Carpentry', icon: 'handyman', color: '#EA580C', bgColor: '#FFF7ED', origin: ICON_TYPE.MATERIAL_ICONS },
    { id: '7', name: 'Appliance', icon: 'settings', color: '#4F46E5', bgColor: '#EEF2FF', origin: ICON_TYPE.MATERIAL_ICONS },
];

const CATEGORIES = SERVICE_CATEGORIES.map(name => CATEGORY_META.find(category => category.name === name)!);

type PopularService = {
    id: string;
    providerName: string;
    title: string;
    duration: string;
    rating: string;
    price: string;
    description: string;
    imageUrl: string;
};

export default function CustomerHome({ navigation }: { navigation: any }) {
    const profile = useAppSelector(state => state.user.profile);
    const displayName = profile?.fullName?.trim() || 'Customer';
    const [popularServices, setPopularServices] = useState<PopularService[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [location, setLocation] = useState('');

    useFocusEffect(useCallback(() => {
        if (!profile?.uid) {
            setLocation('');
            return;
        }

        getAddresses(profile.uid).then(addresses => {
            const savedAddress = addresses.find(address => address.isDefault) ?? addresses[0];
            if (!savedAddress) {
                setLocation('');
                return;
            }

            setLocation([savedAddress.city, savedAddress.state].filter(Boolean).join(', ') || savedAddress.street);

        }).catch(() => setLocation(''));
    }, [profile?.uid]));

    useFocusEffect(useCallback(() => {
        let active = true;
        setLoadingServices(true);
        getServices().then(services => {
            if (!active) return;
            setPopularServices(services.slice(0, 10).map(service => ({
                id: service.id,
                providerName: service.providerName,
                title: service.title,
                duration: `${service.durationMinutes ? service.durationMinutes / 60 : 0} hrs`,
                rating: service.ratingAverage ? String(service.ratingAverage) : 'New',
                price: `$${service.price}`,
                description: service.description ?? '',
                imageUrl: service.imageUrls?.[0] ?? '',
            })));
        }).catch(() => setPopularServices([])).finally(() => {
            if (active) setLoadingServices(false);
        });
        return () => { active = false; };
    }, []));

    return (
        <View style={[styles.container, {
            // paddingTop: insets.top
        }]}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent, {

                    }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Top Section */}
                <View style={styles.topSection}>
                    <View style={styles.headerRow}>
                        <View>
                            <View style={styles.greetingRow}>
                                <Text style={styles.greetingText}>Hello, {displayName}</Text>
                                <IconX
                                    name="hand-wave"
                                    origin={ICON_TYPE.MATERIAL_COMMUNITY}
                                    size={24}
                                    color={colors.yellow[400]}
                                />
                            </View>
                            {location ? <TouchableOpacity style={styles.locationBtn} activeOpacity={0.7}>
                                <IconX name="location-on" origin={ICON_TYPE.MATERIAL_ICONS} size={18} color={colors.purple[700]} />
                                <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
                            </TouchableOpacity> : null}
                        </View>
                    </View>

                    <CustomSearchBar
                        searchText=""
                        setSearchText={() => undefined}
                        placeholder="Search for a service..."
                        editable={false}
                        showFilter
                        onPress={() => navigation.navigate(navigationStrings.CUSTOMER_SEARCH_FILTER_SERVICES)}
                        onFilterPress={() => navigation.navigate(navigationStrings.CUSTOMER_SEARCH_FILTER_SERVICES)}
                    />
                </View>

                {/* Categories Grid */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <Text style={styles.sectionSubtitle}>8 Services Near You</Text>
                    </View>
                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={styles.categoryItem}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate(navigationStrings.CUSTOMER_SEARCH_FILTER_SERVICES, {
                                    category: category.name,
                                })}
                            >
                                <View style={[styles.categoryIconContainer, { backgroundColor: category.bgColor }]}>
                                    <IconX name={category.icon} origin={category.origin} size={24} color={category.color} />
                                </View>
                                <Text style={styles.categoryLabel} numberOfLines={1}>{category.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Popular Services */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionTitle}>Popular Services</Text>
                            <View style={styles.pulseDotSmall} />
                        </View>
                        <TouchableOpacity style={styles.viewAllLink} onPress={() => navigation.navigate(navigationStrings.CUSTOMER_SEARCH_FILTER_SERVICES)}>
                            <Text style={styles.viewAllText}>View All</Text>
                            <IconX name="chevron-forward" origin={ICON_TYPE.IONICONS} size={16} color={colors.purple[700]} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.servicesList}>
                        {loadingServices ?
                            <Text>{strings.services.loading}
                            </Text>
                            :
                            popularServices.length === 0 ?
                                <EmptyState
                                    title={strings.services.noServices}
                                    message={strings.services.customerEmpty}
                                    icon="briefcase-outline"
                                />
                                : <FlatList
                                    data={popularServices}
                                    keyExtractor={service => service.id}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.servicesList}
                                    renderItem={({ item: service }) => (
                                        <TouchableOpacity
                                            style={styles.serviceCard}
                                            activeOpacity={0.8}
                                            onPress={() =>
                                                navigation.navigate(navigationStrings.CUSTOMER_SERVICE_DETAILS, { service })
                                            }>
                                            <View style={styles.serviceImageContainer}>
                                                <Image
                                                    source={{ uri: service.imageUrl }}
                                                    style={styles.serviceImage} />
                                                <View style={styles.ratingBadge}>
                                                    <IconX name="star" origin={ICON_TYPE.IONICONS} size={10} color="#F59E0B" />
                                                    <Text style={styles.ratingText}>{service.rating}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.serviceContent}>
                                                <View style={styles.serviceContentTop}>
                                                    <View style={styles.providerRow}>
                                                        <Text style={styles.providerName}>
                                                            {service.providerName}
                                                        </Text>
                                                        <View style={styles.durationRow}>
                                                            <IconX name="time-outline" origin={ICON_TYPE.IONICONS} size={12} color={colors.grey[700]} />
                                                            <Text style={styles.durationText}>{service.duration}</Text>
                                                        </View>
                                                    </View>
                                                    <Text style={styles.serviceTitle} numberOfLines={1}>{service.title}</Text>
                                                    <Text style={styles.serviceDesc} numberOfLines={1}>{service.description}</Text>
                                                </View>

                                                <View style={styles.serviceContentBottom}>
                                                    <View style={styles.priceRow}>
                                                        <Text style={styles.priceLabel}>From</Text>
                                                        <Text style={styles.priceText}>{service.price}</Text>
                                                    </View>
                                                    <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8} onPress={() => navigation.navigate(navigationStrings.CUSTOMER_BOOK_SERVICE, { service })}>
                                                        <Text style={styles.bookBtnText}>Book Now</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}