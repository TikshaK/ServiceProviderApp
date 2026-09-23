import React, { useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Switch
} from 'react-native';
import { EmptyState, ICON_TYPE, IconX } from '../../../../components';
import { useFocusEffect } from '@react-navigation/native';
import { colors, images, navigationStrings, strings } from '../../../../constants';
import { getServices, updateService } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import type { Service } from '../../../../types/service';
import { styles } from './styles';

type ProviderServicesProps = {
  navigation: any;
};

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  rating: string;
  price: string;
  imageUrl: string;
  iconName: string;
  isActive: boolean;
}

export default function ProviderServices({ navigation }: ProviderServicesProps) {
  const profile = useAppSelector(state => state.user.profile);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    const loadServices = async () => {
      if (!profile?.uid) {
        setServices([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const savedServices = await getServices({ providerId: profile.uid, activeOnly: false });
        if (active) setServices(savedServices);
      } catch {
        if (active) setServices([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadServices();
    return () => { active = false; };
  }, [profile?.uid]));

  const toggleService = async (service: Service) => {
    const updated = { ...service, isActive: !service.isActive, updatedAt: Date.now() };
    setServices(prev => prev.map(item => item.id === service.id ? updated : item));
    await updateService(updated);
  };

  const activeCount = services.filter(s => s.isActive).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={styles.activeInfo}>
            <View style={styles.pulseDot} />
            <Text
              style={styles.activeCountText}
            >
              {activeCount} Active Services
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addButton}
            onPress={() => navigation.navigate('AddEditServices')}
          >
            <IconX

              name="add"
              origin={ICON_TYPE.IONICONS}
              size={20}
              color={colors.white[100]}
            />
            <Text style={styles.addButtonText}
            >
              Add Service

            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.serviceList}>
          {loading ? <Text
            style={styles.serviceDesc}
          >
            {strings.services.loading}
          </Text>
            :
            services.length === 0
              ?
              <EmptyState
                title={strings.services.noServices}
                message={strings.services.providerEmpty}
                icon="briefcase-outline"
              />
              :
              services.map(service => {
                console.log("The service is:", service)
                return (

                  <View
                    key={service.id}
                    style={[styles.card, !service.isActive && styles.cardInactive]}
                  >
                    <View
                      style={styles.cardTop}
                    >
                      <View
                        style={styles.imageContainer}
                      >
                        <Image
                          source={
                            service?.imageUrls ?
                              {
                                uri: service?.imageUrls[0]
                              }
                              :
                              images.servicesPlaceholder
                          }
                          style={[
                            styles.serviceImage,
                            !service.isActive && styles.imageInactive
                          ]}
                        />

                      </View>
                      <View style={styles.cardInfo}>
                        <View style={styles.cardHeader}>
                          <Text
                            style={styles.serviceTitle}
                            numberOfLines={1}
                          >
                            {service.title}
                          </Text>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => navigation.navigate(navigationStrings.ADD_EDIT_SERVICES, { service })}
                          >
                            <IconX
                              name="pencil-outline"
                              origin={ICON_TYPE.MATERIAL_COMMUNITY}
                              size={15}
                              color={colors.grey[700]}
                            />
                            <Text style={styles.editText}
                            >
                              {strings.common.edit}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <Text
                          style={styles.serviceDesc}
                          numberOfLines={2}
                        >
                          {service.description}
                        </Text>

                        <View
                          style={styles.tagsRow}>
                          <View
                            style={styles.tag}>
                            <IconX
                              name="time-outline"
                              origin={ICON_TYPE.IONICONS}
                              size={12}
                              color={colors.grey[700]}
                            />
                            <Text
                              style={styles.tagText}
                            >
                              {`${Math.round(service.durationMinutes / 60 * 10) / 10} hrs`}
                            </Text>
                          </View>
                          <View
                            style={styles.tag}>
                            {!service.isActive ? (
                              <IconX
                                name="power"
                                origin={ICON_TYPE.IONICONS}
                                size={12}
                                color={colors.grey[700]}
                              />
                            ) : (
                              <IconX
                                name="star"
                                origin={ICON_TYPE.IONICONS}
                                size={12}
                                color={colors.grey[700]}
                              />
                            )}
                            <Text
                              style={styles.tagText}
                            >
                              {service.ratingAverage
                                ?
                                `${service.ratingAverage} (${service.reviewCount})`
                                :
                                'New'
                              }
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.cardBottom}>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}
                        >
                          Starting from
                        </Text>
                        <Text
                          style={[styles.priceValue, !service.isActive && styles.priceValueInactive]}
                        >
                          ${service.price}
                        </Text>
                      </View>
                      <View
                        style={styles.toggleContainer}
                      >
                        <View
                          style={[
                            styles.statusBadge, service.isActive 
                            ?
                             styles.statusActive 
                            :
                             styles.statusInactive
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText, 
                              service.isActive 
                              ? 
                              styles.statusTextActive 
                              : 
                              styles.statusTextInactive
                            ]}
                          >
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                        <Switch
                          value={service.isActive}
                          onValueChange={() => toggleService(service)}
                          trackColor={{ 
                            false: colors.grey[300], 
                            true: colors.purple[700] 
                          }}
                          thumbColor={colors.white[100]}
                          ios_backgroundColor={colors.grey[300]}
                        />
                      </View>
                    </View>
                  </View>
                )
              }
              )}
        </View>
      </ScrollView>
    </View>
  );
}