import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { CalendarInput, CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors, navigationStrings, strings } from '../../../../constants';
import { createBooking, getAddresses, getService, getUserProfile } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';
import { showToast } from '../../../../utils';

type Service = { id: string; providerName: string; title: string; duration: string; rating: string; price: string; description: string; imageUrl: string };
type Props = { navigation: any; route?: { params?: { service?: Service } } };
type SelectedAddress = { street: string; city: string; state?: string; postalCode: string };

const FALLBACK_SERVICE: Service = { id: 'service', providerName: 'Apex Cleaners', title: 'Deep Home Cleaning', duration: '3 hrs', rating: '4.9', price: '$120', description: '', imageUrl: '' };

const startOfDay = (value: Date) => {
	const result = new Date(value);
	result.setHours(0, 0, 0, 0);
	return result;
};

const isSameDay = (left: Date, right: Date) => startOfDay(left).getTime() === startOfDay(right).getTime();

const formatDate = (value: Date) => value.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const formatTime = (value: Date) => value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const getMinimumTime = (date: Date | null) => {
	const minimum = date ? startOfDay(date) : new Date();
	if (!date || isSameDay(date, new Date())) {
		const now = new Date();
		minimum.setHours(now.getHours(), now.getMinutes() + 10, 0, 0);
	}
	return minimum;
};

export default function CustomerBookService({ navigation, route }: Props) {
	const service = route?.params?.service ?? FALLBACK_SERVICE;
	const customer = useAppSelector(state => state.user.profile);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedTime, setSelectedTime] = useState<Date | null>(null);
	const [instructions, setInstructions] = useState('');
	const [address, setAddress] = useState<SelectedAddress | null>(null);
	const [isBooking, setIsBooking] = useState(false);
	const price = useMemo(() => `${service.price}.00`, [service.price]);
	const minimumDate = useMemo(() => startOfDay(new Date()), []);
	const minimumTime = useMemo(() => getMinimumTime(selectedDate), [selectedDate]);

	useEffect(() => {
		if (!customer?.uid) {
			setAddress(null);
			return;
		}

		getAddresses(customer.uid)
			.then(addresses => {
				const savedAddress = addresses.find(item => item.isDefault) ?? addresses[0];
				setAddress(savedAddress ?? null);
			})
			.catch(() => setAddress(null));
	}, [customer?.uid]);

	const handleDateChange = (date: Date) => {
		const normalizedDate = startOfDay(date);
		setSelectedDate(normalizedDate);
		if (selectedTime && isSameDay(normalizedDate, new Date()) && selectedTime < getMinimumTime(normalizedDate)) {
			setSelectedTime(null);
		}
	};

	const handleTimeChange = (time: Date) => {
		if (!selectedDate) return;
		const combined = new Date(selectedDate);
		combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
		setSelectedTime(combined);
	};

	const submitBooking = async () => {
		if (isBooking) {
			return;
		}
		if (!selectedDate || !selectedTime) {
			showToast({ type: 'error', title: 'Select a schedule', message: 'Choose a service date and arrival time before continuing.' });
			return;
		}
		if (selectedTime < getMinimumTime(selectedDate)) {
			showToast({ type: 'error', title: 'Choose a later time', message: 'For today, arrival must be at least 10 minutes from now.' });
			return;
		}
		if (!customer) {
			showToast({ type: 'error', title: strings.alerts.sessionExpired, message: strings.alerts.pleaseSignInAgain });
			return;
		}
		if (!address) {
			showToast({ type: 'error', title: 'Add a service address', message: 'Save an address before booking this service.' });
			return;
		}
		setIsBooking(true);
		try {
			const storedService = await getService(service.id);
			const providerId = storedService?.providerId ?? service.providerName;
			const provider = await getUserProfile(providerId);
			if (!storedService || !provider) {
				showToast({ type: 'error', title: 'Service unavailable', message: 'This service is no longer available.' });
				return;
			}
			await createBooking({
				customerId: customer.uid,
				providerId,
				service: storedService,
				customer,
				provider,
				scheduledDate: formatDate(selectedDate),
				scheduledTime: formatTime(selectedTime),
				address,
				specialInstructions: instructions.trim() || undefined,
			});
			navigation.replace(navigationStrings.CUSTOMER_BOOKING_SUCCESS, {
				service,
				date: formatDate(selectedDate),
				time: formatTime(selectedTime),
				address: address.street,
				price,
			});
		} catch(error:any) {
			console.error('Booking Error:', error);

			// Extract custom error message from backend response if available, or fall back to default
			const errorMessage = error?.response?.data?.message || error?.message || strings.alerts.tryAgain;

			showToast({ type: 'error', title: 'Unable to book service', message: errorMessage });
		} finally {
			setIsBooking(false);
		}
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<CustomHeader title={strings.booking.bookService} showBackButton onLeftPress={() => navigation.goBack()} />


			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
				<View style={styles.stepRow}><View><Text style={styles.step}>Step 1 of 3</Text><Text style={styles.heading}>{strings.booking.pickDateTime}</Text></View></View>

				<View style={styles.serviceSummary}>
					{service.imageUrl ? <Image source={{ uri: service.imageUrl }} style={styles.serviceImage} /> : <View style={styles.serviceImagePlaceholder}><IconX name="image-outline" origin={ICON_TYPE.IONICONS} size={26} color={colors.grey[400]} /></View>}
					<View style={styles.serviceCopy}><Text style={styles.serviceTitle} numberOfLines={1}>{service.title}</Text><Text style={styles.serviceProvider}>{service.providerName}</Text><Text style={styles.servicePrice}>{price}</Text></View>
				</View>

				<View style={styles.section}>
					<Text style={styles.label}>{strings.booking.serviceDate}</Text>
					<CalendarInput value={selectedDate} onChangeText={handleDateChange} placeholder="Choose a date" minimumDate={minimumDate} />
					<Text style={styles.hint}>Today and future dates are available.</Text>
				</View>

				<View style={styles.section}><Text style={styles.label}>Arrival Window / Time</Text><CalendarInput value={selectedTime} onChangeText={handleTimeChange} placeholder={selectedDate ? 'Choose an arrival time' : 'Choose a date first'} mode="time" minimumDate={minimumTime} disabled={!selectedDate} /><Text style={styles.hint}>For today, choose a time at least 10 minutes from now.</Text></View>

				<View style={styles.section}><View style={styles.sectionTitleRow}><IconX name="chatbubble-ellipses-outline" origin={ICON_TYPE.IONICONS} size={20} color={colors.purple[700]} /><Text style={styles.sectionTitle}>Special Instructions</Text></View><Text style={styles.helper}>Any delicate surfaces, focus areas, or pet instructions?</Text><TextInput value={instructions} onChangeText={setInstructions} multiline numberOfLines={3} placeholder="Add notes for your service provider..." placeholderTextColor={colors.grey[700]} style={styles.instructionsInput} textAlignVertical="top" /></View>

				<View style={styles.section}><View style={styles.sectionTitleRow}><IconX name="location-outline" origin={ICON_TYPE.IONICONS} size={20} color={colors.purple[700]} /><Text style={styles.sectionTitle}>Service Address</Text><Pressable style={styles.changeButton} onPress={() => showToast({ type: 'info', title: 'Address', message: 'Address management will be available soon.' })}><Text style={styles.changeText}>Change</Text></Pressable></View><View style={styles.addressCard}><View style={styles.addressTop}><Text style={styles.homeBadge}>{address ? 'Saved address' : 'Address required'}</Text>{address ? <IconX name="checkmark-circle" origin={ICON_TYPE.IONICONS} size={18} color={colors.purple[700]} /> : null}</View><Text style={styles.addressValue}>{address?.street ?? 'No saved address found'}</Text><Text style={styles.helper}>{address ? `${address.city}${address.state ? `, ${address.state}` : ''} ${address.postalCode}` : 'Add an address before booking.'}</Text></View></View>
			</ScrollView>

			<View style={styles.bottomBar}><View style={styles.totalCopy}><View style={styles.slotSummary}><IconX name="event-available" origin={ICON_TYPE.MATERIAL_ICONS} size={16} color={colors.purple[700]} /><Text style={styles.slotText}>{selectedDate && selectedTime ? `${formatDate(selectedDate)} • ${formatTime(selectedTime)}` : 'Select a date and time'}</Text></View><Text style={styles.total}>{price}<Text style={styles.totalLabel}> total</Text></Text></View><Pressable style={styles.continueButton} onPress={submitBooking} disabled={isBooking}><Text style={styles.continueText}>Book the service</Text><IconX name="arrow-forward" origin={ICON_TYPE.IONICONS} size={18} color={colors.white[100]} /></Pressable></View>
			{isBooking ? <View style={styles.bookingOverlay} accessibilityRole="progressbar" accessibilityLabel="Booking service"><ActivityIndicator size="large" color={colors.white[100]} /><Text style={styles.bookingOverlayText}>Booking your service...</Text></View> : null}
		</View>
	);
}
