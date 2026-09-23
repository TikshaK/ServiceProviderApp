import { Alert, Linking, Platform } from 'react-native';
import { check, openSettings, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { showToast } from '../utils';

type PermissionKind = 'camera' | 'gallery';

const permissionFor = (kind: PermissionKind) => {
  if (kind === 'camera') {
    return Platform.select({ ios: PERMISSIONS.IOS.CAMERA, android: PERMISSIONS.ANDROID.CAMERA });
  }

  return Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : undefined;
};

async function requestPermission(kind: PermissionKind) {
  const permission = permissionFor(kind);
  if (!permission) return true;

  let result = await check(permission);
  if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) return true;

  if (result === RESULTS.BLOCKED) {
    Alert.alert(
      `${kind === 'camera' ? 'Camera' : 'Photo library'} permission needed`,
      `Allow ${kind === 'camera' ? 'camera' : 'photo library'} access in Settings to continue.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => openSettings().catch(() => Linking.openSettings()) },
      ],
    );
    return false;
  }

  result = await request(permission);
  if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) return true;

  showToast({
    type: 'error',
    title: `${kind === 'camera' ? 'Camera' : 'Photo library'} permission denied`,
    message: `Please allow ${kind === 'camera' ? 'camera' : 'photo library'} access before selecting an image.`,
  });
  return false;
}

export function usePermissions() {
  return {
    requestCameraPermission: () => requestPermission('camera'),
    requestGalleryPermission: () => requestPermission('gallery'),
  };
}