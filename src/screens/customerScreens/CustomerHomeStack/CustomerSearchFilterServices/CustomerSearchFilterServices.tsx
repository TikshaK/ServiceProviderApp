import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { CustomHeader, CustomSearchBar, CustomTab, ICON_TYPE, IconX } from '../../../../components';
import { colors, navigationStrings } from '../../../../constants';
import { getBookings, getServices } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import type { Booking } from '../../../../types/booking';
import { Service } from '../../../../types/service';
import { styles } from './styles';

type Props = { navigation: any; route?: { params?: { category?: string; query?: string; fromBookings?: boolean } } };
type DisplayService = { id: string; providerName: string; title: string; duration: string; rating: string; price: string; description: string; imageUrl: string; category: string };
type DisplayBooking = { id: string; title: string; provider: string; date: string; status: string; price: string; image: string };

const CATEGORIES = ['All', 'Cleaning', 'Plumbing', 'AC Repair', 'Electrical', 'Handyman', 'Painting', 'Carpentry'];

const toDisplayService = (service: Service): DisplayService => ({
	id: service.id,
	providerName: service.providerName,
	title: service.title,
	duration: `${service.durationMinutes ? service.durationMinutes / 60 : 0} hrs`,
	rating: service.ratingAverage ? String(service.ratingAverage) : 'New',
	price: `$${service.price}`,
	description: service.description ?? '',
	imageUrl: service.imageUrls?.[0] ?? '',
	category: service.category,
});

const toDisplayBooking = (booking: Booking): DisplayBooking => ({
	id: booking.id,
	title: booking.serviceSnapshot.title,
	provider: booking.providerSnapshot.serviceName ?? booking.providerSnapshot.fullName,
	date: `${booking.scheduledDate} • ${booking.scheduledTime}`,
	status: booking.status,
	price: `$${booking.totalAmount.toFixed(2)}`,
	image: booking.serviceSnapshot.imageUrls?.[0] ?? '',
});

export default function CustomerSearchFilterServices({ navigation, route }: Props) {
	const [services, setServices] = useState<DisplayService[]>([]);
	const [query, setQuery] = useState(route?.params?.query ?? '');
	const [category, setCategory] = useState(route?.params?.category ?? 'All');
	const [bookings, setBookings] = useState<DisplayBooking[]>([]);
	const [loading, setLoading] = useState(true);
	const isBookingSearch = route?.params?.fromBookings === true;
	const profile = useAppSelector(state => state.user.profile);

	useEffect(() => {
		let active = true;
		const request = isBookingSearch
			? profile?.uid
				? getBookings('customerId', profile.uid).then(items => {
					if (active) setBookings(items.map(toDisplayBooking));
				})
				: Promise.resolve()
			: getServices().then(items => {
				if (active) setServices(items.map(toDisplayService));
			});
		/* Keep one loading lifecycle for both service and booking search modes. */
		request.then(() => {
			if (active) setLoading(false);
		}).catch(() => {
			if (active) {
				setServices([]);
				setBookings([]);
				setLoading(false);
			}
		});
		return () => { active = false; };
	}, [isBookingSearch, profile?.uid]);

	const filteredServices = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return services.filter(service => {
			const matchesCategory = category === 'All' || service.category.toLowerCase() === category.toLowerCase();
			const matchesQuery = !normalizedQuery || `${service.title} ${service.providerName} ${service.category}`.toLowerCase().includes(normalizedQuery);
			return matchesCategory && matchesQuery;
		});
	}, [category, query, services]);

	const filteredBookings = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return bookings.filter(booking => !normalizedQuery || `${booking.title} ${booking.provider} ${booking.date} ${booking.status}`.toLowerCase().includes(normalizedQuery));
	}, [bookings, query]);

	const clearFilters = () => {
		setQuery('');
		setCategory('All');
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<CustomHeader
				title={isBookingSearch ? 'My Bookings' : 'Services & Providers'}
				showBackButton
			/>
			

			{loading ? <ActivityIndicator color={colors.purple[600]} style={styles.loading} /> : isBookingSearch ? filteredBookings.length === 0 ? (
				<View style={styles.emptyState}><View style={styles.emptyIcon}><IconX name="search-outline" origin={ICON_TYPE.IONICONS} size={28} color={colors.purple[700]} /></View><Text style={styles.emptyTitle}>No bookings found</Text><Text style={styles.emptyText}>Try another search term.</Text><Pressable onPress={clearFilters} style={styles.resetButton}><Text style={styles.resetText}>Clear Search</Text></Pressable></View>
			) : (
				<ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
					{filteredBookings.map(booking => <BookingCard key={booking.id} booking={booking} navigation={navigation} />)}
				</ScrollView>
			) : filteredServices.length === 0 ? (
				<View style={styles.emptyState}><View style={styles.emptyIcon}><IconX name="search-outline" origin={ICON_TYPE.IONICONS} size={28} color={colors.purple[700]} /></View><Text style={styles.emptyTitle}>No services found</Text><Text style={styles.emptyText}>Try another search term or category.</Text><Pressable onPress={clearFilters} style={styles.resetButton}><Text style={styles.resetText}>Clear Filters</Text></Pressable></View>
			) : (
				<ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
					{filteredServices.map(service => <ServiceCard key={service.id} service={service} navigation={navigation} />)}
				</ScrollView>
			)}
		</View>
	);
}

function BookingCard({ booking, navigation }: { booking: DisplayBooking; navigation: any }) {
	return (
		<Pressable
			style={styles.card}
			onPress={() =>
				navigation.navigate(navigationStrings.CUSTOMER_BOOKING_DETAILS,
					{ booking })}
		>
			<View style={styles.cardTop}>
				{booking.image ? <Image source={{ uri: booking.image }} style={styles.image} /> : <View style={styles.image}><IconX name="calendar-outline" origin={ICON_TYPE.IONICONS} size={26} color={colors.grey[400]} /></View>}
				<View style={styles.cardCopy}>
					<Text style={styles.title} numberOfLines={1}>{booking.title}</Text>
					<Text style={styles.provider} numberOfLines={1}>{booking.provider}</Text>
					<Text style={styles.rating}>{booking.date}</Text>
				</View>
			</View>
			<View style={styles.detailBar}>
				<Text style={styles.statValue}>{booking.status}</Text>
				<Text style={styles.statValue}>{booking.price}</Text>
			</View>
		</Pressable>
	);
}

function ServiceCard({ service, navigation }: { service: DisplayService; navigation: any }) {

	return (
		<View style={styles.card}>
			<View style={styles.cardTop}>
				{service.imageUrl ? <Image source={{ uri: service.imageUrl }} style={styles.image} /> : <View style={styles.image}><IconX name="image-outline" origin={ICON_TYPE.IONICONS} size={26} color={colors.grey[400]} /></View>}
				<View style={styles.cardCopy}>
					<View
						style={styles.titleRow}
					>
						<Text
							style={styles.title}
							numberOfLines={1}
						>
							{service.title}
						</Text>
					</View>
					<Text
						style={styles.provider}
						numberOfLines={1}
					>
						{service.providerName}
					</Text>
					<View
						style={styles.ratingRow}
					>
						<IconX
							name="star"
							origin={ICON_TYPE.IONICONS}
							size={15}
							color={colors.yellow[400]}
						/>
						<Text
							style={styles.rating}
						>
							{service.rating}
						</Text>
					</View>
				</View>
			</View>
			<View style={styles.detailBar}>
				<View style={styles.detailStats}><View style={styles.stat}><Text style={styles.statLabel}>Price</Text><Text style={styles.statValue}>{service.price}</Text></View><View style={styles.divider} /><View style={styles.stat}><Text style={styles.statLabel}>Est. Time</Text><Text style={styles.statValue}>{service.duration}</Text></View></View>
				<Pressable onPress={() => navigation.navigate(navigationStrings.CUSTOMER_SERVICE_DETAILS, { service })} style={styles.detailsButton}><Text style={styles.detailsText}>View Details</Text><IconX name="chevron-forward" origin={ICON_TYPE.IONICONS} size={16} color={colors.white[100]} /></Pressable>
			</View>
		</View>
	);
}
