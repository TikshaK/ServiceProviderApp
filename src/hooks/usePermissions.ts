import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import {
  PERMISSIONS,
  request,
  check,
  RESULTS,
  openSettings,
  Permission,
} from 'react-native-permissions';

export type PermissionType =
  | 'camera'
  | 'gallery'
  | 'location'
  | 'locationWhenInUse'
  | 'locationAlways';

export interface PermissionStatus {
  granted: boolean;
  denied: boolean;
  blocked: boolean;
  unavailable: boolean;
}

// Permission mapping for iOS and Android
const getPermissionType = (type: PermissionType): Permission => {
  if (Platform.OS === 'ios') {
    switch (type) {
      case 'camera':
        return PERMISSIONS.IOS.CAMERA;
      case 'gallery':
        return PERMISSIONS.IOS.PHOTO_LIBRARY;
      case 'location':
      case 'locationWhenInUse':
        return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      case 'locationAlways':
        return PERMISSIONS.IOS.LOCATION_ALWAYS;
      default:
        return PERMISSIONS.IOS.CAMERA;
    }
  } else {
    // Android
    switch (type) {
      case 'camera':
        return PERMISSIONS.ANDROID.CAMERA;
      case 'gallery':
        // Android 14+ doesn't need gallery permission for selecting photos
        return PERMISSIONS.ANDROID.CAMERA; // Fallback - won't be used
      case 'location':
      case 'locationWhenInUse':
        return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      case 'locationAlways':
        return PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION;
      default:
        return PERMISSIONS.ANDROID.CAMERA;
    }
  }
};

// Check if permission is needed for Android Gallery
const isGalleryPermissionNeeded = (type: PermissionType): boolean => {
  // On Android 14+, gallery permission is NOT needed for reading photos
  if (Platform.OS === 'android' && type === 'gallery') {
    return false;
  }
  return true;
};

const usePermissions = () => {
  const [loading, setLoading] = useState(false);

  // Check a specific permission
  const checkPermission = useCallback(async (type: PermissionType): Promise<PermissionStatus> => {
    if (!isGalleryPermissionNeeded(type)) {
      return {
        granted: true,
        denied: false,
        blocked: false,
        unavailable: false,
      };
    }
    try {
      const permission = getPermissionType(type);
      const result = await check(permission);
      return {
        granted: result === RESULTS.GRANTED,
        denied: result === RESULTS.DENIED,
        blocked: result === RESULTS.BLOCKED,
        unavailable: result === RESULTS.UNAVAILABLE,
      };
    } catch (error) {
      return {
        granted: false,
        denied: true,
        blocked: false,
        unavailable: false,
      };
    }
  }, []);

  // Request a specific permission
  const requestPermission = useCallback(async (type: PermissionType): Promise<PermissionStatus> => {
    if (!isGalleryPermissionNeeded(type)) {
      return {
        granted: true,
        denied: false,
        blocked: false,
        unavailable: false,
      };
    }
    setLoading(true);
    try {
      const permission = getPermissionType(type);
      const result = await request(permission);
      const status = {
        granted: result === RESULTS.GRANTED || result === RESULTS.LIMITED,
        denied: result === RESULTS.DENIED,
        blocked: result === RESULTS.BLOCKED,
        unavailable: result === RESULTS.UNAVAILABLE,
      };
      if (status.blocked) {
        Alert.alert(
          'Permission Required',
          `Please enable ${type} permission in settings to use this feature.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => { openSettings(); } },
          ]
        );
      }
      return status;
    } catch (error) {
      return {
        granted: false,
        denied: true,
        blocked: false,
        unavailable: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Check and request if needed
  const ensurePermission = useCallback(async (
    type: PermissionType,
    showAlert: boolean = true
  ): Promise<boolean> => {
    if (!isGalleryPermissionNeeded(type)) {
      return true;
    }
    const status = await checkPermission(type);
    if (status.granted) {
      return true;
    }
    if (status.blocked) {
      if (showAlert) {
        Alert.alert(
          'Permission Required',
          `Please enable ${type} permission in settings to use this feature.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => { openSettings(); } },
          ]
        );
      }
      return false;
    }
    const newStatus = await requestPermission(type);
    return newStatus.granted;
  }, [checkPermission, requestPermission]);

  // Camera permission (for both iOS and Android)
  const requestCameraPermission = useCallback(async (showAlert: boolean = true): Promise<boolean> => {
    return ensurePermission('camera', showAlert);
  }, [ensurePermission]);

  // Gallery permission - Android always granted, iOS checks
  const requestGalleryPermission = useCallback(async (showAlert: boolean = true): Promise<boolean> => {
    if (Platform.OS === 'android') {
      return true;
    }
    return ensurePermission('gallery', showAlert);
  }, [ensurePermission]);

  // Location permission
  const requestLocationPermission = useCallback(async (
    showAlert: boolean = true,
    type: 'whenInUse' | 'always' = 'whenInUse'
  ): Promise<boolean> => {
    const permissionType = type === 'whenInUse' ? 'locationWhenInUse' : 'locationAlways';
    return ensurePermission(permissionType, showAlert);
  }, [ensurePermission]);

  // Check all permissions at once
  const checkAllPermissions = useCallback(async (): Promise<Record<PermissionType, PermissionStatus>> => {
    const types: PermissionType[] = ['camera', 'gallery', 'location'];
    const results: Record<PermissionType, PermissionStatus> = {} as any;
    for (const type of types) {
      results[type] = await checkPermission(type);
    }
    return results;
  }, [checkPermission]);

  // Open app settings
  const openAppSettings = useCallback(async () => {
    try {
      await openSettings();
    } catch (error) {
      // ignore
    }
  }, []);

  return {
    loading,
    requestCameraPermission,
    requestGalleryPermission,
    requestLocationPermission,
    checkPermission,
    checkAllPermissions,
    ensurePermission,
    openAppSettings,
  };
};

export default usePermissions;
