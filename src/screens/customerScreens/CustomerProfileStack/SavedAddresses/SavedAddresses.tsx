import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors, navigationStrings } from '../../../../constants';
import { getAddresses } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import type { CustomerAddress } from '../../../../types/address';
import { styles } from './styles';

export default function SavedAddresses({ navigation }: { navigation: any }) {
	const profile = useAppSelector(state => state.user.profile);
	const [addresses, setAddresses] = useState<CustomerAddress[]>([]);

	const loadAddresses = useCallback(() => {
		if (!profile?.uid) return;
		getAddresses(profile.uid).then(setAddresses).catch(() => setAddresses([]));
	}, [profile?.uid]);

	useFocusEffect(useCallback(() => {
		loadAddresses();
	}, [loadAddresses]));

	return (
		<View
			style={styles.container}
		>
			<StatusBar
				barStyle="dark-content"
			/>
			<CustomHeader
				title="Add Edit Address"
				showBackButton
				onLeftPress={() => navigation.goBack()}
			/>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>

				<View
					style={styles.contextRow}
				>
					<Text
						style={styles.heading}
					>
						Saved Addresses
					</Text>
					<Pressable
						accessibilityRole="button"
						onPress={() => navigation.navigate(navigationStrings.CUSTOMER_ADD_EDIT_ADDRESS)}
						style={styles.addButton}
					>
						<IconX
							name="add"
							origin={ICON_TYPE.IONICONS}
							size={18}
							color={colors.white[100]}
						/>
						<Text
							style={styles.addText}
						>
							Add
						</Text>
					</Pressable>
				</View>
				<View
					style={styles.list}
				>
					{addresses.length === 0 ?
						<Text
							style={styles.addressText}
						>
							No addresses saved. Add one to use it for bookings.
						</Text>
						:
						addresses.map(address =>
							<View
								key={address.id}
								style={styles.addressCard}
							>
								<View
									style={styles.addressMain}
								>
									<View
										style={styles.addressIcon}
									>
										<IconX
											name="home"
											origin={ICON_TYPE.MATERIAL_ICONS}
											size={20}
											color={colors.purple[700]}
										/>
									</View>
									<View
										style={styles.addressCopy}
									>
										<View
											style={styles.addressTitleRow}
										>
											<Text
												style={styles.addressLabel}
											>
												{address.label}
											</Text>
											{
											address.isDefault
												?
												<Text
													style={styles.defaultBadge}
												>
													Default
												</Text>
												:
												null
											}
										</View>
										<Text
											style={styles.addressText}
										>
											{address.street}
										</Text>
										<Text
											style={styles.zipText}
										>
											ZIP
											{address.postalCode}
										</Text>
									</View>
								</View>
								<Pressable
									accessibilityLabel={`Edit ${address.label} address`}
									onPress={() => navigation.navigate(navigationStrings.CUSTOMER_ADD_EDIT_ADDRESS, { address })}
									style={styles.editButton}
								>
									<IconX
										name="edit"
										origin={ICON_TYPE.MATERIAL_ICONS}
										size={15}
										color={colors.purple[700]}
									/>
								</Pressable>
							</View>
						)}
				</View>
			</ScrollView>
		</View>
	);
}
