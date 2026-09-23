import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors, images, strings } from '../../../../constants';
import { useImagePicker, type ImageAsset } from '../../../../hooks/useImagePicker';
import { firebaseAuth, updateUserProfile } from '../../../../services/firebase';
import { uploadImageToCloudinary } from '../../../../services/cloudinary';
import { storage } from '../../../../services/storage';
import storageKeys from '../../../../constants/storageKeys';
import { setUserProfile, useAppDispatch, useAppSelector } from '../../../../store';
import { UserProfile } from '../../../../types/user';
import { styles } from './styles';
import { showToast } from '../../../../utils';

type Props = { navigation: any };

export default function EditCustomerProfile({ navigation }: Props) {
	const dispatch = useAppDispatch();
	const profile = useAppSelector(state => state.user.profile);
	const authEmail = useAppSelector(state => state.auth.email);
	const [fullName, setFullName] = useState(profile?.fullName ?? '');
	const [phone, setPhone] = useState(profile?.phone ?? '');
	const [email] = useState(profile?.email ?? authEmail ?? '');
	const [avatarUri, setAvatarUri] = useState(profile?.avatarUrl );
	const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { chooseSource, loading: pickerLoading } = useImagePicker();

	const saveChanges = async () => {
		if (!fullName.trim() || !phone.trim()) {
			showToast({ type: 'error', title: strings.alerts.missingInformation, message: 'Full name and phone number are required.' });
			return;
		}
		const uid = profile?.uid ?? firebaseAuth.currentUser?.uid;
		if (!uid) {
			showToast({ type: 'error', title: strings.alerts.sessionExpired, message: 'Please sign in again before editing your profile.' });
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
			showToast({ type: 'error', title: strings.alerts.unableToSave, message: 'Your profile could not be updated. Please try again.' });
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
			<CustomHeader
				title="Edit Profile"
				showBackButton
				onLeftPress={() => navigation.goBack()}
			/>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<View
					style={styles.avatarSection}
				>
					<View
						style={styles.avatarWrap}
					>
						<Image
							source={avatarUri ?
								{ uri: avatarUri } :
								images.profilePlaceHolder
							}
							style={styles.avatar}
						/>
						<Pressable
							accessibilityLabel="Change profile photo"
							accessibilityRole="button"
							disabled={pickerLoading}
							onPress={() => chooseSource(handleAvatarSelected, 1)}
							style={styles.cameraButton}>
							<IconX
								name="camera"
								origin={ICON_TYPE.IONICONS}
								size={18}
								color={colors.white[100]}
							/>
						</Pressable>
					</View>
					<View
						style={styles.photoActions}
					>
						<Pressable
							disabled={pickerLoading}
							onPress={() => chooseSource(handleAvatarSelected, 1)}
						>
							<Text
								style={styles.photoActionText}
							>
								Change Photo
							</Text>
						</Pressable>
						<View
							style={styles.photoDot}
						/>
						<Pressable
							onPress={() => setAvatarUri(FALLBACK_AVATAR)}
						><Text
							style={styles.removePhotoText}
						>
								Remove
							</Text>
						</Pressable>
					</View>
				</View>
				<View
					style={styles.form}
				>
					<Field
						label="Full Name"
						value={fullName}
						onChangeText={setFullName}
						icon="badge"
					/>
					<Field
						label="Phone Number"
						value={phone}
						onChangeText={setPhone}
						keyboardType="phone-pad"
						icon="phone-iphone"
					/>
					<Field
						label="Email Address"
						value={email}
						onChangeText={() => undefined}
						icon="alternate-email"
						editable={false}
						helper="Email is managed through your account."
					/>
				</View>
				<View
					style={styles.actions}
				>
					<Pressable
						disabled={loading}
						onPress={saveChanges}
						style={[styles.saveButton, loading && styles.disabledButton]}
					>
						<IconX
							name="save-outline"
							origin={ICON_TYPE.IONICONS}

							size={19}
							color={colors.white[100]}
						/>
						<Text
							style={styles.saveText}
						>
							{loading ? 'Saving...' : 'Save Changes'}
						</Text>
					</Pressable>
					<Pressable
						disabled={loading}
						onPress={() => navigation.goBack()}
						style={styles.cancelButton}
					>
						<Text style={styles.cancelText}
						>
							Cancel

						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}

function Field({ label, value, onChangeText, icon, keyboardType = 'default', editable = true, helper }: { label: string; value: string; onChangeText: (value: string) => void; icon: string; keyboardType?: 'default' | 'phone-pad'; editable?: boolean; helper?: string }) {
	return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={[styles.inputWrap, !editable && styles.inputDisabled]}><TextInput value={value} onChangeText={onChangeText} editable={editable} keyboardType={keyboardType} placeholder={label} placeholderTextColor={colors.grey[700]} style={styles.input} /><IconX name={icon} origin={ICON_TYPE.MATERIAL_ICONS} size={18} color={editable ? colors.purple[700] : colors.grey[700]} /></View>{helper ? <Text style={styles.helper}>{helper}</Text> : null}</View>;
}
