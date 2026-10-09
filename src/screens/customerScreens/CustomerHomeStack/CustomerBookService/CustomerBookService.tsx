import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, StatusBar, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CalendarInput, CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors, navigationStrings, SERVICE_CATEGORIES, strings } from '../../../../constants';
import { createBooking, createOpenBooking, getAddresses, getProviderPublicProfile, getService } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';
import { showToast } from '../../../../utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Service = { id: string; providerId?: string; providerName: string; title: string; duration: string; rating: string; price: string; description: string; imageUrl: string };
type Props = { navigation: any; route?: { params?: { service?: Service } } };
type SelectedAddress = { street: string; city: string; state?: string; postalCode: string };

const startOfDay = (value: Date) => {
	const result = new Date(value);
	result.setHours(0, 0, 0, 0);
	return result;
};

const isSameDay = (left: Date, right: Date) => startOfDay(left).getTime() === startOfDay(right).getTime();

const formatDate = (value: Date) => value.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
// Force 12-hour format with AM/PM regardless of device settings — this value is
// stored as `scheduledTime` (e.g. "3:45 PM") and shown in every bookings list.
const formatTime = (value: Date) => value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const getMinimumTime = (date: Date | null) => {
	const minimum = date ? startOfDay(date) : new Date();
	if (!date || isSameDay(date, new Date())) {
		const now = new Date();
		minimum.setHours(now.getHours(), now.getMinutes() + 10, 0, 0);
	}
	return minimum;
};

export default function CustomerBookService({ navigation, route }: Props) {
	const insets = useSafeAreaInsets()
	const service = route?.params?.service;
	const isOpenBooking = !service;
	const customer = useAppSelector(state => state.user.profile);
	const [selectedCategory, setSelectedCategory] = useState('');
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedTime, setSelectedTime] = useState<Date | null>(null);
	const [instructions, setInstructions] = useState('');
	const [address, setAddress] = useState<SelectedAddress | null>(null);
	const [isBooking, setIsBooking] = useState(false);
	const price = useMemo(() => service ? `${service.price}.00` : 'Quote pending', [service]);
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
			if (isOpenBooking) {
				if (!selectedCategory) {
					showToast({ type: 'error', title: 'Choose a category', message: 'Select the type of service you need.' });
					return;
				}
			await createOpenBooking({
					customerId: customer.uid,
					customer,
					category: selectedCategory,
					scheduledDate: formatDate(selectedDate),
					scheduledTime: formatTime(selectedTime),
					scheduledDateTime: selectedTime.toISOString(),
					scheduledAt: selectedTime.getTime(),
					address,
					specialInstructions: instructions.trim() || undefined,
				});
				navigation.replace(navigationStrings.CUSTOMER_BOOKING_SUCCESS, {
					bookingType: 'open',
					service: { title: `${selectedCategory} service`, providerName: 'Waiting for provider quotes', rating: '', imageUrl: '', price: 'Quote pending' },
					date: formatDate(selectedDate),
					time: formatTime(selectedTime),
					address: address.street,
					price: 'Awaiting quote',
				});
				return;
			}

			console.log('[DIRECT_BOOKING] loading selected service', {
				serviceId: service.id,
				providerIdFromRoute: service.providerId,
			});
			const storedService = await getService(service.id);
			console.log('[DIRECT_BOOKING] selected service lookup result', {
				serviceId: service.id,
				found: Boolean(storedService),
				storedServiceId: storedService?.id,
				storedProviderId: storedService?.providerId,
			});
			if (!storedService) {
				showToast({ type: 'error', title: 'Service unavailable', message: 'This service is no longer available.' });
				return;
			}
			const providerId = storedService.providerId || service.providerId;
			if (!providerId) {
				console.error('[DIRECT_BOOKING] service has no provider ID', { serviceId: service.id });
				showToast({ type: 'error', title: 'Service unavailable', message: 'This service is missing its provider information.' });
				return;
			}
			const providerProfile = await getProviderPublicProfile(providerId);
			const provider = providerProfile ?? {
				uid: providerId,
				fullName: storedService.providerName || service.providerName,
			};
			if (!providerProfile) {
				console.warn('[DIRECT_BOOKING] public provider profile missing; using service snapshot', {
					serviceId: service.id,
					providerId,
				});
			}
			await createBooking({
				customerId: customer.uid,
				providerId,
				service: storedService,
				customer,
				provider,
				scheduledDate: formatDate(selectedDate),
				scheduledTime: formatTime(selectedTime),
				scheduledDateTime: selectedTime.toISOString(),
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
		} catch (error: any) {
			console.error('Booking Error:', error);

			// Extract custom error message from backend response if available, or fall back to default
			const errorMessage = error?.response?.data?.message || error?.message || strings.alerts.tryAgain;

			showToast({ type: 'error', title: 'Unable to book service', message: errorMessage });
		} finally {
			setIsBooking(false);
		}
	};

	return (
		<View style={[styles.container, {
		}]}>
			<StatusBar
				barStyle="dark-content"
			/>
			<CustomHeader
				title={strings.booking.bookService}
				showBackButton
				onLeftPress={() => navigation.goBack()}
			/>


			<KeyboardAwareScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.content}
				enableOnAndroid
				bounces={false}
				enableAutomaticScroll
				extraScrollHeight={Platform.OS === 'android' ? 180 : 120}
				keyboardOpeningTime={0}
				keyboardShouldPersistTaps="handled"
				enableResetScrollToCoords={false}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.stepRow}><View><Text style={styles.step}>{isOpenBooking ? 'Open booking' : 'Step 1 of 3'}</Text><Text style={styles.heading}>{isOpenBooking ? 'Tell us what you need' : strings.booking.pickDateTime}</Text></View></View>

				{service ? <View style={styles.serviceSummary}>
					{service.imageUrl ? <Image source={{ uri: service.imageUrl }} style={styles.serviceImage} /> : <View style={styles.serviceImagePlaceholder}><IconX name="image-outline" origin={ICON_TYPE.IONICONS} size={26} color={colors.grey[400]} /></View>}
					<View style={styles.serviceCopy}><Text style={styles.serviceTitle} numberOfLines={1}>{service.title}</Text><Text style={styles.serviceProvider}>{service.providerName}</Text><Text style={styles.servicePrice}>{price}</Text></View>
				</View> : null}

				{isOpenBooking ? <View style={styles.section}>
					<Text style={styles.label}>Service category</Text>
					<View style={styles.categoryGrid}>
						{SERVICE_CATEGORIES.map(category => <Pressable key={category} accessibilityRole="radio" accessibilityState={{ selected: selectedCategory === category }} style={[styles.categoryOption, selectedCategory === category && styles.categoryOptionSelected]} onPress={() => setSelectedCategory(category)}>
							<Text style={[styles.categoryOptionText, selectedCategory === category && styles.categoryOptionTextSelected]}>{category}</Text>
						</Pressable>)}
					</View>
					<Text style={styles.hint}>A matching provider will send you a price to review.</Text>
				</View> : null}

				<View style={styles.section}>
					<Text style={styles.label}>{strings.booking.serviceDate}</Text>
					<CalendarInput value={selectedDate} onChangeText={handleDateChange} placeholder="Choose a date" minimumDate={minimumDate} />
					<Text style={styles.hint}>Today and future dates are available.</Text>
				</View>

				<View style={styles.section}><Text style={styles.label}>Arrival Window / Time</Text><CalendarInput value={selectedTime} onChangeText={handleTimeChange} placeholder={selectedDate ? 'Choose an arrival time' : 'Choose a date first'} mode="time" minimumDate={minimumTime} disabled={!selectedDate} /><Text style={styles.hint}>For today, choose a time at least 10 minutes from now.</Text></View>

				<View style={styles.section}><View style={styles.sectionTitleRow}><IconX name="chatbubble-ellipses-outline" origin={ICON_TYPE.IONICONS} size={20} color={colors.purple[700]} /><Text style={styles.sectionTitle}>Special Instructions</Text></View><Text style={styles.helper}>Any delicate surfaces, focus areas, or pet instructions?</Text><TextInput value={instructions} onChangeText={setInstructions} multiline numberOfLines={3} placeholder="Add notes for your service provider..." placeholderTextColor={colors.grey[700]} style={styles.instructionsInput} textAlignVertical="top" /></View>

				<View style={styles.section}><View style={styles.sectionTitleRow}><IconX name="location-outline" origin={ICON_TYPE.IONICONS} size={20} color={colors.purple[700]} /><Text style={styles.sectionTitle}>Service Address</Text><Pressable style={styles.changeButton} onPress={() => showToast({ type: 'info', title: 'Address', message: 'Address management will be available soon.' })}><Text style={styles.changeText}>Change</Text></Pressable></View><View style={styles.addressCard}><View style={styles.addressTop}><Text style={styles.homeBadge}>{address ? 'Saved address' : 'Address required'}</Text>{address ? <IconX name="checkmark-circle" origin={ICON_TYPE.IONICONS} size={18} color={colors.purple[700]} /> : null}</View><Text style={styles.addressValue}>{address?.street ?? 'No saved address found'}</Text><Text style={styles.helper}>{address ? `${address.city}${address.state ? `, ${address.state}` : ''} ${address.postalCode}` : 'Add an address before booking.'}</Text></View></View>
			</KeyboardAwareScrollView>

			<View
				style={[styles.bottomBar, {
					paddingBottom: insets.bottom
				}]}
			>
				<View
					style={styles.totalCopy}
				>
					<View
						style={styles.slotSummary}
					>
						<IconX
							name="event-available"
							origin={ICON_TYPE.MATERIAL_ICONS}
							size={16}
							color={colors.purple[700]}
						/>
						<Text
							style={styles.slotText}>
							{selectedDate && selectedTime
								?
								`${formatDate(selectedDate)} • ${formatTime(selectedTime)}`
								:
								'Select a date and time'}
						</Text>
					</View>
					<Text
						style={styles.total}
					>
						{isOpenBooking ? 'Price after quote' : price}
						<Text
							style={styles.totalLabel}
						>
							total
						</Text>
					</Text>
				</View>
				<Pressable
					style={styles.continueButton}
					onPress={submitBooking}
					disabled={isBooking}
				>
					<Text
						style={styles.continueText}>
										{isOpenBooking ? 'Post request' : 'Book the service'}
					</Text>
					<IconX
						name="arrow-forward"
						origin={ICON_TYPE.IONICONS}
						size={18}
						color={colors.white[100]}
					/>
				</Pressable>
			</View>
			{isBooking
				?
				<View
					style={styles.bookingOverlay}
					accessibilityRole="progressbar"
					accessibilityLabel="Booking service"
				>
					<ActivityIndicator
						size="large"
						color={colors.white[100]}
					/>
					<Text
						style={styles.bookingOverlayText}
					>
						Booking your service...
					</Text>
				</View>
				:
				null
			}
		</View>
	);
}
