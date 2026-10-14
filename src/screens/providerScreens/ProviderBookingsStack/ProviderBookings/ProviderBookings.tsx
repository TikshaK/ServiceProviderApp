import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {
  CustomSearchBar,
  CustomTab, ICON_TYPE, IconX
} from '../../../../components';
import {
  colors, navigationStrings,
  strings
} from '../../../../constants';
import {
  getBookings,
  requestBookingCompletion,
  updateBookingStatus
} from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import {
  hasActiveProviderQuote,
  isBookingExpired,
  type BookingStatus as FirebaseBookingStatus
} from '../../../../types/booking';
import { styles } from './styles';
import { showToast } from '../../../../utils';

type BookingStatus = 'Pending' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Expired' | 'Rejected Quote';
type FilterTab = 'All' | 'Pending' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Expired' | 'Rejected Quotes';

export interface BookingItem {
  id: string;
  clientName: string;
  customerPhone?: string;
  serviceTitle: string;
  serviceImageUrl?: string;
  status: BookingStatus;
  dateText: string;
  address: string;
  amount: string;
  avatarUrl: string;
  statusBgColor: string;
  statusTextColor: string;
  dotColor?: string;
  notes?: string;
  quotePending?: boolean;
  hasSentQuote?: boolean;
  previousRejectedQuotes?: number[];
  completionRequested?: boolean;
  statusLabel?: string;
}

const TABS: FilterTab[] = ['All',
  'Pending', 'Upcoming', 'Completed',
  'Cancelled', 'Expired', 'Rejected Quotes'];

interface ProviderBookingsProps {
  navigation?: any;
}

export default function ProviderBookings({ navigation }: ProviderBookingsProps) {
  const profile = useAppSelector(state => state.user.profile);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const requestId = useRef(0);

  const refreshBookings = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    if (!profile?.uid) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const items = await getBookings('providerId', profile.uid);
      if (currentRequestId !== requestId.current) return;
      setBookings(items.map(item => {
        const myQuote = item.quotes?.[profile.uid];
        const previousRejectedQuotes = Object.values(item.quoteHistory ?? {})
          .filter(quote => quote.providerId === profile.uid
            && quote.status === 'rejected'
            && quote.quoteId !== myQuote?.quoteId)
          .map(quote => quote.amount);
        const isQuotePending = myQuote && myQuote.status === 'pending';
        const isQuoteRejected = myQuote && myQuote.status === 'rejected';

        const mappedStatus = isBookingExpired(item)
          ? 'Expired'
          : isQuoteRejected
            ? 'Rejected Quote'
            : item.status === 'accepted' || item.status === 'inProgress' || item.status === 'completionRequested'
              ? 'Upcoming'
              : item.status === 'completed'
                ? 'Completed'
                : item.status === 'cancelled' || item.status === 'declined'
                  ? 'Cancelled'
                  : 'Pending';

        return {
          id: item.id,
          clientName: item.customerSnapshot.fullName,
          customerPhone: item.customerSnapshot.phone,
          serviceTitle: item.serviceSnapshot.title,
          serviceImageUrl: item.serviceSnapshot.imageUrls?.[0] ?? '',
          status: mappedStatus,
          dateText: `${item.scheduledDate} • ${item.scheduledTime}`,
          address: item.addressSnapshot?.street ?? '',
          amount: `$${myQuote ? myQuote.amount : item.totalAmount ?? item.quotedAmount ?? 0}`,
          statusBgColor: isBookingExpired(item) ? '#FEF2F2' : mappedStatus === 'Pending' ? '#FFFBEB' : mappedStatus === 'Completed' ? '#ECFDF5' : mappedStatus === 'Cancelled' || mappedStatus === 'Rejected Quote' ? '#FEF2F2' : '#EFF6FF',
          statusTextColor: isBookingExpired(item) ? '#DC2626' : mappedStatus === 'Pending' ? '#B45309' : mappedStatus === 'Completed' ? '#047857' : mappedStatus === 'Cancelled' || mappedStatus === 'Rejected Quote' ? '#DC2626' : '#1D4ED8',
          dotColor: isBookingExpired(item) ? '#DC2626' : mappedStatus === 'Pending' ? '#D97706' : mappedStatus === 'Cancelled' || mappedStatus === 'Rejected Quote' ? '#DC2626' : '#2563EB',
          avatarUrl: '',
          notes: item.specialInstructions ?? undefined,
          quotePending: isQuotePending,
          hasSentQuote: hasActiveProviderQuote(item, profile.uid),
          previousRejectedQuotes,
          completionRequested: item.status === 'completionRequested',
          statusLabel: isQuotePending ? 'Quote sent' : isQuoteRejected ? 'Quote rejected' : item.status === 'completionRequested' ? 'Awaiting customer' : undefined,
        };
      }));
    } catch (error) {
      if (currentRequestId !== requestId.current) return;
      console.log('[ProviderBookings] Failed to load bookings:', error);
      showToast({
        type: 'error',
        title: 'Unable to load bookings',
        message: 'Check your connection and Firebase permissions, then refresh.',
      });
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false);
    }
  }, [profile?.uid]);

  useFocusEffect(
    useCallback(() => {
      refreshBookings();
      return () => { requestId.current += 1; };
    }, [refreshBookings])
  );

  const counts = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const upcoming = bookings.filter(b => b.status === 'Upcoming').length;
    const completed = bookings.filter(b => b.status === 'Completed').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
    const expired = bookings.filter(b => b.status === 'Expired').length;
    const rejected = bookings.filter(b => b.status === 'Rejected Quote').length;
    return {
      All: total,
      Pending: pending,
      Upcoming: upcoming,
      Completed: completed,
      Cancelled: cancelled,
      Expired: expired,
      'Rejected Quotes': rejected
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesTab = activeTab === 'All'
        || booking.status === activeTab
        || (activeTab === 'Rejected Quotes' && booking.status === 'Rejected Quote');
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        booking.clientName.toLowerCase().includes(query) ||
        booking.serviceTitle.toLowerCase().includes(query) ||
        booking.address.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery, bookings]);



  const changeStatus = async (
    bookingId: string,
    status: FirebaseBookingStatus,
  ) => {
    try {
      await updateBookingStatus(bookingId, status);

      setBookings(current =>
        current.map(booking =>
          booking.id === bookingId
            ? {
              ...booking,
              status:
                status === 'accepted'
                  ? 'Upcoming'
                  : status === 'declined'
                    ? 'Cancelled'
                    : status === 'completed'
                      ? 'Completed'
                      : booking.status,
            }
            : booking,
        ),
      );
    } catch (error) {
      console.error('[ProviderBookings] Failed to change booking status:',
        error);

      showToast({
        type: "error",
        title: 'error',
        message: 'Failed to change booking status. Please try again.'
      });
    }
  };

  const requestCompletion = async (bookingId: string) => {
    if (!profile?.uid) return;
    try {
      await requestBookingCompletion(bookingId, profile.uid);
      setBookings(current => current.map(booking => booking.id === bookingId
        ? { ...booking, completionRequested: true, statusLabel: 'Awaiting customer' }
        : booking));
      showToast({ type: 'success', title: 'Completion requested', message: 'The customer will approve the completed service.' });
    } catch {
      showToast({ type: 'error', title: 'Unable to request completion', message: 'Please try again.' });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.searchSection}>
        <CustomSearchBar
          placeholder={strings.providerBookings?.searchPlaceholder
            ?? 'Search customer name or service...'
          }
          searchText={searchQuery}
          setSearchText={setSearchQuery}
          containerStyles={styles.searchInputContainer}
        />
      </View>

      <CustomTab
        tabs={TABS.map(tab => ({
          key: tab,
          label: strings.providerBookings[`tab${tab}` as keyof typeof strings.providerBookings]
            ?? tab,
          count: counts[tab],
        }))}
        activeKey={activeTab}
        onChange={key => setActiveTab(key as FilterTab)}
        containerStyle={styles.tabsScrollView}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshBookings} />}>
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            Showing <Text style={styles.summaryHighlight}>
              {filteredBookings.length}
            </Text> bookings
          </Text>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color={colors.purple[700]} />
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <IconX
                name="calendar-outline"
                origin={ICON_TYPE.IONICONS}
                size={32}
                color={colors.purple[600]}
              />
            </View>
            <Text
              style={styles.emptyTitle}
            >
              {strings.providerBookings?.noBookingsTitle
                ?? 'No Bookings Found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {strings.providerBookings?.noBookingsSub
                ?? 'You have no bookings under this category right now.'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.bookingList}>
            {filteredBookings.map(booking => {
              const isCompleted = booking.status === 'Completed';
              const customerPhone = booking.customerPhone;
              console.log("Booking call:", customerPhone)
              return (
                <Pressable
                  key={booking.id}
                  accessibilityRole="button"
                  onPress={() => navigation?.navigate(navigationStrings.PROVIDER_BOOKING_DETAILS, { booking })}
                  style={styles.bookingCard}>
                  <View style={styles.bookingCardHeader}>
                    <View style={styles.bookingClient}>
                      <Image
                        source={{ uri: booking.serviceImageUrl }}
                        style={styles.bookingAvatar}
                      />
                      <View style={styles.bookingClientInfo}>
                        <Text style={styles.bookingClientName}
                          numberOfLines={1}>
                          {booking.clientName}
                        </Text>
                        <Text style={styles.bookingServiceTitle}
                          numberOfLines={1}>
                          {booking.serviceTitle}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[styles.statusBadge, { backgroundColor: booking.statusBgColor }]}
                    >
                      {
                        isCompleted ? (
                          <IconX
                            name="checkmark"
                            origin={ICON_TYPE.IONICONS}
                            size={12}
                            color={booking.statusTextColor}
                          />
                        )
                          :
                          booking.dotColor
                            ?
                            (
                              <View
                                style={[
                                  styles.statusDot,
                                  { backgroundColor: booking.dotColor }
                                ]}
                              />
                            )
                            :
                            null
                      }
                      <Text
                        style={[styles.statusBadgeText, { color: booking.statusTextColor }]}
                      >
                        {booking.statusLabel ?? booking.status}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={styles.detailsDivider}
                  />

                  <View
                    style={styles.detailsRow}
                  >
                    <View
                      style={styles.infoItem}
                    >
                      <IconX
                        name="time-outline"
                        origin={ICON_TYPE.IONICONS}
                        size={16}
                        color={colors.purple[600]}
                      />
                      <Text
                        style={styles.infoText}
                      >
                        {booking.dateText}
                      </Text>
                    </View>
                    {booking.address
                      ?
                      <View
                        style={styles.infoItem}
                      >
                        <IconX
                          name="location-outline"
                          origin={ICON_TYPE.IONICONS}
                          size={16}
                          color={colors.purple[600]}
                        />
                        <Text
                          style={styles.infoText}
                          numberOfLines={1}
                        >
                          {booking.address}
                        </Text>
                      </View>
                      :
                      null
                    }
                    {booking.notes ? (
                      <View
                        style={styles.infoItem}
                      >
                        <IconX
                          name="information-circle-outline"
                          origin={ICON_TYPE.IONICONS} size={16}
                          color={colors.grey[700]}
                        />
                        <Text
                          style={styles.infoText}
                          numberOfLines={1}
                        >
                          {booking.notes}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {booking.previousRejectedQuotes?.length ? (
                    <Text style={styles.infoText}>
                      Previous rejected quote{booking.previousRejectedQuotes.length > 1 ? 's' : ''}: {booking.previousRejectedQuotes.map(amount => `$${amount.toFixed(2)}`).join(', ')}
                    </Text>
                  ) : null}

                  <View style={styles.detailsDivider} />

                  <View style={styles.bookingCardFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceLabel}>Estimated Payment</Text>
                      <Text style={styles.priceValue}>{booking.amount}</Text>
                    </View>

                    <View style={styles.bookingActions}>
                      {booking.status === 'Pending' && !booking.quotePending && (
                        <>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => changeStatus(booking.id, 'declined')}
                            style={styles.actionButtonDanger}
                          >
                            <Text style={styles.actionButtonDangerText}>
                              {strings.providerBookings?.decline ?? 'Decline'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => changeStatus(booking.id, 'accepted')}
                            style={styles.actionButtonPrimary}
                          >
                            <Text style={styles.actionButtonPrimaryText}
                            >
                              {strings.providerBookings?.accept ?? 'Accept'}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}

                      {booking.quotePending && <Text style={styles.actionButtonOutlineText}>Awaiting customer quote approval</Text>}

                      {booking.status === 'Upcoming' && (
                        <>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.iconActionButton}
                            onPress={() => Linking.openURL(`tel:${customerPhone}`)}

                          >
                            <IconX
                              name="call-outline"
                              origin={ICON_TYPE.IONICONS}
                              size={18}
                              color={colors.purple[700]}
                            />
                          </TouchableOpacity>

                          {booking.completionRequested ? <Text style={styles.actionButtonOutlineText}>Awaiting customer approval</Text> : <TouchableOpacity activeOpacity={0.7}
                            style={styles.actionButtonPrimary}
                            onPress={() => requestCompletion(booking.id)}
                          >
                            <Text style={styles.actionButtonPrimaryText}
                            >
                              Request to complete
                            </Text>
                          </TouchableOpacity>}
                        </>
                      )}

                      {booking.status === 'Completed' && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={styles.actionButtonOutline}
                          onPress={() => navigation?.navigate(navigationStrings.PROVIDER_BOOKING_DETAILS, { booking })}
                        >
                          <Text
                            style={styles.actionButtonOutlineText}
                          >
                            {strings.providerBookings?.viewReceipt ?? 'View Receipt'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {booking.status === 'Cancelled' && (
                        <TouchableOpacity activeOpacity={0.7}
                          style={styles.actionButtonOutline}>
                          <Text style={styles.actionButtonOutlineText}>
                            {strings.providerBookings?.details ?? 'Details'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
