import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, Switch, Text, TextInput, View } from 'react-native';
import { CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors } from '../../../../constants';
import { saveAddress } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import type { CustomerAddress } from '../../../../types/address';
import { styles } from './styles';
import { showToast } from '../../../../utils';

type Props = { navigation: any; route?: { params?: { address?: CustomerAddress } } };

export default function AddEditAddress({ navigation, route }: Props) {
	const address = route?.params?.address;
	const profile = useAppSelector(state => state.user.profile);
	const [street, setStreet] = useState(address?.street ?? '');
	const [zip, setZip] = useState(address?.postalCode ?? '');
	const [isDefault, setIsDefault] = useState(address?.isDefault ?? true);
	const [saving, setSaving] = useState(false);

	const handleSaveAddress = async () => {
		const normalizedZip = zip.replace(/\D/g, '');
		if (!street.trim() || normalizedZip.length !== 5) {
			showToast({ type: 'error', title: 'Incomplete address', message: 'Enter a complete street address and a valid 5-digit ZIP code.' });
			return;
		}
		if (!profile?.uid) {
			showToast({ type: 'error', title: 'Session expired', message: 'Please sign in again before saving an address.' });
			return;
		}
		setSaving(true);
		try {
			const savedAddress: CustomerAddress = {
				id: address?.id ?? `address_${Date.now()}`,
				label: address?.label ?? 'Home',
				street: street.trim(),
				city: address?.city ?? '',
				state: address?.state,
				postalCode: normalizedZip,
				isDefault,
				createdAt: address?.createdAt ?? Date.now(),
				updatedAt: Date.now(),
			};
			await saveAddress(profile.uid, savedAddress);
			setSaving(false);
			navigation.goBack();
		} catch {
			setSaving(false);
			showToast({ type: 'error', title: 'Unable to save address', message: 'Please try again.' });
		}
	};

	return (
		<View
			style={styles.container}
		>
			<StatusBar
				barStyle="dark-content"
			/>
			<CustomHeader
				title={address ? 'Edit Address' : 'Add Address'}
				showBackButton
				onLeftPress={() => navigation.goBack()}
			/>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<View
					style={styles.fieldCard}
				>
					<View
						style={styles.labelRow}
					>
						<Text
							style={styles.label}
						>
							Street & Area
						</Text>
						<Text
							style={styles.required}
						>
							Required
						</Text>
					</View>
					<View
						style={styles.textAreaWrap}
					>
						<IconX
							name="location-outline"
							origin={ICON_TYPE.IONICONS}
							size={20}
							color={colors.grey[700]}
						/>
						<TextInput
							value={street}
							onChangeText={setStreet}
							multiline
							numberOfLines={3}
							placeholder="Enter complete street name, building, apartment..." placeholderTextColor={colors.grey[700]} style={styles.textArea} textAlignVertical="top" /></View></View>
				<View
					style={styles.fieldCard}
				>
					<View
						style={styles.labelRow}
					>
						<Text
							style={styles.label}>
							Pincode / ZIP Code
						</Text>
						<Text
							style={styles.helper}
						>
							5 digits</Text>
					</View>
					<View
						style={styles.zipWrap}
					>
						<IconX
							name="location-outline"
							origin={ICON_TYPE.IONICONS}
							size={20}
							color={colors.grey[700]}
						/>
						<TextInput
							value={zip}
							onChangeText={value => setZip(value.replace(/\D/g, '').slice(0, 5))}
							keyboardType="number-pad"
							maxLength={5}
							placeholder="78704"
							placeholderTextColor={colors.grey[700]}
							style={styles.zipInput}
						/>
						{
							zip.length === 5 ?
								<View
									style={styles.validBadge}
								>
									<IconX
										name="checkmark-circle"
										origin={ICON_TYPE.IONICONS}
										size={14}
										color={colors.purple[700]}
									/>
									<Text
										style={styles.validText}
									>
										Valid
									</Text>
								</View>
								: null
						}
					</View>
				</View>
				<View
					style={styles.defaultCard}
				>
					<View
						style={styles.defaultIcon}
					>
						<IconX
							name="star"
							origin={ICON_TYPE.IONICONS}
							size={20}
							color={colors.purple[700]}
						/>
					</View>
					<View
						style={styles.defaultCopy}
					>
						<Text
							style={styles.defaultTitle}
						>
							Set as default address
						</Text>
						<Text
							style={styles.helper}
						>
							Default choice for future jobs</Text></View><Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ false: colors.grey[300], true: colors.purple[600] }} thumbColor={colors.white[100]} /></View>
				<Pressable
					disabled={saving}
					onPress={handleSaveAddress}
					style={[styles.saveButton, saving && styles.disabledButton]}><IconX name="save-outline" origin={ICON_TYPE.IONICONS} size={20} color={colors.white[100]} /><Text style={styles.saveText}>{saving ? 'Updating...' : 'Save Address'}</Text></Pressable>

			</ScrollView>
		</View>
	);
}
