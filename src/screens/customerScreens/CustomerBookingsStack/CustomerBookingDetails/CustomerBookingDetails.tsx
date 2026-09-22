import React from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors } from '../../../../constants';
import { styles } from './styles';

type Booking = { id: string; date: string; status: string; title: string; provider: string; specialist: string; location: string; price: string; image: string };
type Props = { navigation: any; route?: { params?: { booking?: Booking } } };

const FALLBACK_BOOKING: Booking = { id: 'booking', date: 'Tomorrow, 25 Oct • 10:00 AM', status: 'Accepted', title: 'Deep Home Cleaning (3-Bed)', provider: 'Apex Home & Repair Services', specialist: 'John Reynolds', location: '128 Pinecrest Blvd, Apt 4B, Austin', price: '$120.00', image: '' };

export default function CustomerBookingDetails({ navigation, route }: Props) {
	const booking = route?.params?.booking ?? FALLBACK_BOOKING;
	const isAccepted = booking.status === 'Accepted';

	const cancelBooking = () => {
		Alert.alert('Cancel Booking?', 'Are you sure you want to cancel this booking? Free cancellation is available up to 2 hours before arrival.', [
			{ text: 'Keep Booking', style: 'cancel' },
			{ text: 'Cancel Booking', style: 'destructive', onPress: () => navigation.goBack() },
		]);
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<CustomHeader
				title="Booking Details"
				showBackButton
				onLeftPress={() => navigation.goBack()}
			/>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View
					style={styles.statusCard}
				>
					<View
						style={styles.statusIcon}
					>
						<IconX
							name={isAccepted ? 'verified' : 'time-outline'} origin={ICON_TYPE.IONICONS} size={23} color={colors.purple[700]} /></View><View style={styles.statusCopy}><View style={styles.statusHeading}><Text style={styles.statusTitle}>{isAccepted ? 'Accepted & Confirmed' : 'Booking Pending'}</Text><Text style={styles.scheduleBadge}>{isAccepted ? 'On Schedule' : 'Awaiting approval'}</Text></View><Text style={styles.statusDescription}>{isAccepted ? `Technician ${booking.specialist} is scheduled to arrive on ${booking.date}.` : 'Your request has been sent to the service provider.'}</Text></View></View>

				<View
					style={styles.card}
				>
					<View
						style={styles.cardHeading}
					>
						<Text
							style={styles.cardLabel}
						>
							Selected Service
						</Text>
						<Text
							style={styles.categoryBadge}>Home Cleaning</Text></View><View style={styles.serviceRow}>{booking.image ? <Image source={{ uri: booking.image }} style={styles.serviceImage} /> : <View style={styles.servicePlaceholder}><IconX name="cleaning-services" origin={ICON_TYPE.MATERIAL_ICONS} size={29} color={colors.purple[700]} /></View>}<View style={styles.serviceCopy}><Text style={styles.serviceTitle}>{booking.title}</Text><View style={styles.serviceMeta}><IconX name="time-outline" origin={ICON_TYPE.IONICONS} size={15} color={colors.grey[700]} /><Text style={styles.mutedText}>~3 hrs</Text><Text style={styles.mutedText}>•</Text><Text style={styles.servicePrice}>{booking.price}</Text></View></View></View></View>

				<View
					style={styles.card}
				>
					<Text style={styles.cardLabel}
					>
						Schedule & Location
					</Text>
					<DetailRow
						icon="calendar-outline"
						value={booking.date}
					/>
					<DetailRow
						icon="location-outline"
						value={booking.location}
						detail="Austin, TX 78701"
					/>
				</View>

				<View
					style={styles.card}
				>
					<Text
						style={styles.cardLabel}
					>
						Your Assigned Pro
					</Text>
					<View
						style={styles.providerRow}
					>
						{booking.image ?
							<Image
								source={{ uri: booking.image }}
								style={styles.providerImage}
							/> :
							<View
								style={styles.providerPlaceholder}
							>
								<IconX
									name="person"
									origin={ICON_TYPE.IONICONS}
									size={24}
									color={colors.purple[700]}
								/>
							</View>
						}
						<View
							style={styles.providerCopy}
						>
							<Text
								style={styles.providerName}
							>
								{booking.specialist}
							</Text>
							<Text
								style={styles.mutedText}
							>
								{booking.provider}

							</Text>
							<View
								style={styles.ratingRow}
							>
								<IconX
									name="star"
									origin={ICON_TYPE.IONICONS}
									size={15}
									color={colors.purple[700]}
								/>
								<Text
									style={styles.rating}
								>
									4.9
								</Text>
								<Text
									style={styles.mutedText}
								>
									(128 reviews)
								</Text>
							</View>
						</View>
					</View>
					<Pressable
						style={styles.callButton}
						onPress={
							() => Linking.openURL('tel:5550192834')}
					>
						<IconX
							name="call"
							origin={ICON_TYPE.IONICONS}
							size={18}
							color={colors.purple[700]}
						/>
						<Text
							style={styles.callText}
						>
							Call Provider
						</Text>
					</Pressable>
				</View>

				<View
					style={styles.card}
				>
					<Text
						style={styles.cardLabel}
					>
						Payment Summary
					</Text>
					<View
						style={styles.paymentRow}
					>
						<Text
							style={styles.mutedText}
						>
							Base Service
						</Text>
						<Text
							style={styles.paymentValue}
						>
							{booking.price}
						</Text>
					</View>
					<View
						style={styles.paymentRow}
					>
						<Text
							style={styles.mutedText}
						>
							Taxes & Platform Fee
						</Text>
						<Text
							style={styles.paymentValue}
						>
							$8.50
						</Text>
					</View>
					<View
						style={styles.divider}
					/>
					<View
						style={styles.totalRow}
					>
						<View>
							<Text
								style={styles.totalTitle}
							>
								Total Amount
							</Text>
							<Text
								style={styles.mutedText}
							>
								Due upon completion
							</Text>
						</View>
						<Text
							style={styles.totalAmount}
						>
							{isAccepted ? '$128.50' : booking.price}</Text>
					</View>
				</View>

				<View
					style={styles.cancelArea}
				>
					<Pressable
						style={styles.cancelButton}
						onPress={cancelBooking}
					>
						<IconX
							name="close-circle-outline"
							origin={ICON_TYPE.IONICONS}
							size={20}
							color={colors.red[200]}
						/>
						<Text
							style={styles.cancelText}
						>
							Cancel Booking
						</Text>
					</Pressable>

				</View>
			</ScrollView>
		</View>
	);
}

function DetailRow({ icon, value, detail }: { icon: string; value: string; detail?: string }) {
	return (
		<View
			style={styles.detailRow}
		>
			<View
				style={styles.detailIcon}
			>
				<IconX
					name={icon}
					origin={ICON_TYPE.IONICONS}
					size={18}
					color={colors.purple[700]}
				/>
			</View>
			<View
				style={styles.detailCopy}
			>
				<Text
					style={styles.detailValue}
				>
					{value}
				</Text>
				{detail ?
					<Text
						style={styles.mutedText}
					>
						{detail}
					</Text>
					:
					null
				}
			</View>
		</View>
	)
}
