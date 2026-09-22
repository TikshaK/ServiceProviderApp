import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ICON_TYPE, IconX } from '../../../../components';
import { colors, strings } from '../../../../constants';
import { markNotificationRead, subscribeToNotifications } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';

type FilterType = 'All' | 'Bookings' | 'Promos' | 'System';

const FILTERS: FilterType[] = ['All', 'Bookings', 'Promos', 'System'];

const NOTIFICATIONS_DATA = [
  {
    id: '1',
    type: 'Bookings',
    title: 'Booking Confirmed by Provider',
    message: 'John Reynolds accepted your Deep Home Cleaning booking for Friday, Oct 25 at 10:00 AM.',
    time: '15m ago',
    unread: true,
    icon: 'event-available',
    iconColor: colors.purple[700],
    bgColor: colors.grey[100],
  },
  {
    id: '2',
    type: 'Bookings',
    title: 'Appointment Reminder',
    message: 'Reminder: AC Filter & Diagnostic service is scheduled for tomorrow at 2:30 PM.',
    time: '2h ago',
    unread: true,
    icon: 'schedule',
    iconColor: '#D97706',
    bgColor: '#FFFBEB',
  },
  {
    id: '3',
    type: 'System',
    title: 'Service Completed – Rate Your Experience',
    message: 'Electrical Socket Repair by Marcus Vance is complete. Please leave a quick review.',
    time: '1d ago',
    unread: false,
    icon: 'star-half',
    iconColor: '#EA580C',
    bgColor: '#FFF7ED',
  },
  {
    id: '4',
    type: 'Bookings',
    title: 'Booking Request Sent',
    message: 'Your request for Plumbing Leak Repair has been delivered to QuickPipe Plumbers.',
    time: '2d ago',
    unread: false,
    icon: 'send',
    iconColor: colors.purple[700],
    bgColor: colors.grey[100],
  },
  {
    id: '5',
    type: 'Promos',
    title: 'Weekend Special: 20% Off Deep Cleans',
    message: 'Use promo code during checkout this weekend.',
    time: '4d ago',
    unread: false,
    icon: 'percent',
    iconColor: '#059669',
    bgColor: '#ECFDF5',
  }
];

export default function CustomerNotifications() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [notifications, setNotifications] = useState<typeof NOTIFICATIONS_DATA>([]);
  const profile = useAppSelector(state => state.user.profile);

  useEffect(() => {
    if (!profile?.uid) return;
    setNotifications([]);
    return subscribeToNotifications(profile.uid, items => setNotifications(items.map(item => ({ id: item.id, type: 'Bookings', title: item.title, message: item.body, time: new Date(item.createdAt).toLocaleString(), unread: !item.isRead, icon: 'notifications', iconColor: colors.purple[700], bgColor: colors.grey[100] }))));
  }, [profile?.uid]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    if (profile?.uid) {
      notifications.filter(n => n.unread && 'isRead' in n).forEach(n => markNotificationRead(profile.uid, n.id));
    }
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const filteredNotifications = notifications.filter(
    n => activeFilter === 'All' || n.type === activeFilter
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView
        contentContainerStyle={[styles.contentContainer, 
          // { paddingTop: insets.top }
        ]}
        showsVerticalScrollIndicator={false}
      >
       

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
              {activeFilter === filter && <View style={styles.filterDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <TouchableOpacity key={notif.id} style={styles.notificationCard} activeOpacity={0.8}>
                <View style={[styles.iconContainer, { backgroundColor: notif.bgColor }]}>
                  <IconX name={notif.icon} origin={ICON_TYPE.MATERIAL_ICONS} size={24} color={notif.iconColor} />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{notif.title}</Text>
                    <View style={styles.timeContainer}>
                      {notif.unread && <View style={styles.unreadDot} />}
                      <Text style={styles.timeText}>{notif.time}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardMessage} numberOfLines={2}>{notif.message}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <IconX name="notifications-off" origin={ICON_TYPE.MATERIAL_ICONS} size={24} color={colors.grey[400]} />
              </View>
              <Text style={styles.emptyTitle}>{strings.notifications.noNotifications}</Text>
              <Text style={styles.emptyDesc}>You have no {activeFilter.toLowerCase()} notifications at the moment.</Text>
            </View>
          )}

          {/* Caught Up State */}
          {filteredNotifications.length > 0 && activeFilter === 'All' && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <IconX name="mark-email-read" origin={ICON_TYPE.MATERIAL_ICONS} size={24} color={colors.purple[700]} />
              </View>
              <Text style={styles.emptyTitle}>{strings.notifications.caughtUp}</Text>
              <Text style={styles.emptyDesc}>{strings.notifications.caughtUpMessage}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}