import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { ICON_TYPE, IconX } from '../../../../components';
import { colors, strings } from '../../../../constants';
import { useImagePicker, type ImageAsset } from '../../../../hooks/useImagePicker';
import { firebaseAuth, updateUserProfile } from '../../../../services/firebase';
import { uploadImageToCloudinary } from '../../../../services/cloudinary';
import { storage } from '../../../../services/storage';
import storageKeys from '../../../../constants/storageKeys';
import { setUserProfile, useAppDispatch, useAppSelector } from '../../../../store';
import { UserProfile } from '../../../../types/user';
import { styles } from './styles';

type Props = { navigation: any };

const FALLBACK_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPxOFhigRErRamtbdfFbKQTGx9wQALX0OzM8pXkbZhjTzkPINvYTo1wunxNWYlNb8gbafF3PIGrmBsCP8kmB4D5zP4AQH62t41q6I2l6wa3cG-xZCyrswu9GQe0JqihlQRn1_M-zNZFKs48IzTzTtzc-TBs9YVd34EIv46OSAR0Ilp9orSohFSR7NMWpfahOFa8scXKHjHpin42_pJQJXU4iODU5dexp2Rr94WgWkek7jdsmM5KeWcmg';

export default function EditCustomerProfile({ navigation }: Props) {
	const dispatch = useAppDispatch();
	const profile = useAppSelector(state => state.user.profile);
	const authEmail = useAppSelector(state => state.auth.email);
	const [fullName, setFullName] = useState(profile?.fullName ?? '');
	const [phone, setPhone] = useState(profile?.phone ?? '');
	const [email] = useState(profile?.email ?? authEmail ?? '');
	const [avatarUri, setAvatarUri] = useState(profile?.avatarUrl ?? FALLBACK_AVATAR);
	const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { chooseSource, loading: pickerLoading } = useImagePicker();

	const saveChanges = async () => {
		if (!fullName.trim() || !phone.trim()) {
			Alert.alert(strings.alerts.missingInformation, 'Full name and phone number are required.');
			return;
		}
		const uid = profile?.uid ?? firebaseAuth.currentUser?.uid;
		if (!uid) {
			Alert.alert(strings.alerts.sessionExpired, 'Please sign in again before editing your profile.');
			return;
		}

		const updatedProfile: UserProfile = {
			uid,
			email,
			fullName: fullName.trim(),
			phone: phone.trim(),
			role: profile?.role ?? 'customer',
			serviceName: profile?.serviceName,
			experience: profile?.experience,
			category: profile?.category,
			createdAt: profile?.createdAt,
		};

		setLoading(true);
		try {
			const avatarUrl = newAvatarUri ? await uploadImageToCloudinary(newAvatarUri, `${uid}-profile.jpg`) : profile?.avatarUrl;
			const savedProfile = await updateUserProfile({ ...updatedProfile, avatarUrl });
			dispatch(setUserProfile(savedProfile));
			storage.set(storageKeys.USER_DATA, JSON.stringify(savedProfile));
			navigation.goBack();
		} catch {
			Alert.alert(strings.alerts.unableToSave, 'Your profile could not be updated. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleAvatarSelected = (assets: ImageAsset[]) => {
		if (assets[0]?.uri) {
			setAvatarUri(assets[0].uri);
			setNewAvatarUri(assets[0].uri);
		}
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<View style={styles.header}><Pressable accessibilityLabel="Return to Profile" accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.headerButton}><IconX name="arrow-back-outline" origin={ICON_TYPE.IONICONS} size={24} color={colors.black[250]} /></Pressable><Text style={styles.headerTitle}>Edit Profile</Text><View style={styles.headerSpacer} /></View>
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
				<View style={styles.avatarSection}><View style={styles.avatarWrap}><Image source={{ uri: avatarUri }} style={styles.avatar} /><Pressable accessibilityLabel="Change profile photo" accessibilityRole="button" disabled={pickerLoading} onPress={() => chooseSource(handleAvatarSelected, 1)} style={styles.cameraButton}><IconX name="camera" origin={ICON_TYPE.IONICONS} size={18} color={colors.white[100]} /></Pressable></View><View style={styles.photoActions}><Pressable disabled={pickerLoading} onPress={() => chooseSource(handleAvatarSelected, 1)}><Text style={styles.photoActionText}>Change Photo</Text></Pressable><View style={styles.photoDot} /><Pressable onPress={() => setAvatarUri(FALLBACK_AVATAR)}><Text style={styles.removePhotoText}>Remove</Text></Pressable></View></View>
				<View style={styles.form}><Field label="Full Name" value={fullName} onChangeText={setFullName} icon="badge" /><Field label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" icon="phone-iphone" /><Field label="Email Address" value={email} onChangeText={() => undefined} icon="alternate-email" editable={false} helper="Email is managed through your account." /></View>
				<View style={styles.actions}><Pressable disabled={loading} onPress={saveChanges} style={[styles.saveButton, loading && styles.disabledButton]}><IconX name="save-outline" origin={ICON_TYPE.IONICONS} size={19} color={colors.white[100]} /><Text style={styles.saveText}>{loading ? 'Saving...' : 'Save Changes'}</Text></Pressable><Pressable disabled={loading} onPress={() => navigation.goBack()} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable></View>
			</ScrollView>
		</View>
	);
}

function Field({ label, value, onChangeText, icon, keyboardType = 'default', editable = true, helper }: { label: string; value: string; onChangeText: (value: string) => void; icon: string; keyboardType?: 'default' | 'phone-pad'; editable?: boolean; helper?: string }) {
	return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={[styles.inputWrap, !editable && styles.inputDisabled]}><TextInput value={value} onChangeText={onChangeText} editable={editable} keyboardType={keyboardType} placeholder={label} placeholderTextColor={colors.grey[700]} style={styles.input} /><IconX name={icon} origin={ICON_TYPE.MATERIAL_ICONS} size={18} color={editable ? colors.purple[700] : colors.grey[700]} /></View>{helper ? <Text style={styles.helper}>{helper}</Text> : null}</View>;
}
