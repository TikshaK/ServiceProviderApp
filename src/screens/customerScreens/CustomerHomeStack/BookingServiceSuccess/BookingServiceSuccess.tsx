import React, { useEffect } from 'react';
import { BackHandler, Image, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors, navigationStrings } from '../../../../constants';
import { styles } from './styles';

type Service = { title: string; providerName: string; rating: string; imageUrl: string; price: string };
type Props = { navigation: any; route?: { params?: { service?: Service; date?: string; time?: string; address?: string; price?: string } } };

const FALLBACK_SERVICE: Service = { title: 'Deep Home Cleaning', providerName: 'John Reynolds', rating: '4.9', imageUrl: '', price: '$120' };

export default function BookingServiceSuccess({ navigation, route }: Props) {
	const service = route?.params?.service ?? FALLBACK_SERVICE;
	const date = route?.params?.date ?? 'Friday, October 25, 2026';
	const time = route?.params?.time ?? '11:30 AM';
	const address = route?.params?.address ?? '128 Pinecrest Blvd, Apt 4B';
	const price = route?.params?.price ?? `${service.price}.00`;


	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

		return () => backHandler.remove();
	}, []);

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />

			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.celebration}><View style={styles.halo}><View style={styles.checkCircle}><IconX name="checkmark" origin={ICON_TYPE.IONICONS} size={42} color={colors.white[100]} /></View></View><Text style={styles.heading}>You're All Set!</Text><Text style={styles.subtitle}>Your request has been dispatched to your specialist.</Text></View>

				<View style={styles.summaryCard}>
					<View style={styles.summaryHeader}>{service.imageUrl ? <Image source={{ uri: service.imageUrl }} style={styles.providerImage} /> : <View style={styles.providerImagePlaceholder}><IconX name="person" origin={ICON_TYPE.IONICONS} size={23} color={colors.purple[700]} /></View>}<View style={styles.summaryCopy}><Text style={styles.serviceTitle} numberOfLines={1}>{service.title}</Text><View style={styles.providerLine}><Text style={styles.providerName}>{service.providerName}</Text><IconX name="star" origin={ICON_TYPE.IONICONS} size={13} color={colors.yellow[400]} /><Text style={styles.rating}>{service.rating}</Text></View></View><Text style={styles.confirmed}>Confirmed</Text></View>
					<View style={styles.divider} />
					<DetailRow icon="calendar-outline" label="Appointment Time" value={`${date} • ${time}`} />
					<DetailRow icon="home-outline" label="Service Address" value={address} detail="Austin, TX 78704" />
					<View style={styles.paymentRow}><Text style={styles.paymentLabel}>Total payment</Text><Text style={styles.payment}>{price}</Text></View>
				</View>

				<View
					style={styles.actions}>
					<Pressable
						style={styles.primaryButton}
						onPress={() => navigation.navigate(navigationStrings.CUSTOMER_BOOKINGS_STACK)}
					>
						<Text
							style={styles.primaryText}
						>
							View Booking Details
						</Text>
						<IconX name="arrow-forward"
							origin={ICON_TYPE.IONICONS}
							size={18}
							color={colors.white[100]}
						/>
					</Pressable>
					<Pressable
						style={styles.secondaryButton}
						onPress={() => navigation.navigate(navigationStrings.CUSTOMER_HOME)}
					>
						<Text
							style={styles.secondaryText}
						>
							Return to Home
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}

function DetailRow({ icon, label, value, detail }: { icon: string; label: string; value: string; detail?: string }) {
	return <View style={styles.detailRow}><View style={styles.detailIcon}><IconX name={icon} origin={ICON_TYPE.IONICONS} size={18} color={colors.purple[700]} /></View><View style={styles.detailCopy}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text>{detail ? <Text style={styles.detailMuted}>{detail}</Text> : null}</View></View>;
}
