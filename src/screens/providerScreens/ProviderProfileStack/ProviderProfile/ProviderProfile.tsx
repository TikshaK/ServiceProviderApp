import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ConfirmModal, ICON_TYPE, IconX } from '../../../../components';
import { colors, navigationStrings, strings } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';

export default function ProviderProfile({ navigation }: { navigation: any }) {
  const { signOut } = useAuth();
  const profile = useAppSelector(state => state.user.profile);
  const [isOnline, setIsOnline] = useState(true);
  const [modal, setModal] = useState<'logout' | 'delete' | null>(null);
  const authEmail = useAppSelector(state => state.auth.email);

  const toggleAvailability = () => {
    setIsOnline(!isOnline);
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
                  source={{ uri: profile?.avatarUrl ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuADWqpyYu1OBHC99eyXyCJJr0AYCCth0kBsFfT3K5xChwf8lWHn_fqD4cdJwE9DcB67E56Y1HGEHWJdqE2IYyBvLiYqBSlgaBQ7VklZNyrJlIwp5zgjNlJ4BE8w6P7M4iUJxaeF3Rgmm_hIJoLsmzWaw7dzS3OQVyyad1bsonA4j90RLzFBUj6LKm1pcnZmgL8H6j_tjFo4wSKnvqgznsw8fVH_QiNkafF4nXZPw3TvWOE_htv-4kKgPg' }}
                  style={styles.avatarImage}
                />
              </View>
              {isOnline && <View style={styles.onlineDot} />}
              <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                <IconX name="camera" origin={ICON_TYPE.IONICONS} size={14} color={colors.white[100]} />
              </TouchableOpacity>
            </View>
            <View style={styles.heroTextContainer}>
              <View style={styles.verifiedBadge}>
                <IconX name="checkmark-circle" origin={ICON_TYPE.IONICONS} size={12} color={colors.purple[700]} />
                <Text style={styles.verifiedText}>{strings.providerProfile.verifiedProvider}</Text>
              </View>
              <Text style={styles.providerName}>{profile?.fullName ?? strings.providerProfile.providerFallbackName}</Text>
              <Text style={styles.businessName}>{profile?.serviceName ?? strings.providerProfile.businessFallbackName}</Text>

              <View style={styles.statusBadge}>
                {isOnline && <View style={styles.statusDot} />}
                <Text style={[styles.statusText, !isOnline && { color: colors.grey[700] }]}>
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
          onPress={() => navigation.navigate(navigationStrings.PROVIDER_EARNINGS_REVIEWS)}>
          <View style={styles.insightsHeader}>
            <Text style={styles.insightsTitle}>{strings.providerProfile.performanceInsights}</Text>
            <Text style={styles.insightsLink}>{strings.providerProfile.viewEarningsReviews}</Text>
          </View>
          <View style={styles.insightsGrid}>
            <View style={styles.insightBox}>
              <View style={styles.insightBoxHeader}>
                <IconX name="cash-outline" origin={ICON_TYPE.IONICONS} size={14} color={colors.purple[700]} />
                <Text style={styles.insightBoxTitle}>{strings.providerProfile.earnings}</Text>
              </View>
              <Text style={styles.insightValue}>${0}</Text>

            </View>
            <View style={styles.insightBox}>
              <View style={styles.insightBoxHeader}>
                <IconX name="star" origin={ICON_TYPE.IONICONS} size={14} color="#3130c0" />
                <Text style={styles.insightBoxTitle}>{strings.providerProfile.rating}</Text>
              </View>
              <Text style={styles.insightValue}>4.9 ★</Text>
              <View style={styles.insightSub}>
                <Text style={styles.insightSubTextGrey}>{strings.providerProfile.reviewsCount}</Text>
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
        onConfirm={() => { setModal(null); if (modal === 'logout') signOut(); }}
      />
    </View>
  );
}