import React, { useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ConfirmModal, ICON_TYPE, IconX } from '../../../../components';
import { useFocusEffect } from '@react-navigation/native';
import { colors, images, navigationStrings, strings } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { getAddresses } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';

export default function CustomerProfile({ navigation }: { navigation: any }) {
  const { signOut } = useAuth();
  const profile = useAppSelector(state => state.user.profile);
  const [modal, setModal] = useState<'logout' | 'delete' | null>(null);
  const [savedAddress, setSavedAddress] = useState<{ street: string; city: string; state?: string; postalCode: string } | null>(null);
  const [addressCount, setAddressCount] = useState(0);

  useFocusEffect(useCallback(() => {
    if (!profile?.uid) {
      setSavedAddress(null);
      setAddressCount(0);
      return;
    }

    getAddresses(profile.uid).then(addresses => {
      const defaultAddress = addresses.find(address => address.isDefault) ?? addresses[0];
      setSavedAddress(defaultAddress ?? null);
      setAddressCount(addresses.length);
    }).catch(() => {
      setSavedAddress(null);
      setAddressCount(0);
    });
  }, [profile?.uid]));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBlur} />
          <View style={styles.heroContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  profile?.avatarUrl ?
                    {
                      uri: profile?.avatarUrl

                    } :
                    images.profilePlaceHolder
                }
                style={styles.avatar}
              />
              <View style={styles.verifiedBadge}>
                <IconX name="verified" origin={ICON_TYPE.MATERIAL_ICONS} size={13} color={colors.white[100]} />
              </View>
            </View>

            <View style={styles.heroInfo}>
              <View style={styles.heroNameRow}>
                <Text style={styles.heroName} numberOfLines={1}>{profile?.fullName ?? strings.customerProfile.customerFallbackName}</Text>
                <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={() => navigation.navigate(navigationStrings.CUSTOMER_EDIT_PROFILE)}>
                  <IconX name="edit" origin={ICON_TYPE.MATERIAL_ICONS} size={15} color={colors.purple[700]} />
                  <Text style={styles.editBtnText}>{strings.common.edit}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contactRow}>
                <IconX name="mail" origin={ICON_TYPE.MATERIAL_ICONS} size={16} color={colors.purple[700]} />
                <Text style={styles.contactText} numberOfLines={1}>{profile?.email ?? ''}</Text>
              </View>
              <View style={styles.contactRow}>
                <IconX name="phone" origin={ICON_TYPE.MATERIAL_ICONS} size={16} color={colors.purple[700]} />
                <Text style={styles.contactText}>{profile?.phone ?? ''}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences & Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{strings.customerProfile.preferencesSettings}</Text>
          <View style={styles.cardBlock}>

            {/* Saved Addresses */}
            <TouchableOpacity style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(navigationStrings.CUSTOMER_SAVED_ADDRESSES)}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <IconX
                    name="location" origin={ICON_TYPE.ENTYPO} size={22} color={colors.purple[700]} />
                </View>
                <View style={styles.menuItemTexts}>
                  <Text style={styles.menuTitle}>{strings.customerProfile.savedAddresses}</Text>
                  <Text style={styles.menuSubtitle} numberOfLines={1}>{savedAddress?.street ?? 'No addresses saved'}</Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                <View style={styles.menuStatusBadge}>
                  <Text style={styles.menuStatusText}>{addressCount} {addressCount === 1 ? 'place' : 'places'}</Text>
                </View>
                <IconX name="chevron-right" origin={ICON_TYPE.MATERIAL_ICONS} size={20} color={colors.grey[400]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Information & Support */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{strings.customerProfile.informationSupport}</Text>
          <View style={styles.cardBlock}>
            {/* Terms */}
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <IconX name="description" origin={ICON_TYPE.MATERIAL_ICONS} size={22} color={colors.purple[700]} />
                </View>
                <View style={styles.menuItemTexts}>
                  <Text style={styles.menuTitle}>{strings.common.termsAndConditions}</Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                <IconX name="chevron-right" origin={ICON_TYPE.MATERIAL_ICONS} size={20} color={colors.grey[400]} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Privacy */}
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <IconX name="shield" origin={ICON_TYPE.MATERIAL_ICONS} size={22} color={colors.purple[700]} />
                </View>
                <View style={styles.menuItemTexts}>
                  <Text style={styles.menuTitle}>{strings.common.privacyPolicy}</Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                <IconX name="chevron-right" origin={ICON_TYPE.MATERIAL_ICONS} size={20} color={colors.grey[400]} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Help & Support */}
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, styles.menuIconContainerSecondary]}>
                  <IconX name="headset-mic" origin={ICON_TYPE.MATERIAL_ICONS} size={22} color={colors.white[100]} />
                </View>
                <View style={styles.menuItemTexts}>
                  <Text style={styles.menuTitle}>{strings.common.helpSupport}</Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                <IconX name="chevron-right" origin={ICON_TYPE.MATERIAL_ICONS} size={20} color={colors.grey[400]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={() => setModal('logout')}>
            <IconX name="logout" origin={ICON_TYPE.MATERIAL_ICONS} size={20} color={colors.grey[700]} />
            <Text style={styles.logoutText}>{strings.common.logOut}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.6}
            onPress={() => setModal('delete')}
          >
            <IconX name="delete-forever" origin={ICON_TYPE.MATERIAL_ICONS} size={18} color="#E11D48" />
            <Text style={styles.deleteText}>{strings.common.deleteAccount}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <ConfirmModal
        visible={modal !== null}
        title={modal === 'logout' ? strings.common.logOutTitle : strings.common.deleteAccountTitle}
        message={modal === 'logout' ? strings.common.logOutMessage : strings.customerProfile.deleteAccountMessage}
        confirmText={modal === 'logout' ? strings.common.logOut : strings.common.deleteAccount}
        cancelText={modal === 'logout' ? strings.common.cancel : strings.common.keepAccount}
        destructive
        onCancel={() => setModal(null)}
        onConfirm={() => { setModal(null); if (modal === 'logout') signOut(); }}
      />

    </View>
  );
}