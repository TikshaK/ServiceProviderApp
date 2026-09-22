import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, type ImagePickerResponse } from 'react-native-image-picker';
import { usePermissions } from './usePermissions';

export interface ImageAsset {
  id: string;
  uri: string;
  isExisting?: boolean;
}

function normalizeResponse(response: ImagePickerResponse): ImageAsset[] {
  return (response.assets ?? [])
    .filter(asset => Boolean(asset.uri))
    .map(asset => ({ id: `${asset.uri}-${asset.fileName ?? Date.now()}`, uri: asset.uri as string }));
}

export function useImagePicker() {
  const [loading, setLoading] = useState(false);
  const { requestCameraPermission, requestGalleryPermission } = usePermissions();

  const openGallery = async (onSelected: (assets: ImageAsset[]) => void, selectionLimit = 8) => {
    if (!(await requestGalleryPermission())) return;
    setLoading(true);
    try {
      const response = await launchImageLibrary({ mediaType: 'photo', selectionLimit, quality: 0.8 });
      if (!response.didCancel && !response.errorCode) onSelected(normalizeResponse(response));
      else if (response.errorMessage) Alert.alert('Unable to select image', response.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async (onSelected: (assets: ImageAsset[]) => void) => {
    if (!(await requestCameraPermission())) return;
    setLoading(true);
    try {
      const response = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false });
      if (!response.didCancel && !response.errorCode) onSelected(normalizeResponse(response));
      else if (response.errorMessage) Alert.alert('Unable to capture image', response.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const chooseSource = (onSelected: (assets: ImageAsset[]) => void, remainingSlots: number) => {
    Alert.alert('Add service images', 'Choose an image source.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Camera', onPress: () => openCamera(onSelected) },
      { text: 'Gallery', onPress: () => openGallery(onSelected, Platform.OS === 'android' ? 1 : remainingSlots) },
    ]);
  };

  return { loading, openGallery, openCamera, chooseSource };
}