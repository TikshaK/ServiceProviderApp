import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Image, Linking, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors } from '../../../../constants';
import { approveBookingCompletion, rejectBookingCompletion, respondToOpenBookingQuote, updateBookingStatus } from '../../../../services/firebase';
import type { BookingQuote } from '../../../../types/booking';
import { styles } from './styles';
import { showToast } from '../../../../utils';

type Booking = { id: string; date: string; status: string; title: string; provider: string; specialist: string; location: string; price: string; image: string; providerId?: string; bookingType?: 'direct' | 'open'; category?: string; quoteAmount?: number; totalAmount?: number; platformFee?: number; quotes?: BookingQuote[] };
type Props = { navigation: any; route?: { params?: { booking?: Booking } } };

const FALLBACK_BOOKING: Booking = { id: 'booking', date: 'Tomorrow, 25 Oct • 10:00 AM', status: 'Accepted', title: 'Deep Home Cleaning (3-Bed)', provider: 'Apex Home & Repair Services', specialist: 'John Reynolds', location: '128 Pinecrest Blvd, Apt 4B, Austin', price: '$120.00', image: '' };

function normalizeBooking(raw?: any): Booking {
	if (!raw) return FALLBACK_BOOKING;
	const rawQuotes = raw.quotes;
	const quotesArray: BookingQuote[] = Array.isArray(rawQuotes)
		? rawQuotes
		: rawQuotes && typeof rawQuotes === 'object'
		? Object.values(rawQuotes)
		: [];

	const hasPendingQuote = quotesArray.some(quote => quote?.status === 'pending');

	let formattedStatus = raw.status;
	if (raw.status === 'completed') formattedStatus = 'Completed';
	else if (raw.status === 'completionRequested') formattedStatus = 'Completion requested';
	else if (raw.status === 'quotePending' || hasPendingQuote) formattedStatus = 'Quote pending';
	else if (raw.status === 'accepted' || raw.status === 'inProgress') formattedStatus = 'Accepted';
	else if (raw.status === 'cancelled' || raw.status === 'declined') formattedStatus = 'Cancelled';
	else if (raw.status === 'pending') formattedStatus = hasPendingQuote ? 'Quote pending' : 'Pending';

	return {
		id: raw.id ?? 'booking',
		date: raw.date ?? (raw.scheduledDate ? `${raw.scheduledDate} • ${raw.scheduledTime}` : 'Date pending'),
		status: formattedStatus ?? 'Pending',
		title: raw.title ?? raw.serviceSnapshot?.title ?? 'Service Request',
		provider: raw.provider ?? raw.providerSnapshot?.serviceName ?? raw.providerSnapshot?.fullName ?? 'Waiting for quotes',
		specialist: raw.specialist ?? raw.providerSnapshot?.fullName ?? 'Not assigned',
		location: raw.location ?? raw.addressSnapshot?.street ?? 'Location pending',
		price: raw.price ?? (raw.bookingType === 'open' && raw.status === 'pending' && !raw.quotedAmount
			? 'Awaiting quote'
			: `$${raw.quotedAmount ?? raw.baseAmount ?? 0}`),
		image: raw.image ?? raw.serviceSnapshot?.imageUrls?.[0] ?? '',
		providerId: raw.providerId ?? undefined,
		bookingType: raw.bookingType,
		category: raw.category,
		quoteAmount: raw.quoteAmount ?? raw.quotedAmount,
		totalAmount: raw.totalAmount,
		platformFee: raw.platformFee,
		quotes: quotesArray,
	};
}

export default function CustomerBookingDetails({ navigation, route }: Props) {
	const initialBooking = normalizeBooking(route?.params?.booking);
	const [booking, setBooking] = useState<Booking>(initialBooking);

	useEffect(() => {
		if (route?.params?.booking) {
			setBooking(normalizeBooking(route.params.booking));
		}
	}, [route?.params?.booking]);

	const isAccepted = booking.status === 'Accepted';
	const isCompleted = booking.status === 'Completed';
	const isCancelled = booking.status === 'Cancelled';
	const pendingQuotes = booking.quotes?.filter(quote => quote.status === 'pending') ?? [];
	const isQuotePending = booking.status === 'Quote pending' || pendingQuotes.length > 0;
	const isCompletionRequested = booking.status === 'Completion requested';
	const [savingApproval, setSavingApproval] = useState(false);
	const [rejectingQuoteKey, setRejectingQuoteKey] = useState<string | null>(null);
	const [approvingQuoteKey, setApprovingQuoteKey] = useState<string | null>(null);
	const [completingAction, setCompletingAction] = useState<'approve' | 'reject' | null>(null);

	useEffect(() => {
		const onHardwareBackPress = () => {
			if (savingApproval) {
				return true;
			}
			return false;
		};

		const backHandlerSubscription = BackHandler.addEventListener(
			'hardwareBackPress',
			onHardwareBackPress
		);

		const beforeRemoveSubscription = navigation.addListener('beforeRemove', (e: any) => {
			if (!savingApproval) {
				return;
			}
			e.preventDefault();
		});

		return () => {
			backHandlerSubscription.remove();
			beforeRemoveSubscription();
		};
	}, [navigation, savingApproval]);

	const respondToQuote = async (approve: boolean, quote?: BookingQuote) => {
		const quoteKey = quote?.quoteId ?? quote?.providerId ?? 'single_quote';
		console.log('[QUOTE_APPROVAL][UI] button pressed', {
			bookingId: booking.id,
			action: approve ? 'approve' : 'decline',
			quoteKey,
			displayedStatus: booking.status,
		});
		setSavingApproval(true);
		if (approve) {
			setApprovingQuoteKey(quoteKey);
		} else {
			setRejectingQuoteKey(quoteKey);
		}
		try {
			console.log('[QUOTE_APPROVAL][UI] service call started', { bookingId: booking.id });
			await respondToOpenBookingQuote(booking.id, approve, {
				providerId: quote?.providerId ?? booking.providerId,
				quotedAmount: quote?.amount ?? booking.quoteAmount,
				quoteId: quote?.quoteId,
			});
			console.log('[QUOTE_APPROVAL][UI] service call succeeded', { bookingId: booking.id, approve });
			if (approve) {
				setBooking(prev => ({ ...prev, status: 'Accepted' }));
				showToast({ type: 'success', title: 'Quote approved', message: 'Your booking is confirmed.' });
				setSavingApproval(false);
				navigation.goBack();
			} else {
				setBooking(prev => {
					if (quote) {
						const updatedQuotes = (prev.quotes ?? []).map(q => {
							const matches = (quote.quoteId && q.quoteId === quote.quoteId) || (quote.providerId && q.providerId === quote.providerId);
							return matches ? { ...q, status: 'rejected' as const } : q;
						});
						return {
							...prev,
							quotes: updatedQuotes,
						};
					}
					return {
						...prev,
						status: 'pending',
						quoteAmount: undefined,
					};
				});
				showToast({ type: 'success', title: 'Quote declined', message: 'The request is open for another provider quote.' });
			}
		} catch (error: any) {
			console.log('[QUOTE_APPROVAL][UI] service call failed', { bookingId: booking.id, approve, error });
			const errorMessage = error?.message ?? 'Please try again.';
			showToast({ type: 'error', title: 'Unable to update quote', message: errorMessage });
			Alert.alert('Unable to update quote', errorMessage);
		} finally {
			console.log('[QUOTE_APPROVAL][UI] processing finished', { bookingId: booking.id, approve });
			setRejectingQuoteKey(null);
			setApprovingQuoteKey(null);
			setSavingApproval(false);
		}
	};

	const approveCompletion = async () => {
		setSavingApproval(true);
		setCompletingAction('approve');
		try {
			await approveBookingCompletion(booking.id);
			showToast({ type: 'success', title: 'Booking completed', message: 'Thanks for confirming the completed service.' });
			setSavingApproval(false);
			navigation.goBack();
		} catch (error: any) {
			console.error('Failed to approve completion:', error);
			const errorMessage = error?.message ?? 'Please try again.';
			showToast({ type: 'error', title: 'Unable to approve completion', message: errorMessage });
			Alert.alert('Unable to approve completion', errorMessage);
		} finally {
			setCompletingAction(null);
			setSavingApproval(false);
		}
	};

	const rejectCompletion = async () => {
		setSavingApproval(true);
		setCompletingAction('reject');
		try {
			await rejectBookingCompletion(booking.id);
			showToast({ type: 'success', title: 'Completion not approved', message: 'The provider has been notified and can follow up with you.' });
			setSavingApproval(false);
			navigation.goBack();
		} catch (error: any) {
			console.log('Failed to reject completion:', error);
			const errorMessage = error?.message ?? 'Please try again.';
			showToast({ type: 'error', title: 'Unable to reject completion', message: errorMessage });
			Alert.alert('Unable to reject completion', errorMessage);
		} finally {
			setCompletingAction(null);
			setSavingApproval(false);
		}
	};

	const cancelBooking = () => {
		if (savingApproval) return;
		Alert.alert('Cancel Booking?', 'Are you sure you want to cancel this booking? Free cancellation is available up to 2 hours before arrival.', [
			{ text: 'Keep Booking', style: 'cancel' },
			{
				text: 'Cancel Booking', style: 'destructive', onPress: async () => {
					try {
						await updateBookingStatus(booking.id, 'cancelled');
						navigation.goBack();
					} catch (error) {
						console.error('Failed to cancel booking:', error);
					}
				}
			},
		]);
	};

	return (
		<View style={styles.container}>
			<StatusBar
				barStyle="dark-content"
			/>
			<CustomHeader
				title="Booking Details"
				showBackButton
				disabled={savingApproval}
				onLeftPress={() => {
					if (!savingApproval) {
						navigation.goBack();
					}
				}}
			/>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				pointerEvents={savingApproval ? 'none' : 'auto'}
			>
				<View
					style={styles.statusCard}
				>
					<View
						style={styles.statusIcon}
					>
						<IconX
							name={isAccepted ? 'check-decagram' : isCompleted ? 'check-circle' : isCancelled ? 'close-circle' : 'time-outline'}
							origin={isAccepted || isCompleted ? ICON_TYPE.MATERIAL_COMMUNITY : ICON_TYPE.IONICONS}
							size={23}
							color={colors.purple[700]}
						/>
					</View>
					<View
						style={styles.statusCopy}
					>
						<View
							style={styles.statusHeading}
						>
							<Text
								style={styles.statusTitle}
							>
								{isAccepted ? 'Accepted & Confirmed' : isCompleted ? 'Booking Completed' : isCancelled ? 'Booking Cancelled' : isQuotePending ? 'Review provider quote' : isCompletionRequested ? 'Confirm completion' : 'Booking Pending'}
							</Text>
							<Text style={styles.scheduleBadge}
							>{isAccepted ? 'On Schedule' : isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : isQuotePending ? 'Quote awaiting you' : isCompletionRequested ? 'Awaiting your approval' : 'Awaiting provider'}
							</Text>
						</View>
						<Text
							style={styles.statusDescription}
						>
							{isAccepted ? `Technician ${booking.specialist} is scheduled to arrive on ${booking.date}.` : isCompleted ? `Your booking with ${booking.specialist} has been completed.` : isCancelled ? 'This booking has been cancelled.' : isQuotePending ? `${booking.specialist} sent a price for your ${booking.category ?? 'service'} request.` : isCompletionRequested ? `${booking.specialist} says the service is complete. Confirm to close this booking.` : 'Your request has been sent to matching service providers.'}
						</Text>
					</View>
				</View>

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
							style={styles.categoryBadge}
						>
							{
								booking.category
								??
								'Service'
							}
						</Text>
					</View>
					<View
						style={styles.serviceRow}
					>
						{
							booking.image
								?
								<Image
									source={{ uri: booking.image }}
									style={styles.serviceImage}
								/>
								:
								<View
									style={styles.servicePlaceholder}
								>
									<IconX
										name="cleaning-services"
										origin={ICON_TYPE.MATERIAL_ICONS}
										size={29}
										color={colors.purple[700]}
									/>
								</View>
						}
						<View
							style={styles.serviceCopy}
						>
							<Text
								style={styles.serviceTitle}
							>
								{booking.title}
							</Text>
							<View
								style={styles.serviceMeta}
							>
								<IconX
									name="time-outline"
									origin={ICON_TYPE.IONICONS}
									size={15}
									color={colors.grey[700]}
								/>
								<Text
									style={styles.mutedText}
								>
									{
										booking.quoteAmount
											?
											'Provider quote'
											:
											'Schedule'
									}
								</Text>
								<Text
									style={styles.mutedText}
								>
									•
								</Text>
								<Text
									style={styles.servicePrice}
								>
									{
										booking.price
									}
								</Text>
							</View>
						</View>
					</View>
				</View>

				<View
					style={styles.card}
				>
					<Text
						style={styles.cardLabel}
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
						{
							booking.providerId
								?
								'Your Assigned Pro'
								:
								'Provider matching'
						}
					</Text>
					<View
						style={styles.providerRow}
					>
						{
							booking.image
								?
								<Image
									source={{ uri: booking.image }}
									style={styles.providerImage}
								/>
								:
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
					{booking.providerId
						?
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
						:
						<Text
							style={styles.mutedText}
						>
							Your address and contact details are shared after a provider is assigned.
						</Text>
					}
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
							${booking.platformFee ?? 0}
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
							${
								booking.totalAmount
								??
								booking.quoteAmount
								??
								0
							}
						</Text>
					</View>
				</View>

				{booking.quotes && booking.quotes.length > 0 ? (
					<View style={styles.card}>
						<Text style={styles.cardLabel}>Provider quotes</Text>
						{booking.quotes.map(quote => (
							<View key={quote.quoteId ?? quote.providerId} style={styles.quoteCard}>
								<View style={styles.quoteRow}>
									<Text style={styles.quoteName}>
										{quote.providerSnapshot?.serviceName ?? quote.providerName ?? quote.providerSnapshot?.fullName ?? 'Service provider'}
									</Text>
									<Text style={styles.quoteAmount}>${quote.amount.toFixed(2)}</Text>
								</View>
								<Text style={styles.mutedText}>
									{quote.status === 'accepted' ? 'Accepted' : quote.status === 'rejected' ? 'Rejected' : 'Awaiting your decision'}
								</Text>
								{quote.status === 'pending' && booking.status === 'Quote pending' ? (
									<View style={styles.quoteActions}>
										<Pressable
											style={styles.rejectButton}
											disabled={savingApproval}
											onPress={() => respondToQuote(false, quote)}
										>
											{rejectingQuoteKey === (quote.quoteId ?? quote.providerId) ? (
												<ActivityIndicator size="small" color={colors.red[200]} />
											) : (
												<Text style={styles.rejectButtonText}>Reject</Text>
											)}
										</Pressable>
										<Pressable
											style={styles.approveButton}
											disabled={savingApproval}
											onPress={() => respondToQuote(true, quote)}
										>
											{approvingQuoteKey === (quote.quoteId ?? quote.providerId) ? (
												<ActivityIndicator size="small" color={colors.white[100]} />
											) : (
												<Text style={styles.approveButtonText}>Accept quote</Text>
											)}
										</Pressable>
									</View>
								) : null}
							</View>
						))}
					</View>
				) : null}

				{isQuotePending && !booking.quotes?.length ? (
					<View style={styles.approvalActions}>
						<Pressable
							style={styles.approveButton}
							disabled={savingApproval}
							onPress={() => respondToQuote(true)}
						>
							{approvingQuoteKey === 'single_quote' ? (
								<ActivityIndicator size="small" color={colors.white[100]} />
							) : (
								<Text style={styles.approveButtonText}>Approve quote</Text>
							)}
						</Pressable>
						<Pressable
							style={styles.rejectButton}
							disabled={savingApproval}
							onPress={() => respondToQuote(false)}
						>
							{rejectingQuoteKey === 'single_quote' ? (
								<ActivityIndicator size="small" color={colors.red[200]} />
							) : (
								<Text style={styles.rejectButtonText}>Decline quote</Text>
							)}
						</Pressable>
					</View>
				) : null}

				{isCompletionRequested ? (
					<View style={styles.approvalActions}>
						<Text style={styles.approvalHint}>
							Confirm only after the service has been completed.
						</Text>
						<Pressable
							style={styles.rejectButton}
							disabled={savingApproval}
							onPress={rejectCompletion}
						>
							{completingAction === 'reject' ? (
								<ActivityIndicator size="small" color={colors.red[200]} />
							) : (
								<Text style={styles.rejectButtonText}>Reject completion</Text>
							)}
						</Pressable>
						<Pressable
							style={styles.approveButton}
							disabled={savingApproval}
							onPress={approveCompletion}
						>
							{completingAction === 'approve' ? (
								<ActivityIndicator size="small" color={colors.white[100]} />
							) : (
								<Text style={styles.approveButtonText}>Approve completion</Text>
							)}
						</Pressable>
					</View>
				) : null}

				{!isCancelled && !isCompleted && !isQuotePending && !isCompletionRequested &&
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
				}
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
