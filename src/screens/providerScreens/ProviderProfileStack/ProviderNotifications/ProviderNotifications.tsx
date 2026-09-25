import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors, strings } from '../../../../constants';
import { markNotificationRead, subscribeToNotifications } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';

type FilterType = 'All' | 'Bookings' | 'Promos' | 'System';

const FILTERS: FilterType[] = ['All', 'Bookings', 'Promos', 'System'];

type NotificationItem = {
  id: string;
  type: FilterType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  icon: string;
  iconColor: string;
  bgColor: string;
};

export default function ProviderNotifications({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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
    <View
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
      />
      <CustomHeader
        title={strings.notifications.title}
        showBackButton
        backgroundColor={colors.white[100]}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={[styles.contentContainer,
          // { paddingTop: insets.top }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Filters */}
        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {
            FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}
                >
                  {filter}
                </Text>
                {activeFilter === filter &&
                  <View
                    style={styles.filterDot}
                  />
                }
              </TouchableOpacity>
            )
            )
          }
        </ScrollView> */}

        {/* Notifications List */}
        <View
          style={styles.notificationsList}
        >
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={styles.notificationCard}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.iconContainer, { backgroundColor: notif.bgColor }]}
                >
                  <IconX
                    name={notif.icon}
                    origin={ICON_TYPE.MATERIAL_ICONS}
                    size={24}
                    color={notif.iconColor}
                  />
                </View>
                <View
                  style={styles.cardContent}
                >
                  <View
                    style={styles.cardHeader}
                  >
                    <Text
                      style={styles.cardTitle}
                      numberOfLines={1}
                    >
                      {notif.title}
                    </Text>
                    <View
                      style={styles.timeContainer}
                    >
                      {
                        notif.unread &&
                        <View
                          style={styles.unreadDot}
                        />
                      }
                      <Text
                        style={styles.timeText}
                      >
                        {notif.time}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={styles.cardMessage}
                    numberOfLines={2}
                  >
                    {notif.message}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View
              style={styles.emptyState}
            >
              <View
                style={styles.emptyIcon}
              >
                <IconX
                  name="notifications-off"
                  origin={ICON_TYPE.MATERIAL_ICONS}
                  size={24}
                  color={colors.grey[400]}
                />
              </View>
              <Text
                style={styles.emptyTitle}
              >
                {strings.notifications.noNotifications}
              </Text>
              <Text
                style={styles.emptyDesc}
              >
                You have no {activeFilter.toLowerCase()} notifications at the moment.
              </Text>
            </View>
          )}

          {/* Caught Up State */}
          {filteredNotifications.length
            > 0 && activeFilter === 'All' && (
              <View
                style={styles.emptyState}
              >
                <View
                  style={styles.emptyIcon}
                >
                  <IconX
                    name="mark-email-read"
                    origin={ICON_TYPE.MATERIAL_ICONS}
                    size={24}
                    color={colors.purple[700]}
                  />
                </View>
                <Text
                  style={styles.emptyTitle}
                >
                  {strings.notifications.caughtUp}
                </Text>
                <Text
                  style={styles.emptyDesc}
                >
                  {strings.notifications.caughtUpMessage}
                </Text>
              </View>
            )}
        </View>
      </ScrollView>
    </View>
  );
}