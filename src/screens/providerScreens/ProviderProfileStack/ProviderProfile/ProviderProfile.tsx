import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ConfirmModal, ICON_TYPE, IconX } from '../../../../components';
import { colors, images, navigationStrings, strings } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { setUserProfile, useAppDispatch, useAppSelector } from '../../../../store';
import { getReviews, updateUserProfile, getBookings, deleteAccount } from '../../../../services/firebase';
import { showToast } from '../../../../utils';
import { styles } from './styles';

export default function ProviderProfile({ navigation }: { navigation: any }) {
  const { signOut } = useAuth();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(state => state.user.profile);
  const [isOnline, setIsOnline] = useState(profile?.availability !== 'offlineToday');
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [modal, setModal] = useState<'logout' | 'delete' | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const authEmail = useAppSelector(state => state.auth.email);

  useEffect(() => {
    setIsOnline(profile?.availability !== 'offlineToday');
  }, [profile?.availability]);

  useFocusEffect(
    useCallback(() => {
      if (!profile?.uid) {
        setAverageRating(0);
        setReviewCount(0);
        setTotalEarnings(0);
        return;
      }

      Promise.all([getReviews(profile.uid), getBookings('providerId', profile.uid, 'completed')]).then(([reviews, completedBookings]) => {
        setReviewCount(reviews.length);
        setAverageRating(reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0);
        setTotalEarnings(completedBookings.reduce((total, booking) => total + booking.totalAmount, 0));
      }).catch(() => {
        setAverageRating(0);
        setReviewCount(0);
        setTotalEarnings(0);
      });
    }, [profile?.uid])
  );

  const toggleAvailability = async () => {
    if (!profile || availabilitySaving) return;

    const nextIsOnline = !isOnline;
    setIsOnline(nextIsOnline);
    setAvailabilitySaving(true);
    try {
      const updatedProfile = await updateUserProfile({
        ...profile,
        availability: nextIsOnline ? 'available' : 'offlineToday',
      });
      dispatch(setUserProfile(updatedProfile));
    } catch {
      setIsOnline(!nextIsOnline);
      showToast({ type: 'error', title: 'Unable to update availability', message: 'Please try again.' });
    } finally {
      setAvailabilitySaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGradientBg} />
          <View style={styles.heroContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGradient}>
                <Image
                  source={
                    profile?.avatarUrl ?
                      {
                        uri: profile?.avatarUrl
                      } :
                      images.profilePlaceHolder
                  }
                  style={styles.avatarImage}
                />
              </View>
              {isOnline && <View style={styles.onlineDot} />}
              {/* <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                <IconX name="camera" origin={ICON_TYPE.IONICONS} size={14} color={colors.white[100]} />
              </TouchableOpacity> */}
              <View style={styles.cameraButton}>
                <IconX name="verified" origin={ICON_TYPE.MATERIAL_ICONS} size={13} color={colors.white[100]} />
              </View>
            </View>
            <View style={styles.heroTextContainer}>

              <Text style={styles.providerName}>{profile?.fullName ?? strings.providerProfile.providerFallbackName}</Text>
              <Text style={styles.businessName}>{profile?.serviceName ?? strings.providerProfile.businessFallbackName}</Text>

              <View style={styles.statusBadge}>
                {isOnline && <View style={styles.statusDot} />}
                <Text
                  style={[styles.statusText, !isOnline && { color: colors.grey[700] }]}>
                  {isOnline ? strings.providerProfile.onlineActive : strings.providerProfile.offline}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Daily Availability Card */}
        <View style={styles.availabilityCard}>
          <View style={styles.availabilityHeader}>
            <View style={styles.availabilityHeaderLeft}>
              <View style={[styles.availabilityIconBg, !isOnline && { backgroundColor: colors.grey[100] }]}>
                <IconX
                  name={isOnline ? "radio-button-on" : "power"}
                  origin={ICON_TYPE.IONICONS}
                  size={16}
                  color={isOnline ? colors.green[700] : colors.grey[700]}
                />
              </View>
              <View>
                <Text style={styles.availabilityTitle}>{strings.providerProfile.todaysAvailability}</Text>
                <Text style={styles.availabilitySub}>{strings.providerProfile.availabilitySub}</Text>
              </View>
            </View>
            <View style={[styles.availabilityStatusLabel, !isOnline && styles.availabilityStatusLabelOffline]}>
              {isOnline && <View style={styles.statusDot} />}
              <Text style={[styles.availabilityStatusText, !isOnline && styles.availabilityStatusTextOffline]}>
                {isOnline ? strings.providerProfile.onlineAvailable : strings.providerProfile.offlineToday}
              </Text>
            </View>
          </View>
          <Text style={styles.availabilityDesc}>
            {strings.profile.providerAvailabilityDescription}
          </Text>
          <TouchableOpacity
            style={styles.offlineBtn}
            activeOpacity={0.8}
            disabled={availabilitySaving}
            onPress={toggleAvailability}
          >
            <IconX
              name={isOnline ? "power" : "play-circle"}
              origin={ICON_TYPE.IONICONS}
              size={18}
              color={isOnline ? colors.grey[700] : colors.green[700]}
            />
            <Text style={styles.offlineBtnText}>
              {isOnline ? strings.providerProfile.goOfflineToday : strings.providerProfile.resumeAvailability}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Performance & Insights */}
        <TouchableOpacity
          style={styles.insightsCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(navigationStrings.PROVIDER_EARNINGS_REVIEWS)}
        >
          <View style={styles.insightsHeader}>
            <Text style={styles.insightsTitle}>
              {strings.providerProfile.performanceInsights}</Text>
            <Text style={styles.insightsLink}>
              {strings.providerProfile.viewEarningsReviews}</Text>
          </View>
          <View style={styles.insightsGrid}>
            <View style={styles.insightBox}>
              <View style={styles.insightBoxHeader}>
                <IconX name="cash-outline"
                  origin={ICON_TYPE.IONICONS} size={14} color={colors.purple[700]} />
                <Text style={styles.insightBoxTitle}>
                  {strings.providerProfile.earnings}
                </Text>
              </View>
              <Text style={styles.insightValue}>${totalEarnings}</Text>

            </View>
            <View style={styles.insightBox}>
              <View style={styles.insightBoxHeader}>
                <IconX name="star" origin={ICON_TYPE.IONICONS} size={14} color="#3130c0" />
                <Text style={styles.insightBoxTitle}>{strings.providerProfile.rating}</Text>
              </View>
              <Text style={styles.insightValue}>{averageRating} ★</Text>
              {/* <Text style={styles.insightValue}>{averageRating.toFixed(1)} ★</Text> */}
              <View style={styles.insightSub}>
                <Text style={styles.insightSubTextGrey}>({reviewCount} reviews)</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Profile Information */}
        <View style={styles.profileInfoCard}>
          <View style={styles.profileInfoHeader}>
            <Text style={styles.profileInfoTitle}>{strings.providerProfile.profileInformation}</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate(navigationStrings.PROVIDER_EDIT_PROFILE)}>
              <Text style={styles.editBtnText}>{strings.common.edit}</Text>
              <IconX name="edit" origin={ICON_TYPE.MATERIAL_ICONS} size={15} color={colors.purple[700]} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBg}>
                <IconX name="call" origin={ICON_TYPE.IONICONS} size={16} color={colors.purple[700]} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{strings.common.phone}</Text>
                <Text style={styles.infoValue}>{profile?.phone}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBg}>
                <IconX name="mail" origin={ICON_TYPE.IONICONS} size={16} color={colors.purple[700]} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{strings.common.email}</Text>
                <Text style={styles.infoValue}>{authEmail}</Text>
              </View>
            </View>
          </View>

        </View>

        {/* Manage Business */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{strings.providerProfile.manageBusiness}</Text>
          <View style={styles.actionCard}>
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(navigationStrings.PROVIDER_EARNINGS_REVIEWS)}>
              <View style={styles.actionRowContent}>
                <View style={styles.actionIconBg}>
                  <IconX name="stats-chart" origin={ICON_TYPE.IONICONS} size={18} color={colors.purple[700]} />
                </View>
                <Text style={styles.actionText}>{strings.providerProfile.earningsReviews}</Text>
              </View>
              <IconX
                name="chevron-forward"
                origin={ICON_TYPE.IONICONS}
                size={20}
                color={colors.grey[700]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(navigationStrings.PROVIDER_NOTIFICATIONS)}>
              <View style={styles.actionRowContent}>
                <View style={styles.actionIconBg}>
                  <IconX
                    name="notifications"
                    origin={ICON_TYPE.IONICONS}
                    size={18}
                    color={colors.purple[700]}
                  />
                </View>
                <Text
                  style={styles.actionText}
                >{strings.notifications.title}
                </Text>
              </View>
              <IconX
                name="chevron-forward"
                origin={ICON_TYPE.IONICONS}
                size={20}
                color={colors.grey[700]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings & Support */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{strings.providerProfile.settingsSupport}</Text>
          <View style={styles.actionCard}>
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionRowContent}>
                <View style={styles.actionIconBg}>
                  <IconX name="help-circle" origin={ICON_TYPE.IONICONS} size={18} color={colors.grey[700]} />
                </View>
                <Text style={styles.actionText}>{strings.common.helpSupport}</Text>
              </View>
              <IconX name="chevron-forward" origin={ICON_TYPE.IONICONS} size={20} color={colors.grey[700]} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.grey[100] }} />

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionRowContent}>
                <View style={styles.actionIconBg}>
                  <IconX name="document-text" origin={ICON_TYPE.IONICONS} size={18} color={colors.grey[700]} />
                </View>
                <Text style={styles.actionText}>{strings.common.terms}</Text>
              </View>
              <IconX name="chevron-forward" origin={ICON_TYPE.IONICONS} size={20} color={colors.grey[700]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={() => setModal('logout')}>
            <IconX name="log-out-outline" origin={ICON_TYPE.IONICONS} size={20} color="#BA1A1A" />
            <Text style={styles.logoutBtnText}>{strings.common.logOut}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8} onPress={() => setModal('delete')}>
            <IconX name="trash-outline" origin={ICON_TYPE.IONICONS} size={16} color="#BA1A1A" />
            <Text style={styles.deleteBtnText}>{strings.common.deleteAccount}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      <ConfirmModal
        visible={modal !== null}
        title={modal === 'logout' ? strings.common.logOutTitle : strings.common.deleteAccountTitle}
        message={modal === 'logout' ? strings.common.logOutMessage : strings.providerProfile.deleteAccountMessage}
        confirmText={modal === 'logout' ? strings.common.logOut : strings.providerProfile.deleteConfirm}
        cancelText={strings.common.keepAccount}
        destructive
        onCancel={() => setModal(null)}
        onConfirm={async () => {
          setModal(null);
          if (modal === 'logout') await signOut();
          else if (modal === 'delete') { try { await deleteAccount(profile?.uid ?? ''); await signOut(); } catch {} }
        }}
      />
    </View>
  );
}