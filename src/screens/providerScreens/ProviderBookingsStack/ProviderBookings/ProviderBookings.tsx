import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomHeader, CustomSearchBar, CustomTab, ICON_TYPE, IconX } from '../../../../components';
import { colors, navigationStrings, strings } from '../../../../constants';
import { getBookings, updateBookingStatus } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { isBookingExpired, type BookingStatus as FirebaseBookingStatus } from '../../../../types/booking';
import { styles } from './styles';
import { showToast } from '../../../../utils';

type BookingStatus = 'Pending' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Expired';
type FilterTab = 'All' | 'Pending' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Expired';

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
}

const TABS: FilterTab[] = ['All', 'Pending', 'Upcoming', 'Completed', 'Cancelled', 'Expired'];

interface ProviderBookingsProps {
  navigation?: any;
}

export default function ProviderBookings({ navigation }: ProviderBookingsProps) {
  const profile = useAppSelector(state => state.user.profile);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (!profile?.uid) return;
      getBookings('providerId', profile.uid).then(items => {
        if (!active) return;
        setBookings(items.map(item => ({
          id: item.id,
          clientName: item.customerSnapshot.fullName,
          customerPhone: item.customerSnapshot.phone,
          serviceTitle: item.serviceSnapshot.title,
          serviceImageUrl: item.serviceSnapshot.imageUrls?.[0] ?? '',
          status: isBookingExpired(item) ? 'Expired' : item.status === 'accepted' || item.status === 'inProgress' ? 'Upcoming' : item.status === 'completed' ? 'Completed' : item.status === 'cancelled' || item.status === 'declined' ? 'Cancelled' : 'Pending',
          dateText: `${item.scheduledDate} • ${item.scheduledTime}`,
          address: item.addressSnapshot?.street ?? '',
          amount: `$${item.totalAmount.toFixed(2)}`,
          statusBgColor: isBookingExpired(item) ? '#FEF2F2' : item.status === 'pending' ? '#FFFBEB' : item.status === 'completed' ? '#ECFDF5' : item.status === 'cancelled' || item.status === 'declined' ? '#FEF2F2' : '#EFF6FF',
          statusTextColor: isBookingExpired(item) ? '#DC2626' : item.status === 'pending' ? '#B45309' : item.status === 'completed' ? '#047857' : item.status === 'cancelled' || item.status === 'declined' ? '#DC2626' : '#1D4ED8',
          dotColor: isBookingExpired(item) ? '#DC2626' : item.status === 'pending' ? '#D97706' : item.status === 'cancelled' || item.status === 'declined' ? '#DC2626' : '#2563EB',
          avatarUrl: '',
          notes: item.specialInstructions,
        })));
      }).catch(() => setBookings([]));
      return () => { active = false; };
    }, [profile?.uid])
  );

  const counts = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const upcoming = bookings.filter(b => b.status === 'Upcoming').length;
    const completed = bookings.filter(b => b.status === 'Completed').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
    const expired = bookings.filter(b => b.status === 'Expired').length;
    return { 
      All: total, 
      Pending: pending,
       Upcoming: upcoming, 
       Completed: completed, 
       Cancelled: cancelled,
       Expired: expired };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      console.log("Booking to filter:", booking)
      const matchesTab = activeTab === 'All' || booking.status === activeTab;
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
      console.error('[ProviderBookings] Failed to change booking status:', error);

      showToast({
        type: "error",
        title: 'error',
        message: 'Failed to change booking status. Please try again.'
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.searchSection}>
        <CustomSearchBar
          placeholder={strings.providerBookings?.searchPlaceholder ?? 'Search client name or service...'}
          searchText={searchQuery}
          setSearchText={setSearchQuery}
          containerStyles={styles.searchInputContainer}
        />
      </View>

      <CustomTab
        tabs={TABS.map(tab => ({
          key: tab,
          label: strings.providerBookings[`tab${tab}` as keyof typeof strings.providerBookings] ?? tab,
          count: counts[tab],
        }))}
        activeKey={activeTab}
        onChange={key => setActiveTab(key as FilterTab)}
        containerStyle={styles.tabsScrollView}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            Showing <Text style={styles.summaryHighlight}>{filteredBookings.length}</Text> bookings
          </Text>
        </View>

        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <IconX name="calendar-outline" origin={ICON_TYPE.IONICONS} size={32} color={colors.purple[600]} />
            </View>
            <Text style={styles.emptyTitle}>{strings.providerBookings?.noBookingsTitle ?? 'No Bookings Found'}</Text>
            <Text style={styles.emptySubtitle}>
              {strings.providerBookings?.noBookingsSub ?? 'You have no bookings under this category right now.'}
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
                      <Image source={{ uri: booking.serviceImageUrl }} style={styles.bookingAvatar} />
                      <View style={styles.bookingClientInfo}>
                        <Text style={styles.bookingClientName} numberOfLines={1}>
                          {booking.clientName}
                        </Text>
                        <Text style={styles.bookingServiceTitle} numberOfLines={1}>
                          {booking.serviceTitle}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: booking.statusBgColor }]}>
                      {isCompleted ? (
                        <IconX name="checkmark" origin={ICON_TYPE.IONICONS} size={12} color={booking.statusTextColor} />
                      ) : booking.dotColor ? (
                        <View style={[styles.statusDot, { backgroundColor: booking.dotColor }]} />
                      ) : null}
                      <Text style={[styles.statusBadgeText, { color: booking.statusTextColor }]}>
                        {booking.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsDivider} />

                  <View style={styles.detailsRow}>
                    <View style={styles.infoItem}>
                      <IconX name="time-outline" origin={ICON_TYPE.IONICONS} size={16} color={colors.purple[600]} />
                      <Text style={styles.infoText}>{booking.dateText}</Text>
                    </View>
                    {booking.address ? <View style={styles.infoItem}>
                      <IconX name="location-outline" origin={ICON_TYPE.IONICONS} size={16} color={colors.purple[600]} />
                      <Text style={styles.infoText} numberOfLines={1}>{booking.address}</Text>
                    </View> : null}
                    {booking.notes ? (
                      <View style={styles.infoItem}>
                        <IconX name="information-circle-outline" origin={ICON_TYPE.IONICONS} size={16} color={colors.grey[700]} />
                        <Text style={styles.infoText} numberOfLines={1}>{booking.notes}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.detailsDivider} />

                  <View style={styles.bookingCardFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceLabel}>Estimated Payment</Text>
                      <Text style={styles.priceValue}>{booking.amount}</Text>
                    </View>

                    <View style={styles.bookingActions}>
                      {booking.status === 'Pending' && (
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
                          <TouchableOpacity activeOpacity={0.7} onPress={() => changeStatus(booking.id, 'accepted')} style={styles.actionButtonPrimary}>
                            <Text style={styles.actionButtonPrimaryText}>
                              {strings.providerBookings?.accept ?? 'Accept'}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}

                      {booking.status === 'Upcoming' && (
                        <>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.iconActionButton}

                            // onPress={() => customerPhone && Linking.openURL(`tel:${customerPhone}`)}
                            onPress={() => Linking.openURL(`tel:${customerPhone}`)}

                          >
                            <IconX
                              name="call-outline"
                              origin={ICON_TYPE.IONICONS}
                              size={18}
                              color={colors.purple[700]}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity activeOpacity={0.7} style={styles.actionButtonPrimary} onPress={() => changeStatus(booking.id, 'completed')}>
                            <Text style={styles.actionButtonPrimaryText}>
                              {strings.providerBookings?.complete ?? 'Complete Job'}
                            </Text>
                          </TouchableOpacity>
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
                        <TouchableOpacity activeOpacity={0.7} style={styles.actionButtonOutline}>
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
