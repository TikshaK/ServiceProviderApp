import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  EmptyState, ICON_TYPE, IconX
} from '../../../../components';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  navigationStrings, strings
} from '../../../../constants';
import { getBookings } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { isBookingExpired } from '../../../../types/booking';
import { styles } from './styles';

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
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [overviewCounts, setOverviewCounts] = useState({ pending: 0, upcoming: 0, completed: 0, cancelled: 0, expired: 0 });

  useFocusEffect(useCallback(() => {
    if (!profile?.uid) {
      setRecentBookings([]);
      setOverviewCounts({ pending: 0, upcoming: 0, completed: 0, cancelled: 0, expired: 0 });
      return;
    }

    let active = true;
    getBookings('providerId', profile.uid).then(bookings => {
      if (!active) return;

      setOverviewCounts({
        pending: bookings.filter(booking => booking.status === 'pending' && !isBookingExpired(booking)).length,
        upcoming: bookings.filter(booking => (booking.status === 'accepted' || booking.status === 'inProgress') && isScheduledToday(booking.scheduledDate, booking.scheduledTime)).length,
        completed: bookings.filter(booking => booking.status === 'completed').length,
        cancelled: bookings.filter(booking => booking.status === 'cancelled' || booking.status === 'declined').length,
        expired: bookings.filter(booking => isBookingExpired(booking)).length,
      });

      const mappedBookings = bookings
        .sort((first, second) => second.createdAt - first.createdAt)
        .slice(0, 10)
        .map(booking => {
          const expired = isBookingExpired(booking);
          const status = expired
            ? 'Expired'
            : booking.status === 'accepted' || booking.status === 'inProgress'
              ? 'Upcoming'
              : booking.status === 'completed'
                ? 'Completed'
              : booking.status === 'cancelled' || booking.status === 'declined'
                ? 'Cancelled'
                : 'Pending';
          const isCompleted = status === 'Completed';
          const isCancelled = status === 'Cancelled' || status === 'Expired';

          return {
            id: booking.id,
            clientName: booking.customerSnapshot.fullName,
            serviceTitle: booking.serviceSnapshot.title,
            status,
            statusBgColor: isCompleted ? '#ECFDF5' : isCancelled ? '#FEF2F2' : status === 'Pending' ? '#FFFBEB' : '#EFF6FF',
            statusTextColor: isCompleted ? '#047857' : isCancelled ? '#DC2626' : status === 'Pending' ? '#B45309' : '#1D4ED8',
            dotColor: isCompleted ? undefined : isCancelled ? '#DC2626' : status === 'Pending' ? '#D97706' : '#2563EB',
            timeText: `${booking.scheduledDate} • ${booking.scheduledTime}`,
            avatarUrl: booking.serviceSnapshot.imageUrls?.[0] ?? '',
            priceTag: isCompleted ? `$${booking.totalAmount} Paid` : undefined,
          };
        });

      setRecentBookings(mappedBookings);
    }).catch(() => undefined);

    return () => { active = false; };
  }, [profile?.uid]));

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
                {strings.home.recentBookings}
              </Text>

            </View>
          </View>

          <View
            style={styles.bookingList}
          >
            <FlatList
              data={recentBookings}
              keyExtractor={booking => booking.id}
              scrollEnabled={false}
              contentContainerStyle={styles.bookingList}
              ListEmptyComponent={() => (
                <EmptyState
                  title={strings.providerBookings.noBookingsTitle}
                  message={strings.home.noBookingsSub}
                  icon="briefcase-outline"
                />
              )}
              renderItem={({ item: booking }) => {
                const isCompleted = booking.status === 'Completed';
                const timeIconColor =
                  booking.status === 'Completed'
                    ? colors.green[350]
                    : booking.status === 'Pending'
                      ? '#D97706'
                      : colors.purple[700];

                return (
                  <View
                    key={booking.id}
                    style={[styles.bookingCard, isCompleted && styles.bookingCardCompleted]}
                  >
                    <View
                      style={styles.bookingCardHeader}
                    >
                      <View
                        style={styles.bookingClient}
                      >
                        <Image
                          source={{ uri: booking.avatarUrl }}
                          style={styles.bookingAvatar}
                        />
                        <View
                          style={styles.bookingClientInfo}
                        >
                          <Text
                            style={styles.bookingClientName}
                            numberOfLines={1}
                          >
                            {booking.clientName}
                          </Text>
                          <Text
                            style={styles.bookingServiceTitle}
                            numberOfLines={1}
                          >
                            {booking.serviceTitle}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[styles.statusBadge, { backgroundColor: booking.statusBgColor }]}
                      >
                        {isCompleted ? (
                          <IconX
                            name="checkmark"
                            origin={ICON_TYPE.IONICONS}
                            size={12}
                            color={booking.statusTextColor}
                          />
                        ) : (
                          'dotColor' in booking && booking.dotColor ? (
                            <View
                              style={[styles.statusDot, { backgroundColor: booking.dotColor }]}
                            />
                          ) : null
                        )}
                        <Text
                          style={[styles.statusBadgeText, { color: booking.statusTextColor }]}
                        >
                          {booking.status}
                        </Text>
                      </View>
                    </View>

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
                          color={timeIconColor}
                        />
                        <Text
                          style={[
                            styles.bookingTimeText,
                            isCompleted && styles.bookingTimeTextMuted
                          ]}
                          adjustsFontSizeToFit
                        >
                          {booking.timeText}
                        </Text>
                      </View>

                      {'priceTag' in booking && booking.priceTag ? (
                        <View
                          style={styles.priceTag}
                        >
                          <Text
                            style={styles.priceTagText}
                          >
                            {booking.priceTag}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={styles.bookingActions}
                        >
                          {'showCallAction' in booking && booking.showCallAction && (
                            <TouchableOpacity
                              accessibilityLabel={`Call ${booking.clientName}`}
                              activeOpacity={0.7}
                              style={styles.bookingActionButton}>
                              <IconX
                                name="call-outline"
                                origin={ICON_TYPE.IONICONS}
                                size={18}
                                color={colors.black[250]}
                              />
                            </TouchableOpacity>
                          )}
                          {'showDetailAction' in booking && booking.showDetailAction && (
                            <TouchableOpacity
                              accessibilityLabel="Booking Details"
                              activeOpacity={0.7}
                              style={styles.bookingActionButtonPrimary}
                            >
                              <IconX name="arrow-forward"
                                origin={ICON_TYPE.IONICONS}
                                size={18}
                                color={colors.purple[700]}
                              />
                            </TouchableOpacity>
                          )}

                        </View>
                      )}
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </ScrollView >
    </View >
  );
}
