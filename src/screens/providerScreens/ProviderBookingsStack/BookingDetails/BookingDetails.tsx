import React, { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { ICON_TYPE, IconX } from '../../../../components';
import { colors } from '../../../../constants';
import { updateBookingStatus } from '../../../../services/firebase';
import type { BookingItem } from '../ProviderBookings/ProviderBookings';
import { styles } from './styles';

type BookingDetailsProps = {
	navigation: any;
	route?: { params?: { booking?: BookingItem } };
};

const FALLBACK_BOOKING: BookingItem = {
	id: 'booking',
	clientName: 'David Miller',
	serviceTitle: 'AC Repair & Tune-up',
	status: 'Pending',
	dateText: 'Today, 4:30 PM',
	address: '10880 Wilshire Blvd, Apt 12',
	amount: '$85.00',
	avatarUrl: '',
	statusBgColor: '#FFFBEB',
	statusTextColor: '#B45309',
	dotColor: '#D97706',
	notes: 'AC unit making humming sound on top level.',
};

export default function BookingDetails({ navigation, route }: BookingDetailsProps) {
	const booking = route?.params?.booking ?? FALLBACK_BOOKING;
	const [decision, setDecision] = useState<'accepted' | 'rejected' | null>(null);
	const [completed, setCompleted] = useState(booking.status === 'Completed');
	const isAccepted = booking.status === 'Upcoming' || decision === 'accepted';

	const handleDecision = (nextDecision: 'accepted' | 'rejected') => {
		setDecision(nextDecision);
		updateBookingStatus(booking.id, nextDecision === 'accepted' ? 'accepted' : 'declined').catch(() => undefined);
		Alert.alert(
			nextDecision === 'accepted' ? 'Booking accepted' : 'Booking declined',
			nextDecision === 'accepted' ? 'This booking has been added to your schedule.' : 'This request has been declined.',
		);
	};

	const openMaps = () => {
		Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(booking.address)}`).catch(() => {
			Alert.alert('Unable to open maps', 'No maps application is available on this device.');
		});
	};

	const cancelBooking = () => {
		Alert.alert('Cancel this booking?', 'Cancelling close to the arrival time may affect your acceptance score.', [
			{ text: 'Keep Booking', style: 'cancel' },
			{ text: 'Confirm Cancellation', style: 'destructive', onPress: () => navigation.goBack() },
		]);
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<View style={styles.header}>
				<Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backButton}>
					<IconX name="arrow-back-outline" origin={ICON_TYPE.IONICONS} size={24} color={colors.black[250]} />
				</Pressable>
				<Text numberOfLines={1} style={styles.headerTitle}>Booking #{booking.id.replace('booking_', 'BK-')}</Text>
				<View style={[styles.headerStatus, { backgroundColor: decision === 'accepted' ? colors.green[100] : booking.statusBgColor }]}>
					<View style={[styles.headerStatusDot, { backgroundColor: decision === 'accepted' ? colors.green[500] : booking.dotColor ?? colors.grey[700] }]} />
				</View>
			</View>

			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				{isAccepted ? (
					<View style={styles.confirmationCard}>
						<View style={styles.confirmationIcon}><IconX name="checkmark-circle" origin={ICON_TYPE.IONICONS} size={28} color={colors.purple[700]} /></View>
						<Text style={styles.confirmationTitle}>{completed ? 'Booking Completed' : 'Booking Accepted!'}</Text>
						<Text style={styles.confirmationText}>{completed ? 'This job has been marked as completed.' : 'This job has been added to your active schedule.'}</Text>
						<View style={styles.scheduleBox}><IconX name="time-outline" origin={ICON_TYPE.IONICONS} size={18} color={colors.purple[700]} /><Text style={styles.scheduleText}>{booking.dateText}</Text></View>
					</View>
				) : null}
				<View style={styles.card}>
					<View style={styles.clientHeader}>
						<View style={styles.avatar}>
							  {booking.avatarUrl ? <Image source={{ uri: booking.avatarUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarInitial}>{booking.clientName.charAt(0)}</Text>}
						</View>
						<View style={styles.clientCopy}>
							<Text style={styles.clientName}>{booking.clientName}</Text>
							<Text style={styles.clientLabel}>{isAccepted ? 'Active booking client' : 'Verified customer'}</Text>
						</View>
					</View>
					<Pressable style={styles.callButton} onPress={() => Linking.openURL('tel:+15550192')}>
						<IconX name="call" origin={ICON_TYPE.IONICONS} size={18} color={colors.purple[700]} />
						<Text style={styles.callButtonText}>Call Client</Text>
					</Pressable>
				</View>

				<View style={styles.card}>
					<View style={styles.cardLabelRow}>
						<Text style={styles.cardLabel}>Service Breakdown</Text>
						<Text style={styles.rateBadge}>Standard Rate</Text>
					</View>
					<View style={styles.serviceRow}>
						<View style={styles.serviceIcon}><IconX name="build" origin={ICON_TYPE.IONICONS} size={22} color={colors.purple[700]} /></View>
						<View style={styles.serviceCopy}><Text style={styles.serviceTitle}>{booking.serviceTitle}</Text><View style={styles.serviceMeta}><IconX name="time-outline" origin={ICON_TYPE.IONICONS} size={14} color={colors.grey[700]} /><Text style={styles.mutedText}>1 hr 30 mins</Text><View style={styles.dot} /><Text style={styles.mutedText}>Diagnostics incl.</Text></View></View>
						<View style={styles.payout}><Text style={styles.payoutAmount}>{booking.amount}</Text><Text style={styles.payoutLabel}>Est. Payout</Text></View>
					</View>
				</View>

				<View style={styles.card}>
					<InfoRow icon="calendar-outline" label="Scheduled Window" value={booking.dateText} detail="Arrival window: 15 minutes before scheduled time" />
					{booking.address ? <><View style={styles.cardDivider} />
					<View style={styles.locationRow}>
						<InfoRow icon="location-outline" label="Service Location" value={booking.address} detail="Springfield, OR 97477" />
						<Pressable onPress={openMaps} style={styles.mapsButton}><Text style={styles.mapsButtonText}>Open in Maps</Text><IconX name="open-outline" origin={ICON_TYPE.IONICONS} size={15} color={colors.purple[700]} /></Pressable>
					</View></> : null}
					{booking.notes ? <><View style={styles.cardDivider} /><View style={styles.notesBox}><View style={styles.notesHeading}><IconX name="chatbox-ellipses-outline" origin={ICON_TYPE.IONICONS} size={16} color={colors.grey[700]} /><Text style={styles.cardLabel}>Customer Special Instructions</Text></View><Text style={styles.notesText}>“{booking.notes}”</Text></View></> : null}
				</View>

				{isAccepted ? (
					<View style={styles.card}>
						<Text style={styles.cardLabel}>Current Phase</Text>
						<View style={styles.phaseBar}>
							<View style={[styles.phaseSegment, styles.phaseActive]} /><View style={[styles.phaseSegment, completed && styles.phaseActive]} /><View style={[styles.phaseSegment, completed && styles.phaseActive]} />
						</View>
						<View style={styles.phaseLabels}><Text style={styles.phaseActiveText}>Accepted</Text><Text style={completed ? styles.phaseActiveText : styles.mutedText}>In Progress</Text><Text style={completed ? styles.phaseActiveText : styles.mutedText}>Completed</Text></View>
						{!completed ? <Pressable style={styles.acceptButton} onPress={() => { setCompleted(true); updateBookingStatus(booking.id, 'completed').catch(() => undefined); }}><IconX name="checkmark-circle" origin={ICON_TYPE.IONICONS} size={20} color={colors.white[100]} /><Text style={styles.acceptText}>Mark as Completed</Text></Pressable> : null}
						{!completed ? <Pressable style={styles.cancelBookingButton} onPress={cancelBooking}><IconX name="close-circle-outline" origin={ICON_TYPE.IONICONS} size={16} color={colors.red[200]} /><Text style={styles.declineText}>Cancel Booking</Text></Pressable> : null}
					</View>
				) : null}
			</ScrollView>

			{!isAccepted && !decision ? (
				<View style={styles.bottomBar}>
					<Pressable style={styles.acceptButton} onPress={() => handleDecision('accepted')}><IconX name="checkmark-circle" origin={ICON_TYPE.IONICONS} size={20} color={colors.white[100]} /><Text style={styles.acceptText}>Accept Booking</Text></Pressable>
					<Pressable style={styles.declineButton} onPress={() => handleDecision('rejected')}><IconX name="close" origin={ICON_TYPE.IONICONS} size={18} color={colors.red[200]} /><Text style={styles.declineText}>Decline Request</Text></Pressable>
				</View>
			) : null}
		</View>
	);
}

function InfoRow({ icon, label, value, detail }: { icon: string; label: string; value: string; detail: string }) {
	return <View style={styles.infoRow}><View style={styles.infoIcon}><IconX name={icon} origin={ICON_TYPE.IONICONS} size={20} color={colors.purple[700]} /></View><View style={styles.infoCopy}><Text style={styles.cardLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text><Text style={styles.mutedText}>{detail}</Text></View></View>;
}
