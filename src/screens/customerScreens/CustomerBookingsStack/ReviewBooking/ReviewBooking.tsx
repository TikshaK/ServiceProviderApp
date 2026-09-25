import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, Pressable, StatusBar, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors } from '../../../../constants';
import { createReview } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';

type Booking = { id?: string; providerId?: string; title: string; provider: string; specialist: string; price: string; image: string; date: string };
type Props = { navigation: any; route?: { params?: { booking?: Booking } } };

const FALLBACK_BOOKING: Booking = { title: 'Deep Home Cleaning', provider: 'Apex Home & Repair Services', specialist: 'John Reynolds', price: '$120.00', image: '', date: 'Yesterday, Oct 23, 2024' };
const COMPLIMENTS = ['On-time', 'Professional', 'Clean Work', 'Fair Pricing', 'Great Communication'];
const RATING_LABELS = ['Needs Improvement', 'Fair', 'Good', 'Very Good', 'Excellent!'];

export default function ReviewBooking({ navigation, route }: Props) {
	const booking = route?.params?.booking ?? FALLBACK_BOOKING;
	const profile = useAppSelector(state => state.user.profile);
	const [rating, setRating] = useState(5);
	const [selectedCompliments, setSelectedCompliments] = useState(['On-time', 'Professional', 'Clean Work', 'Great Communication']);
	const [review, setReview] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const toggleCompliment = (compliment: string) => setSelectedCompliments(current => current.includes(compliment) ? current.filter(item => item !== compliment) : [...current, compliment]);

	const submitReview = async () => {
		if (submitting || !profile || !booking.id || !booking.providerId) return;
		setSubmitting(true);
		try {
			await createReview({ bookingId: booking.id, reviewerId: profile.uid, revieweeId: booking.providerId, reviewerRole: 'customer', rating, compliments: selectedCompliments, comment: review.trim() });
			navigation.goBack();
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<Modal visible={submitting} transparent statusBarTranslucent>
				<View style={styles.submittingOverlay}>
					<ActivityIndicator size="large" color={colors.white[100]} />
					<Text style={styles.submittingText}>Publishing review...</Text>
				</View>
			</Modal>

			<CustomHeader
				title='Booking Details'
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
				<View style={styles.summaryCard}>
					<View style={styles.metadata}>
						<View style={styles.metadataLeft}>
							<IconX name="event-available"
								origin={ICON_TYPE.MATERIAL_ICONS}
								size={20}
								color={colors.purple[700]} />
							<View>
								<Text
									style={styles.cardLabel}>
									Completed
								</Text>
								<Text style={styles.metadataDate}
								>
									{booking.date}
								</Text>
							</View>
						</View>
						<View
							style={styles.paid}
						>
							<Text style={styles.cardLabel}>Total Paid</Text>
							<Text style={styles.paidAmount}>{booking.price}</Text>
						</View>
					</View>
					<View style={styles.providerRow}>{booking.image ?
						<Image source={{ uri: booking.image }}
							style={styles.providerImage} /> :
						<View style={styles.providerPlaceholder}>
							<IconX name="person" origin={ICON_TYPE.IONICONS}
								size={24} color={colors.purple[700]} />
						</View>}
						<View
							style={styles.providerCopy}
						>
							<Text
								style={styles.providerName}
							>
								{booking.specialist}
							</Text>
							<Text
								style={styles.providerBusiness}
							>
								{booking.provider}
							</Text>
							<Text
								style={styles.serviceBadge}
							>
								{booking.title}
							</Text>
						</View>
					</View>
				</View>

				<View style={styles.card}><Text style={styles.heading}>How was your experience?</Text><Text style={styles.subtitle}>Your review helps other homeowners and rewards top providers.</Text><View style={styles.stars}>{[1, 2, 3, 4, 5].map(value => <Pressable key={value} accessibilityLabel={`${value} star`} onPress={() => setRating(value)} style={styles.starButton}><IconX name="star" origin={ICON_TYPE.IONICONS} size={36} color={value <= rating ? colors.yellow[400] : colors.grey[300]} /></Pressable>)}</View><View style={styles.ratingBadge}><IconX name="thumbs-up" origin={ICON_TYPE.IONICONS} size={16} color={colors.purple[700]} /><Text style={styles.ratingBadgeText}>{RATING_LABELS[rating - 1]} ({rating}.0)</Text></View><Text style={styles.cardLabel}>What made it great?</Text><View style={styles.chips}>{COMPLIMENTS.map(compliment => { const selected = selectedCompliments.includes(compliment); return <Pressable key={compliment} onPress={() => toggleCompliment(compliment)} style={[styles.chip, selected && styles.chipSelected]}><IconX name={selected ? 'checkmark' : 'add'} origin={ICON_TYPE.IONICONS} size={15} color={selected ? colors.white[100] : colors.grey[700]} /><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{compliment}</Text></Pressable>; })}</View></View>

				<View style={styles.card}><View style={styles.reviewHeading}><Text style={styles.reviewLabel}>Write a detailed review</Text><Text style={styles.counter}>{review.length} / 500</Text></View><TextInput value={review} onChangeText={setReview} maxLength={500} multiline numberOfLines={5} placeholder={`Tell the community how ${booking.specialist} did...`} placeholderTextColor={colors.grey[700]} style={styles.reviewInput} textAlignVertical="top" /></View>

				<View style={styles.actions}><Pressable disabled={submitting} style={styles.submitButton} onPress={submitReview}><Text style={styles.submitText}>Submit Review</Text><IconX name="send" origin={ICON_TYPE.IONICONS} size={19} color={colors.white[100]} /></Pressable><Pressable disabled={submitting} style={styles.skipButton} onPress={() => navigation.goBack()}><Text style={styles.skipText}>Skip for now</Text></Pressable></View>
			</KeyboardAwareScrollView>
		</View>
	);
}
