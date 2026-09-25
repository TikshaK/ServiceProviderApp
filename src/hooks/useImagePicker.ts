import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, PhotoQuality } from 'react-native-image-picker';
import usePermissions from './usePermissions';
import { showToast } from '../utils';

export interface ImagePickerOptions {
  selectionLimit?: number;
  quality?: PhotoQuality;
  includeBase64?: boolean;
}

export interface ImageAsset {
  id: string;
  uri: string;
  isExisting?: boolean;
  isCover?: boolean;
}

const useImagePicker = () => {
  const [loading, setLoading] = useState(false);
  const { requestCameraPermission, requestGalleryPermission } = usePermissions();

  // Open camera with permission check
  const openCamera = async (
    onImageSelected: (assets: ImageAsset[]) => void,
    options: ImagePickerOptions = { selectionLimit: 1, quality: 0.8 }
  ) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }
    setLoading(true);
    launchCamera(
      {
        mediaType: 'photo',
        quality: options.quality || 0.8,
        includeBase64: options.includeBase64 || false,
      },
      (response) => {
        setLoading(false);
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          showToast({ type: 'error', title: 'Error', message: response.errorMessage || 'Something went wrong' });
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const assets: ImageAsset[] = response.assets.map((asset, index) => ({
            id: `img-${Date.now()}-${index}`,
            uri: asset.uri || '',
            isCover: index === 0,
          }));
          onImageSelected(assets);
        }
      }
    );
  };

  // Open gallery - No permission needed on Android 14+
  const openGallery = async (
    onImageSelected: (assets: ImageAsset[]) => void,
    options: ImagePickerOptions = { selectionLimit: 1, quality: 0.8 }
  ) => {
    // Only check permission for iOS (Android 14+ doesn't need gallery permission)
    if (Platform.OS === 'ios') {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) {
        return;
      }
    }
    setLoading(true);
    const selectionLimit = options.selectionLimit || 1;
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: selectionLimit,
        quality: options.quality || 0.8,
        includeBase64: options.includeBase64 || false,
      },
      (response) => {
        setLoading(false);
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          showToast({ type: 'error', title: 'Error', message: response.errorMessage || 'Something went wrong' });
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const assets: ImageAsset[] = response.assets.map((asset, index) => ({
            id: `img-${Date.now()}-${index}`,
            uri: asset.uri || '',
            isCover: index === 0,
          }));
          onImageSelected(assets);
        }
      }
    );
  };

  // Show action sheet for image source selection
  const showImagePickerOptions = async (
    onImageSelected: (assets: ImageAsset[]) => void,
    options: ImagePickerOptions = { selectionLimit: 1, quality: 0.8 }
  ) => {
    Alert.alert(
      'Select Image Source',
      'Choose from where you want to select the image',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(onImageSelected, options),
        },
        {
          text: 'Gallery',
          onPress: () => openGallery(onImageSelected, options),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // For single image selection (Profile)
  const pickSingleImage = async (
    onImageSelected: (assets: ImageAsset[]) => void,
    options: ImagePickerOptions = { selectionLimit: 1, quality: 0.8 }
  ) => {
    await showImagePickerOptions(onImageSelected, { ...options, selectionLimit: 1 });
  };

  // For multiple image selection (Create Listing)
  const pickMultipleImages = async (
    onImageSelected: (assets: ImageAsset[]) => void,
    maxCount: number = 8,
    options: ImagePickerOptions = { selectionLimit: 8, quality: 0.8 }
  ) => {
    await showImagePickerOptions(onImageSelected, {
      ...options,
      selectionLimit: Platform.OS === 'android' ? 1 : maxCount,
    });
  };

  return {
    loading,
    pickSingleImage,
    pickMultipleImages,
    openCamera,
    openGallery,
  };
};

export default useImagePicker;
