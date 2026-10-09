import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import {
  CustomSearchBar,
  EmptyState,
  ICON_TYPE,
  IconX,
} from '../../../../components';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  navigationStrings, strings
} from '../../../../constants';
import { getBookings, subscribeToAllOpenBookings } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { isBookingExpired, type OpenBookingListing } from '../../../../types/booking';
import { styles } from './styles';
import ProviderQuoteModal from '../../ProviderQuoteModal';

const OVERVIEW_STATS = [
  {
    id: 'pending',
    title: 'Pending',
    badgeText: 'New',
    badgeBgColor: '#FEF3C7',
    badgeTextColor: '#92400E',
    iconName: 'hourglass-outline',
    iconBgColor: '#FFFBEB',
    iconColor: '#D97706',
    countColor: '#D97706',
  },
  {
    id: 'upcoming',
    title: 'Upcoming',
    badgeText: 'Today',
    badgeBgColor: `${colors.purple[300]}80`,
    badgeTextColor: colors.purple[700],
    iconName: 'calendar-outline',
    iconBgColor: colors.purple[300],
    iconColor: colors.purple[700],
    countColor: colors.purple[700],
  },
  {
    id: 'completed',
    title: 'Completed',
    badgeText: 'Done',
    badgeBgColor: '#D1FAE5',
    badgeTextColor: '#065F46',
    iconName: 'checkmark-circle-outline',
    iconBgColor: '#ECFDF5',
    iconColor: '#059669',
    countColor: '#059669',
  }
] as const;

const QUICK_ACTIONS = [
  {
    id: 'add_service',
    title: '+ Add Service',
    iconName: 'build-outline',
    iconBgColor: colors.purple[100],
    iconColor: colors.purple[700],
  },
  {
    id: 'view_bookings',
    title: 'View Bookings',
    iconName: 'calendar-outline',
    iconBgColor: `${colors.purple[500]}1A`,
    iconColor: colors.purple[500],
  },
  {
    id: 'availability',
    title: 'Availability',
    iconName: 'time-outline',
    iconBgColor: colors.purple[200],
    iconColor: colors.grey[700],
  },
] as const;

const isScheduledToday = (scheduledDate: string, scheduledTime: string) => {
  const scheduledAt = new Date(`${scheduledDate} ${scheduledTime}`);
  const today = new Date();

  return Number.isFinite(scheduledAt.getTime())
    && scheduledAt.getFullYear() === today.getFullYear()
    && scheduledAt.getMonth() === today.getMonth()
    && scheduledAt.getDate() === today.getDate();
};

export default function ProviderHome({ navigation }: any) {
  const profile = useAppSelector(state => state.user.profile);
  const displayName = profile?.fullName?.trim() || 'Provider';
  const [openBookings, setOpenBookings] = useState<OpenBookingListing[]>([]);
  const homeOpenBookings = openBookings.slice(0, 10);
  const [quoteBooking, setQuoteBooking] = useState<OpenBookingListing | null>(null);
  const [overviewCounts, setOverviewCounts] = useState({ pending: 0, upcoming: 0, completed: 0, cancelled: 0, expired: 0 });

  useFocusEffect(useCallback(() => {
    let active = true;
    if (!profile?.uid) {
      console.warn('[PROVIDER_HOME] provider booking statistics skipped: profile UID is missing');
      setOverviewCounts({ pending: 0, upcoming: 0, completed: 0, cancelled: 0, expired: 0 });
    } else {
      getBookings('providerId', profile.uid).then(bookings => {
        if (!active) return;

        setOverviewCounts({
          pending: bookings.filter(booking => (booking.status === 'pending' || booking.status === 'quotePending') && !isBookingExpired(booking)).length,
          upcoming: bookings.filter(booking => (booking.status === 'accepted' || booking.status === 'inProgress' || booking.status === 'completionRequested') && isScheduledToday(booking.scheduledDate, booking.scheduledTime)).length,
          completed: bookings.filter(booking => booking.status === 'completed').length,
          cancelled: bookings.filter(booking => booking.status === 'cancelled' || booking.status === 'declined').length,
          expired: bookings.filter(booking => isBookingExpired(booking)).length,
        });
      }).catch(() => undefined);
    }

    const unsubscribeOpenBookings = subscribeToAllOpenBookings(bookings => {
      if (!active) return;
      console.log('[PROVIDER_HOME] open bookings updated', {
        count: bookings.length,
        bookingIds: bookings.slice(0, 10).map(booking => booking.id),
      });
      setOpenBookings(bookings);
    }, error => {
      console.error('[PROVIDER_HOME] open bookings subscription failed', error);
    });

    return () => {
      active = false;
      unsubscribeOpenBookings();
    };
  }, [profile?.uid]));

  const openBookingDetails = (booking: OpenBookingListing) => {
    navigation.navigate(navigationStrings.PROVIDER_BOOKING_DETAILS, {
      booking: {
        id: booking.id,
          clientName: booking.customerName,
          customerName: booking.customerName,
          avatarUrl: booking.customerAvatarUrl ?? '',
          serviceTitle: `${booking.category} service`,
          category: booking.category,
          status: 'Pending',
          dateText: `${booking.scheduledDate} • ${booking.scheduledTime}`,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          address: booking.city,
          city: booking.city,
          amount: 'Awaiting quote',
          notes: booking.specialInstructions,
          isOpenBooking: true,
        },
    });
  };

  return (
    <View
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingSection}
        >
          <View style={styles.greetingTextWrap}
          >
            <View style={styles.greetingRow}
            >
              <Text style={styles.greetingTitle}
              >
                Hello, {displayName}
              </Text>
              <IconX
                name="hand-wave"
                origin={ICON_TYPE.MATERIAL_COMMUNITY}
                size={24}
                color={colors.yellow[400]}
              />
            </View>
            <Text style={styles.greetingSubtext}
            >
              {strings.home.greetingSub}
            </Text>
          </View>
          <Pressable
            style={styles.availabilityBadge}
            onPress={() => {
              navigation.navigate(navigationStrings.PROVIDER_PROFILE_STACK,
                {
                  screen: navigationStrings.PROVIDER_PROFILE,
                });
            }}
          >
            <View style={styles.availabilityDot}
            />
            <Text style={styles.availabilityText}
            >
              {strings.home.availableNow}
            </Text>
          </Pressable>
        </View>

        <View style={styles.searchSection}>
          <CustomSearchBar
            placeholder="Search bookings"
            searchText=""
            setSearchText={() => undefined}
            onPress={() => navigation.navigate(navigationStrings.PROVIDER_SEARCH_BOOKINGS)}
            containerStyles={styles.searchContainer}
          />
        </View>

        <View
          style={styles.section}
        >
          <Text
            style={styles.sectionTitle}
          >
            {strings.home.todaysOverview}
          </Text>
          <View
            style={styles.overviewGrid}
          >
            {OVERVIEW_STATS.map(stat => (
              <Pressable
                key={stat.id}
                style={styles.overviewCard}
              >
                <View
                  style={styles.overviewCardTop}
                >
                  <View
                    style={[styles.overviewIconWrap, { backgroundColor: stat.iconBgColor }]}
                  >
                    <IconX
                      name={stat.iconName}
                      origin={ICON_TYPE.IONICONS}
                      size={18} color={stat.iconColor}
                    />
                  </View>
                  <View
                    style={[styles.overviewBadge, { backgroundColor: stat.badgeBgColor }]}
                  >
                    <Text
                      style={[styles.overviewBadgeText, { color: stat.badgeTextColor }]}
                    >
                      {stat.badgeText}
                    </Text>
                  </View>
                </View>
                <View
                  style={styles.overviewCardBottom}
                >
                  <Text
                    style={[styles.overviewCount, { color: stat.countColor }]}
                  >
                    {overviewCounts[stat.id as keyof typeof overviewCounts]}
                  </Text>
                  <Text
                    style={styles.overviewTitle}
                    numberOfLines={1}
                  >
                    {stat.title}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View
          style={styles.sectionLg}
        >
          <Text
            style={styles.sectionTitle}
          >
            {strings.home.quickActions}
          </Text>
          <View
            style={styles.quickActionsGrid}
          >
            {QUICK_ACTIONS.map(action => (
              <Pressable
                key={action.id}
                style={styles.quickActionCard}

                onPress={() => {
                  if (action.id === 'add_service') {
                    navigation.navigate(navigationStrings.PROVIDER_SERVICES_STACK, {
                      screen: navigationStrings.ADD_EDIT_SERVICES,
                    });
                  } else if (action.id === 'view_bookings') {
                    navigation.navigate(navigationStrings.PROVIDER_BOOKINGS_STACK, {
                      screen: navigationStrings.PROVIDER_BOOKINGS,
                    })

                  } else {
                    navigation.navigate(navigationStrings.PROVIDER_PROFILE_STACK, {
                      screen: navigationStrings.PROVIDER_PROFILE,
                    })
                  }
                }}

              >
                <View
                  style={[styles.quickActionIconWrap, { backgroundColor: action.iconBgColor }]}
                >
                  <IconX
                    name={action.iconName}
                    origin={ICON_TYPE.IONICONS}
                    size={22}
                    color={action.iconColor}
                  />
                </View>
                <Text
                  style={styles.quickActionLabel}
                  numberOfLines={2}
                >
                  {action.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View
          style={styles.sectionLg}
        >
          <View
            style={styles.sectionHeaderRow}
          >
            <View
              style={styles.sectionHeaderLeft}
            >
              <Text
                style={styles.sectionTitleInline}
              >
                Open Bookings
              </Text>

            </View>
          </View>

          <View
            style={styles.bookingList}
          >
            {homeOpenBookings.length === 0 ? (
              <EmptyState
                title="No open requests"
                message="New open customer bookings will appear here."
                icon="briefcase-outline"
              />
            ) : homeOpenBookings.map(booking => (
              <Pressable
                key={booking.id}
                style={[styles.bookingCard, styles.openBookingCard]}
                onPress={() => openBookingDetails(booking)}
                accessibilityRole="button"
                accessibilityHint="Opens booking details"
              >
                <View
                  style={styles.bookingCardHeader}
                >
                  <View
                    style={styles.bookingClient}
                  >
                    <View style={styles.bookingAvatar}>
                      {booking.customerAvatarUrl ? (
                        <Image source={{ uri: booking.customerAvatarUrl }} style={styles.bookingAvatarImage} />
                      ) : (
                        <Text style={styles.openBookingInitial}>{booking.customerName.charAt(0)}</Text>
                      )}
                    </View>
                    <View
                      style={styles.bookingClientInfo}
                    >
                      <Text
                        style={styles.bookingClientName}
                        numberOfLines={1}
                      >
                        {booking.customerName}
                      </Text>
                      <Text
                        style={styles.bookingServiceTitle}
                        numberOfLines={1}
                      >
                        {booking.category} service
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, styles.openBookingBadge]}>
                    <View style={[styles.statusDot, styles.openBookingDot]} />
                    <Text style={[styles.statusBadgeText, styles.openBookingStatus]}>Open</Text>
                  </View>
                </View>

                <Text style={styles.openBookingLocation}>{booking.city}</Text>
                {booking.specialInstructions ? <Text style={styles.openBookingNotes} numberOfLines={2}>{booking.specialInstructions}</Text> : null}

                <View
                  style={styles.bookingCardFooter}
                >
                  <View
                    style={styles.bookingTimeRow}
                  >
                    <IconX
                      name="time-outline"
                      origin={ICON_TYPE.IONICONS}
                      size={16}
                      color="#D97706"
                    />
                    <Text
                      style={styles.bookingTimeText}
                      adjustsFontSizeToFit
                    >
                      {booking.scheduledDate} • {booking.scheduledTime}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.openBookingQuoteButton}
                    activeOpacity={0.8}
                    onPress={event => {
                      event.stopPropagation();
                      setQuoteBooking(booking);
                    }}
                  >
                    <Text
                      style={styles.openBookingQuoteButtonText}
                    >
                      Send quote</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView >
      <ProviderQuoteModal
        booking={quoteBooking}
        onClose={() => setQuoteBooking(null)}
        onQuoteSent={bookingId => setOpenBookings(current => current.filter(item => item.id !== bookingId))}
      />
    </View >
  );
}
