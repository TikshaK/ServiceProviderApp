import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { CustomHeader, EmptyState, ICON_TYPE, IconX } from '../../../../components';
import { colors } from '../../../../constants';
import { getBookings, getReviews } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import type { Review } from '../../../../types/review';
import type { Booking } from '../../../../types/booking';
import { styles } from './styles';

type EarningsAndReviewsProps = { navigation: any };
type ViewMode = 'earnings' | 'reviews';

type DisplayReview = Review & { name: string; service: string; date: string };

function Stars({ size = 18, rating = 5 }: { size?: number; rating?: number }) {
	return (
		<View style={styles.stars}>
			{[1, 2, 3, 4, 5].map(star => (
				<IconX key={star} name="star" origin={ICON_TYPE.IONICONS} size={size} color={star <= Math.round(rating) ? colors.purple[600] : colors.grey[300]} />
			))}
		</View>
	);
}

function getServiceIcon(title: string): string {
	const lower = title.toLowerCase();
	if (lower.includes('clean')) return 'cleaning-services';
	if (lower.includes('plumb')) return 'plumbing';
	if (lower.includes('ac') || lower.includes('hvac') || lower.includes('cool')) return 'mode-fan';
	if (lower.includes('elec') || lower.includes('wire')) return 'bolt';
	if (lower.includes('paint')) return 'brush';
	if (lower.includes('lawn') || lower.includes('garden') || lower.includes('yard')) return 'leaf';
	if (lower.includes('roof')) return 'home';
	if (lower.includes('lock') || lower.includes('door')) return 'door';
	if (lower.includes('tile') || lower.includes('floor')) return 'grid';
	return 'build';
}

export default function EarningsAndReviews({ navigation }: EarningsAndReviewsProps) {
	const [activeView, setActiveView] = useState<ViewMode>('earnings');
	const profile = useAppSelector(state => state.user.profile);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [totalEarnings, setTotalEarnings] = useState(0);
	const [completedJobs, setCompletedJobs] = useState(0);
	const [reviewCount, setReviewCount] = useState(0);
	const [averageRating, setAverageRating] = useState(0);
	const [providerReviews, setProviderReviews] = useState<DisplayReview[]>([]);

	useFocusEffect(
	useCallback(() => {
		if (!profile?.uid) return;
		Promise.all([getBookings('providerId', profile.uid, 'completed'), getReviews(profile.uid)]).then(([fetchedBookings, fetchedReviews]) => {
			const sortedBookings = fetchedBookings.sort((a, b) => b.createdAt - a.createdAt);
			setBookings(sortedBookings);
			setTotalEarnings(sortedBookings.reduce((total, booking) => total + booking.totalAmount, 0));
			setCompletedJobs(sortedBookings.length);
			setReviewCount(fetchedReviews.length);
			setAverageRating(fetchedReviews.length ? fetchedReviews.reduce((total, review) => total + review.rating, 0) / fetchedReviews.length : 0);
			setProviderReviews(fetchedReviews.map(review => {
				const booking = sortedBookings.find(item => item.id === review.bookingId);
				return {
					...review,
					name: booking?.customerSnapshot.fullName ?? review.reviewerId,
					service: booking?.serviceSnapshot.title ?? 'Completed booking',
					date: new Date(review.createdAt).toLocaleDateString(),
				};
			}));
		}).catch(() => undefined);
	}, [profile?.uid])
  );

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
		
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}>
				<View style={styles.segmentedControl}>
					<Pressable
						accessibilityRole="tab"
						accessibilityState={{ selected: activeView === 'earnings' }}
						onPress={() => setActiveView('earnings')}
						style={[styles.segment, activeView === 'earnings' && styles.segmentActive]}>
						<IconX name="cash-outline" origin={ICON_TYPE.IONICONS} size={18} color={activeView === 'earnings' ? colors.purple[700] : colors.grey[700]} />
						<Text style={[styles.segmentText, activeView === 'earnings' && styles.segmentTextActive]}>Earnings</Text>
					</Pressable>
					<Pressable
						accessibilityRole="tab"
						accessibilityState={{ selected: activeView === 'reviews' }}
						onPress={() => setActiveView('reviews')}
						style={[styles.segment, activeView === 'reviews' && styles.segmentActive]}>
						<IconX name="star-half" origin={ICON_TYPE.IONICONS} size={18} color={activeView === 'reviews' ? colors.purple[700] : colors.grey[700]} />
						<Text style={[styles.segmentText, activeView === 'reviews' && styles.segmentTextActive]}>Reviews & Trust</Text>
					</Pressable>
				</View>

				{activeView === 'earnings' ? (
					<View style={styles.sectionGap}>
						<View style={styles.summaryGrid}>
							<SummaryCard icon="wallet-outline" label="Total Earnings" value={`$${totalEarnings.toFixed(2)}`} detail="Completed bookings" />
							<SummaryCard icon="checkmark-done-outline" label="Completed" value={`${completedJobs} Jobs`} detail={`${reviewCount} reviews`} />
						</View>
						<View style={styles.section}>
							{bookings.length === 0 ? <EmptyState title="No earnings found" message="Completed booking earnings will appear here." icon="wallet-outline" /> : (
								<>
									<View style={styles.sectionHeadingRow}>
										<Text style={styles.sectionTitle}>Recent Earnings History</Text>
										<Text style={styles.sectionMeta}>
											{new Date(bookings[0].createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
										</Text>
									</View>
									{bookings.map(booking => {
										const serviceIcon = getServiceIcon(booking.serviceSnapshot.title);
										const formattedDate = new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
										return (
											<View
												key={booking.id}
												style={styles.earningItem}
											>
												<View
													style={styles.itemIcon}
												>
													<IconX
														name={serviceIcon}
														origin={ICON_TYPE.MATERIAL_ICONS}
														size={22}
														color={colors.purple[700]}
													/>
												</View>
												<View
													style={styles.itemCopy}
												>
													<Text
														style={styles.itemTitle}
														numberOfLines={1}
													>
														{booking.serviceSnapshot.title}
													</Text>
													<View
														style={styles.itemMetaRow}
													>
														<Text
															style={styles.itemMeta}
														>
															{formattedDate}
														</Text>
														<View
															style={styles.dot}
														/>
														<Text
															style={styles.completed}
														>
															Completed
														</Text>
													</View>
												</View>
												<View
													style={styles.amountCopy}
												>
													<Text
														style={styles.amount}
													>
														+${booking.totalAmount.toFixed(2)}
													</Text>
													<Text
														style={styles.itemMeta}
													>
														Net Payout
													</Text>
												</View>
											</View>
										);
									})}
								</>
							)}
						</View>
					</View>
				) : (
					<View
						style={styles.sectionGap}
					>
						<View
							style={styles.ratingCard}
						>
							<View
								style={styles.ratingIcon}
							>
								<IconX
									name="stars"
									origin={ICON_TYPE.MATERIAL_ICONS}
									size={26}
									color={colors.purple[700]}
								/>
							</View>
							<View
								style={styles.ratingValueRow}
							>
								<Text
									style={styles.ratingValue}
								>
									{averageRating.toFixed(1)}
								</Text>
								<Text
									style={styles.ratingOutOf}
								>
									/ 5.0
								</Text>
							</View>
							<Stars
								rating={averageRating}
							/>
							<Text
								style={styles.ratingDescription}
							>
								Based on {reviewCount} verified customer reviews
							</Text>

						</View>
						<View
							style={styles.section}
						>
							<View
								style={styles.sectionHeadingRow}
							>
								<Text
									style={styles.sectionTitle}
								>
									Client Feedback
								</Text>

							</View>
							{reviewCount === 0
								?
								<EmptyState
									title="No reviews found"
									message="Customer reviews will appear here after completed bookings."
									icon="star-outline"
								/>
								:
								providerReviews.map(review =>
									<ReviewCard
										key={review.id} {...review}
									/>
								)
							}
						</View>
					</View>
				)}
			</ScrollView>
		</View>
	);
}

function SummaryCard({ icon, label, value, detail }: { icon: string; label: string; value: string; detail: string }) {
	return <View
		style={styles.summaryCard}
	>
		<View
			style={styles.summaryIcon}
		>
			<IconX
				name={icon}
				origin={ICON_TYPE.IONICONS}
				size={20}
				color={colors.purple[700]}
			/>
		</View>
		<Text
			style={styles.summaryLabel}
		>
			{label}
		</Text>
		<Text
			style={styles.summaryValue}
		>
			{value}
		</Text>
		<Text
			style={styles.summaryDetail}
		>
			{detail}
		</Text>
	</View>;
}

function TrustMetric({ value, label }: { value: string; label: string }) {
	return <View
		style={styles.trustMetric}
	>
		<Text
			style={styles.trustValue}
		>
			{value}

		</Text>
		<Text
			style={styles.summaryDetail}
		>
			{label}
		</Text>
	</View>;
}

function ReviewCard({ name, service, date, comment, rating }: DisplayReview) {
	return <View
		style={styles.reviewCard}
	>
		<View
			style={styles.reviewHeader}
		>
			<View
				style={styles.reviewerAvatar}
			>
				<Text
					style={styles.reviewerInitial}
				>
					{name.charAt(0)}
				</Text>
			</View>
			<View
				style={styles.reviewerCopy}
			>
				<Text
					style={styles.reviewerName}
				>
					{name}
				</Text>
				<Text
					style={styles.summaryDetail}
				>
					{service}
				</Text>
			</View>
			<View
				style={styles.reviewRating}
			>
				<Stars
					size={15}
					rating={rating}
				/>
				<Text
					style={styles.summaryDetail}
				>
					{date}
				</Text>
			</View>
		</View>
		<Text
			style={styles.reviewText}
		>
			“{comment}”
		</Text>
		<View
			style={styles.reviewFooter}
		>
			<View
				style={styles.verifiedBooking}
			>
				<IconX
					name="checkmark-circle"
					origin={ICON_TYPE.IONICONS}
					size={14}
					color={colors.purple[700]}
				/>
				<Text
					style={styles.verifiedLabel}
				>
					Verified Booking
				</Text>
			</View>
		</View>
	</View>;
}
