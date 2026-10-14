import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Image,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { CustomSearchBar, CustomTab, EmptyState, ICON_TYPE, IconX } from '../../../../components';
import { colors, navigationStrings, strings } from '../../../../constants';
import { getBookings, getReviewsByReviewerId } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { isBookingExpired, type BookingQuote } from '../../../../types/booking';
import { styles } from './styles';

type TabKey = 'all' | 'upcoming' | 'completed' | 'cancelled' | 'expired';
type DisplayBooking = {
  id: string;
  providerId?: string;
  bookingType?: 'direct' | 'open';
  category?: string;
  date: string;
  status: string;
  title: string;
  provider: string;
  specialist: string;
  location: string;
  price: string;
  image: string;
  totalAmount?: number;
  platformFee?: number;
  quoteAmount?: number;
  quotes?: BookingQuote[];
};

export default function CustomerBookings({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const profile = useAppSelector(state => state.user.profile);
  const [allBookings, setAllBookings] = useState<DisplayBooking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<DisplayBooking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<DisplayBooking[]>([]);
  const [cancelledBookings, setCancelledBookings] = useState<DisplayBooking[]>([]);
  const [expiredBookings, setExpiredBookings] = useState<DisplayBooking[]>([]);
  const [ratedBookingIds, setRatedBookingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (!profile?.uid) return;
      setIsLoading(true);
      Promise.all([
        getBookings('customerId', profile.uid),
        getReviewsByReviewerId(profile.uid),
      ]).then(([bookings, reviews]) => {
        if (!active) return;
        const sortedBookings = bookings.sort((a, b) => b.createdAt - a.createdAt);
        const ratedIds = new Set(reviews.map(review => review.bookingId));
        setRatedBookingIds(ratedIds);
        const mapBooking = (booking: any): DisplayBooking => {
          const quotes = Object.values(booking.quotes ?? {}) as BookingQuote[];
          const hasPendingQuote = quotes.some(quote => quote.status === 'pending');
          return ({
            id: booking.id,
            providerId: booking.providerId ?? undefined,
            bookingType: booking.bookingType,
            category: booking.category,
            date: `${booking.scheduledDate} • ${booking.scheduledTime}`,
            status: isBookingExpired(booking) ? 'Expired' : booking.status === 'completed' ? 'Completed' : booking.status === 'completionRequested' ? 'Completion requested' : booking.status === 'quotePending' || hasPendingQuote ? 'Quote pending' : booking.status === 'accepted' || booking.status === 'inProgress' ? 'Accepted' : booking.status === 'cancelled' || booking.status === 'declined' ? 'Cancelled' : 'Pending',
            title: booking.serviceSnapshot.title,
            provider: booking.providerSnapshot?.serviceName ?? booking.providerSnapshot?.fullName ?? 'Waiting for quotes',
            specialist: booking.providerSnapshot?.fullName ?? 'Not assigned',
            location: booking.addressSnapshot.street,
            price: booking.bookingType === 'open' && booking.status === 'pending'
              ? 'Awaiting quote'
              : `$${booking.quotedAmount ?? booking.baseAmount}`,
            image: booking.serviceSnapshot.imageUrls?.[0] ?? '',
            totalAmount: booking.totalAmount,
            platformFee: booking.platformFee,
            quoteAmount: booking.quotedAmount,
            quotes,
          });
        };
        const allMapped = sortedBookings.map(mapBooking);
        setAllBookings(allMapped);
        setUpcomingBookings(sortedBookings.filter(booking => booking.status !== 'completed' && booking.status !== 'cancelled' && booking.status !== 'declined' && !isBookingExpired(booking)).map(mapBooking));
        setCompletedBookings(sortedBookings.filter(booking => booking.status === 'completed').map(mapBooking));
        setCancelledBookings(sortedBookings.filter(booking => booking.status === 'cancelled' || booking.status === 'declined').map(mapBooking));
        setExpiredBookings(sortedBookings.filter(isBookingExpired).map(mapBooking));
        setIsLoading(false);
      }).catch(() => {
        if (!active) return;
        setAllBookings([]);
        setUpcomingBookings([]);
        setCompletedBookings([]);
        setCancelledBookings([]);
        setExpiredBookings([]);
        setIsLoading(false);
      });
      return () => { active = false; };
    }, [profile?.uid])
  );

  const filteredBookings = useMemo(() => {
    const matchesSearch = (booking: DisplayBooking) => {
      const query = searchQuery.trim().toLowerCase();
      return !query || [booking.title, booking.provider, booking.specialist, booking.date, booking.status, booking.location, booking.price]
        .some(value => value.toLowerCase().includes(query));
    };
    return {
      all: allBookings.filter(matchesSearch),
      upcoming: upcomingBookings.filter(matchesSearch),
      completed: completedBookings.filter(matchesSearch),
      cancelled: cancelledBookings.filter(matchesSearch),
      expired: expiredBookings.filter(matchesSearch),
    };
  }, [searchQuery, allBookings, upcomingBookings, completedBookings, cancelledBookings, expiredBookings]);

  const renderTabs = () => (
    <CustomTab
      tabs={[
        { key: 'all', label: strings.customerBookings.all, count: filteredBookings.all.length },
        { key: 'upcoming', label: strings.customerBookings.upcoming, count: filteredBookings.upcoming.length },
        { key: 'completed', label: strings.customerBookings.completed, count: filteredBookings.completed.length },
        { key: 'cancelled', label: strings.customerBookings.cancelled, count: filteredBookings.cancelled.length },
        { key: 'expired', label: strings.customerBookings.expired, count: filteredBookings.expired.length },
      ]}
      activeKey={activeTab}
      onChange={key => setActiveTab(key as TabKey)}
      containerStyle={styles.tabsScrollView}
    />
  );

  const renderFeed = () => {
    const data = activeTab === 'all'
      ? filteredBookings.all
      : activeTab === 'upcoming'
        ? filteredBookings.upcoming
        : activeTab === 'completed'
          ? filteredBookings.completed
          : activeTab === 'cancelled'
            ? filteredBookings.cancelled
            : filteredBookings.expired;

    const emptyTitle = activeTab === 'all'
      ? strings.customerBookings.noAll
      : activeTab === 'expired'
        ? strings.customerBookings.noExpired
        : activeTab === 'cancelled'
          ? strings.customerBookings.noCancelled
          : activeTab === 'completed'
            ? strings.customerBookings.noCompleted
            : strings.customerBookings.noUpcoming;

    const emptyMessage = activeTab === 'all'
      ? strings.customerBookings.allEmpty
      : activeTab === 'upcoming'
        ? strings.customerBookings.upcomingEmpty
        : activeTab === 'completed'
          ? strings.customerBookings.completedEmpty
          : activeTab === 'cancelled'
            ? strings.customerBookings.cancelledEmpty
            : strings.customerBookings.expiredEmpty;

    return (
      <View style={styles.feedContainer}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color={colors.purple[700]} />
          </View>
        ) : data.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            message={emptyMessage}
            icon="calendar-outline"
          />
        ) : (
          data.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(navigationStrings.CUSTOMER_BOOKING_DETAILS, { booking: item })}
            >
              {/* Top Row: Date & Status */}
              <View style={styles.cardTop}>
                <View style={styles.cardDateRow}>
                  <IconX
                    name={item.status === 'Completed' ? 'event-available' : 'event'}
                    origin={ICON_TYPE.MATERIAL_ICONS}
                    size={18}
                    color={item.status === 'Completed' ? colors.grey[700] : colors.purple[700]}
                  />
                  <Text style={styles.cardDateText}>
                    {item.date}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  item.status === 'Accepted' && styles.statusBadgeAccepted,
                  (item.status === 'Pending' || item.status === 'Quote pending' || item.status === 'Completion requested') && styles.statusBadgePending,
                  item.status === 'Completion requested' && styles.statusBadgeWrapping,
                  item.status === 'Completed' && styles.statusBadgeCompleted,
                  item.status === 'Cancelled' && styles.statusBadgeCancelled,
                  item.status === 'Expired' && styles.statusBadgeCancelled,
                ]}>
                  {item.status === 'Accepted' || item.status === 'Completed' ? (
                    <IconX
                      name="check-circle"
                      origin={ICON_TYPE.MATERIAL_ICONS}
                      size={14}
                      color="#059669"
                    />
                  ) : item.status === 'Cancelled' || item.status === 'Expired' ? (
                    <IconX
                      name="close-circle"
                      origin={ICON_TYPE.IONICONS}
                      size={14}
                      color="#DC2626"
                    />
                  ) : (
                    <IconX
                      name="schedule"
                      origin={ICON_TYPE.MATERIAL_ICONS}
                      size={14}
                      color="#D97706"
                    />
                  )}
                  <Text
                    style={[
                      styles.statusText,
                      item.status === 'Accepted' && styles.statusTextAccepted,
                      (item.status === 'Pending' || item.status === 'Quote pending' || item.status === 'Completion requested') && styles.statusTextPending,
                      item.status === 'Completion requested' && styles.statusTextWrapping,
                      item.status === 'Completed' && styles.statusTextCompleted,
                      item.status === 'Cancelled' && styles.statusTextCancelled,
                      item.status === 'Expired' && styles.statusTextCancelled,
                    ]}
                    numberOfLines={item.status === 'Completion requested' ? 2 : 1}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Main Content: Image & Info */}
              <View style={styles.cardMain}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.cardImage}
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardProvider} numberOfLines={1}>{item.provider}</Text>
                  <Text style={styles.cardSpecialist} numberOfLines={1}>{item.specialist}</Text>
                </View>
              </View>

              {/* Location & Price */}
              <View style={styles.cardLocationPrice}>
                <Text style={styles.priceText}>
                  {item.price}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.btnSecondary}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate(navigationStrings.CUSTOMER_BOOKING_DETAILS, { booking: item })}
                >
                  <Text style={styles.btnSecondaryText}>
                    {strings.customerBookings.viewDetails}
                  </Text>
                </TouchableOpacity>
                {item.status === 'Accepted' && (
                  <TouchableOpacity
                    style={styles.btnIconOnly}
                    activeOpacity={0.8}
                    onPress={() => Linking.openURL('tel:5550192834')}
                  >
                    <IconX
                      name="call"
                      origin={ICON_TYPE.MATERIAL_ICONS}
                      size={20}
                      color={colors.purple[700]}
                    />
                  </TouchableOpacity>
                )}
                {item.status === 'Completed' && (
                  ratedBookingIds.has(item.id) ? (
                    <TouchableOpacity
                      style={[styles.btnPrimary, styles.btnPrimaryDisabled]}
                      disabled={true}
                    >
                      <IconX
                        name="star"
                        origin={ICON_TYPE.MATERIAL_ICONS}
                        size={16}
                        color={colors.white[100]}
                      />
                      <Text style={[styles.btnPrimaryText, styles.btnPrimaryTextDisabled]}>
                        Already Rated
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.btnPrimary}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate(navigationStrings.CUSTOMER_REVIEW_BOOKING, { booking: item })}
                    >
                      <IconX
                        name="star"
                        origin={ICON_TYPE.MATERIAL_ICONS}
                        size={16}
                        color={colors.white[100]}
                      />
                      <Text style={styles.btnPrimaryText}>{strings.customerBookings.rateBooking}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <CustomSearchBar
          searchText={searchQuery}
          setSearchText={setSearchQuery}
          placeholder="Search your bookings..."
        />
        {renderTabs()}
        {renderFeed()}
      </ScrollView>
    </View>
  );
}