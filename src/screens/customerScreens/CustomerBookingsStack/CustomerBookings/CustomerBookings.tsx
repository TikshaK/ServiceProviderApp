import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Image,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CustomSearchBar, CustomTab, EmptyState, ICON_TYPE, IconX } from '../../../../components';
import { colors, navigationStrings, strings } from '../../../../constants';
import { getBookings, getReviewsByReviewerId } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { isBookingExpired } from '../../../../types/booking';
import { styles } from './styles';

type TabKey = 'upcoming' | 'completed' | 'cancelled' | 'expired';
type DisplayBooking = {
  id: string;
  providerId?: string;
  date: string;
  status: string;
  title: string;
  provider: string;
  specialist: string;
  location: string;
  price: string;
  image: string;
};

export default function CustomerBookings({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const profile = useAppSelector(state => state.user.profile);
  const [upcomingBookings, setUpcomingBookings] = useState<DisplayBooking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<DisplayBooking[]>([]);
  const [cancelledBookings, setCancelledBookings] = useState<DisplayBooking[]>([]);
  const [expiredBookings, setExpiredBookings] = useState<DisplayBooking[]>([]);
  const [ratedBookingIds, setRatedBookingIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      if (!profile?.uid) return;
      Promise.all([
        getBookings('customerId', profile.uid),
        getReviewsByReviewerId(profile.uid),
      ]).then(([bookings, reviews]) => {
        const sortedBookings = bookings.sort((a, b) => b.createdAt - a.createdAt);
        const ratedIds = new Set(reviews.map(review => review.bookingId));
        setRatedBookingIds(ratedIds);
        const mapBooking = (booking: any) => ({
          id: booking.id,
          providerId: booking.providerId,
          date: `${booking.scheduledDate} • ${booking.scheduledTime}`,
          status: isBookingExpired(booking) ? 'Expired' : booking.status === 'completed' ? 'Completed' : booking.status === 'accepted' || booking.status === 'inProgress' ? 'Accepted' : booking.status === 'cancelled' || booking.status === 'declined' ? 'Cancelled' : 'Pending',
          title: booking.serviceSnapshot.title,
          provider: booking.providerSnapshot.serviceName ?? booking.providerSnapshot.fullName,
          specialist: booking.providerSnapshot.fullName,
          location: booking.addressSnapshot.street,
          price: `$${booking.totalAmount}`,
          // price: `$${booking.totalAmount.toFixed(2)}`,
          image: booking.serviceSnapshot.imageUrls?.[0] ?? '',
        });
        setUpcomingBookings(sortedBookings.filter(booking => booking.status !== 'completed' && booking.status !== 'cancelled' && booking.status !== 'declined' && !isBookingExpired(booking)).map(mapBooking));
        setCompletedBookings(sortedBookings.filter(booking => booking.status === 'completed').map(mapBooking));
        setCancelledBookings(sortedBookings.filter(booking => booking.status === 'cancelled' || booking.status === 'declined').map(mapBooking));
        setExpiredBookings(sortedBookings.filter(isBookingExpired).map(mapBooking));
      }).catch(() => undefined);
      return () => {};
    }, [profile?.uid])
  );

  const matchesSearch = (booking: DisplayBooking) => {
    const query = searchQuery.trim().toLowerCase();
    return !query || [booking.title, booking.provider, booking.specialist, booking.date, booking.status, booking.location, booking.price]
      .some(value => value.toLowerCase().includes(query));
  };

  const filteredBookings = useMemo(() => ({
    upcoming: upcomingBookings.filter(matchesSearch),
    completed: completedBookings.filter(matchesSearch),
    cancelled: cancelledBookings.filter(matchesSearch),
    expired: expiredBookings.filter(matchesSearch),
  }), [searchQuery, upcomingBookings, completedBookings, cancelledBookings, expiredBookings]);

  const renderTabs = () => (
    <CustomTab
      tabs={[
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
    if (activeTab === 'upcoming' || activeTab === 'completed' || activeTab === 'expired') {
      const data = activeTab === 'upcoming' ? filteredBookings.upcoming : activeTab === 'completed' ? filteredBookings.completed : filteredBookings.expired;
      return (
        <View style={styles.feedContainer}>
          {data.length === 0
            ?
            <EmptyState
              title={activeTab === 'expired'
                ?
                strings.customerBookings.noExpired
                :
                strings.customerBookings.noUpcoming
              }
              message={
                activeTab === 'upcoming'
                  ?
                  strings.customerBookings.upcomingEmpty
                  :
                  activeTab === 'completed'
                    ?
                    strings.customerBookings.completedEmpty
                    :
                    strings.customerBookings.expiredEmpty
              }
              icon="calendar-outline"
            />
            :
            data.map((item) => {
              console.log('Rendering booking item:', item); // Debugging log 
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card} 
                  activeOpacity={1}
                  // onPress={() => navigation.navigate(navigationStrings.CUSTOMER_BOOKING_DETAILS, { booking: item }

                  // )
                  // }
                  >

                  {/* Top Row: Date & Status */}
                  <View style={styles.cardTop}>
                    <View style={styles.cardDateRow}>
                      <IconX
                        name={
                          activeTab === 'completed'
                            ?
                            'event-available'
                            :
                            'event'
                        }
                        origin={ICON_TYPE.MATERIAL_ICONS}
                        size={18}
                        color={
                          activeTab === 'completed'
                            ?
                            colors.grey[700]
                            :
                            colors.purple[700]
                        }
                      />
                      <Text style={styles.cardDateText}
                      >
                        {item.date}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      item.status === 'Accepted' && styles.statusBadgeAccepted,
                      item.status === 'Pending' && styles.statusBadgePending,
                      item.status === 'Completed' && styles.statusBadgeCompleted,
                      item.status === 'Cancelled' && styles.statusBadgeCancelled,
                      item.status === 'Expired' && styles.statusBadgeCancelled,
                    ]}>
                      {
                        item.status === 'Accepted' || item.status === 'Completed'
                          ?
                          (
                            <IconX
                              name="check-circle"
                              origin={ICON_TYPE.MATERIAL_ICONS}
                              size={14}
                              color="#059669"
                            />
                          ) : item.status === 'Cancelled' ? (
                            <IconX
                              name="close-circle"
                              origin={ICON_TYPE.MATERIAL_ICONS}
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
                      <Text style={[
                        styles.statusText,
                        item.status === 'Accepted' && styles.statusTextAccepted,
                        item.status === 'Pending' && styles.statusTextPending,
                        item.status === 'Completed' && styles.statusTextCompleted,
                        item.status === 'Cancelled' && styles.statusTextCancelled,
                        item.status === 'Expired' && styles.statusTextCancelled,
                      ]}>
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
                      <Text style={styles.cardTitle}
                        numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.cardProvider}
                        numberOfLines={1}>{item.provider}</Text>
                      <Text style={styles.cardSpecialist}
                        numberOfLines={1}>{item.specialist}</Text>
                    </View>
                  </View>

                  {/* Location & Price */}
                  <View style={styles.cardLocationPrice}
                  >

                    <Text style={styles.priceText}
                    >
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
                      <Text
                        style={styles.btnSecondaryText}
                      >
                        {strings.customerBookings.viewDetails}
                      </Text>
                    </TouchableOpacity>
                    {activeTab === 'upcoming' && item.status === 'Accepted' && (
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
                    {activeTab === 'completed' && (
                      ratedBookingIds.has(item.id) ? (
                        <TouchableOpacity
                          style={[styles.btnPrimary, styles.btnPrimaryDisabled]}
                          disabled={true}
                        >
                          <IconX
                            name="star"
                            origin={ICON_TYPE.MATERIAL_ICONS}
                            size={16} color={colors.white[100]}
                          />
                          <Text
                            style={[
                              styles.btnPrimaryText,
                              styles.btnPrimaryTextDisabled

                            ]}
                          >
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
                            size={16} color={colors.white[100]}
                          />
                          <Text style={styles.btnPrimaryText}>{strings.customerBookings.rateBooking}</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </TouchableOpacity>
              )
            }
            )}
        </View>
      );
    }

    if (activeTab === 'cancelled') {
      if (filteredBookings.cancelled.length > 0) {
        return <View
          style={styles.feedContainer}
        >
          {filteredBookings.cancelled.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(navigationStrings.CUSTOMER_BOOKING_DETAILS, { booking: item })}
            >
              <View style={styles.cardTop}
              >
                <View style={styles.cardDateRow}>
                  <IconX name="event"
                    origin={ICON_TYPE.MATERIAL_ICONS}
                    size={18}
                    color={colors.grey[700]}
                  />
                  <Text style={styles.cardDateText}
                  >
                    {item.date}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  styles.statusBadgeCancelled,
                ]}>
                  <Text style={[
                    styles.statusText,
                    styles.statusTextCancelled,
                  ]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <View
                style={styles.cardMain}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.cardImage}
                />
                <View
                  style={styles.cardInfo}
                >
                  <Text
                    style={styles.cardTitle}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={styles.cardProvider}
                    numberOfLines={1}
                  >
                    {item.provider}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}</View>;
      }
      return <EmptyState
        title={strings.customerBookings.noCancelled}
        message={strings.customerBookings.cancelledEmpty}
        icon="calendar-outline"
      />;
    }

    return null;
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