import { Platform } from 'react-native';
import cloudinary from '../constants/cloudinary';

export async function uploadImageToCloudinary(uri: string, fileName = 'profile.jpg', folder: string = cloudinary.folder): Promise<string> {
  if (!cloudinary.cloudName || !cloudinary.unsignedUploadPreset) {
    throw new Error('Cloudinary upload configuration is missing.');
  }

  const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
  const body = new FormData();
  body.append('file', {
    uri: uploadUri,
    type: 'image/jpeg',
    name: fileName,
  } as any);
  body.append('upload_preset', cloudinary.unsignedUploadPreset);
  body.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`, {
    method: 'POST',
    body,
  });
  const result = await response.json();

  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message ?? 'Cloudinary image upload failed.');
  }

  return result.secure_url as string;
}
