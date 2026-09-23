import React, { useRef, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	Pressable,
	ScrollView,
	StatusBar,
	Switch,
	Text,
	TextInput,
	View,
} from 'react-native';
import { CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors, SERVICE_CATEGORIES, strings } from '../../../../constants';
import { useImagePicker, type ImageAsset } from '../../../../hooks/useImagePicker';
import { uploadImageToCloudinary } from '../../../../services/cloudinary';
import { createService, deleteService, updateService } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';
import { showToast } from '../../../../utils';

export interface EditableService {
	id?: string;
	title?: string;
	description?: string;
	duration?: string;
	price?: string;
	imageUrl?: string;
	isActive?: boolean;
	category?: string;
	imageUrls?: string[];
}

type AddEditServicesProps = {
	navigation: any;
	route?: { params?: { service?: EditableService } };
};

const CATEGORIES = SERVICE_CATEGORIES;
const DURATIONS = ['1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours', '4 hours', '5+ hours'];

export default function AddEditServices({ navigation, route }: AddEditServicesProps) {
	const service = route?.params?.service;
	const profile = useAppSelector(state => state.user.profile);
	const [name, setName] = useState(service?.title ?? '');
	const [category, setCategory] = useState(service?.category ?? CATEGORIES[0]);
	const [price, setPrice] = useState(service?.price?.replace(/[^0-9.]/g, '') ?? '');
	const [duration, setDuration] = useState(service?.duration ?? DURATIONS[0]);
	const [description, setDescription] = useState(service?.description ?? '');
	const [isActive, setIsActive] = useState(service?.isActive ?? true);
	const [selector, setSelector] = useState<'category' | 'duration' | null>(null);
	const [images, setImages] = useState<ImageAsset[]>(() => {
		const imageUrls = service?.imageUrls ?? (service?.imageUrl ? [service.imageUrl] : []);
		return imageUrls.map(uri => ({ id: uri, uri, isExisting: true }));
	});
	const [isSaving, setIsSaving] = useState(false);
	const savingRef = useRef(false);
	const { chooseSource, loading: imagePickerLoading } = useImagePicker();

	const options = selector === 'category' ? CATEGORIES : DURATIONS;
	const addImages = (selected: ImageAsset[]) => {
		setImages(current => {
			const existingUris = new Set(current.map(image => image.uri));
			return [...current, ...selected.filter(image => !existingUris.has(image.uri))].slice(0, 8);
		});
	};

	const saveService = async () => {
		if (savingRef.current) return;

		if (!name.trim() || !price.trim()) {
			showToast({ type: 'error', title: strings.alerts.missingInformation, message: 'Add a service name and starting price before saving.' });
			return;
		}

		if (!profile?.uid) {
			showToast({ type: 'error', title: strings.alerts.sessionExpired, message: 'Please sign in again before saving a service.' });
			return;
		}

		savingRef.current = true;
		setIsSaving(true);

		try {
			const durationMinutes = Number.parseFloat(duration) * 60 || 60;
			const imageUrls = await Promise.all(images.map(async (image, index) => {
				if (image.isExisting || /^https?:\/\//.test(image.uri)) return image.uri;
				return uploadImageToCloudinary(image.uri, `${profile.uid}-service-${index}.jpg`, 'assets/services');
			}));

			if (service?.id) {
				await updateService({
					id: service.id,
					providerId: profile.uid,
					providerName: profile.fullName,
					title: name.trim(),
					description: description.trim(),
					category,
					durationMinutes,
					price: Number(price),
					currency: 'USD',
					imageUrls,
					isActive,
					ratingAverage: 0,
					reviewCount: 0,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			} else {
				await createService({
					providerId: profile.uid,
					providerName: profile.fullName,
					title: name.trim(),
					description: description.trim(),
					category,
					durationMinutes,
					price: Number(price),
					imageUrls,
					isActive
				});
			}
			navigation.goBack();
		} catch (error: any) {
			console.log('[SaveService] code:', error?.code);
			console.log('[SaveService] message:', error?.message);
			console.log('[SaveService] nativeErrorMessage:', error?.nativeErrorMessage);
			console.log('[SaveService] full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

			showToast({ type: 'error', title: 'Unable to save service', message: error?.message ? `${strings.alerts.tryAgain} (${error.code ?? 'error'}: ${error.message})` : strings.alerts.tryAgain });
		} finally {
			savingRef.current = false;
			setIsSaving(false);
		}
	};

	const confirmDelete = () => {
		Alert.alert(strings.servicesForm.deleteConfirmTitle, `${name || 'This service'} will be removed from your catalog.`, [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete', style: 'destructive', onPress: async () => {
					if (service?.id) await deleteService({
						id: service.id,
						providerId: profile?.uid ?? '',
						providerName: profile?.fullName ?? '',
						title: name,
						description,
						category,
						durationMinutes: 0,
						price: Number(price),
						currency: 'USD',
						imageUrls: [],
						isActive,
						ratingAverage: 0,
						reviewCount: 0,
						createdAt: 0,
						updatedAt: 0
					});
					navigation.goBack();
				}
			},
		]);
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />

			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
				<CustomHeader
					title={service ? strings.servicesForm.editService : strings.servicesForm.newService}
					showBackButton
					onLeftPress={() => navigation.goBack()}
				/>
				<View style={styles.contextRow}>
					<Text style={styles.screenTitle}>{service ? strings.servicesForm.editService : strings.servicesForm.newService}</Text>
					{service ? (
						<Pressable
							accessibilityRole="button"
							onPress={confirmDelete}
							style={styles.quickDelete}
						>
							<IconX
								name="trash-outline"
								origin={ICON_TYPE.IONICONS}
								size={16}
								color={colors.red[200]}
							/>
							<Text
								style={styles.quickDeleteText}
							>
								{strings.servicesForm.deleteService}
							</Text>
						</Pressable>
					) : null}
				</View>

				<Section title={strings.servicesForm.basicInformation} step="Step 1 of 4">
					<FieldLabel text={strings.servicesForm.coverPhoto} />
					<Pressable accessibilityRole="button" disabled={imagePickerLoading} onPress={() => chooseSource(addImages, Math.max(1, 8 - images.length))} style={styles.imagePickerButton}>
						<IconX name={images.length ? 'images-outline' : 'add'} origin={ICON_TYPE.IONICONS} size={22} color={colors.purple[700]} />
						<Text style={styles.imagePickerTitle}>{imagePickerLoading ? 'Opening image picker...' : images.length ? 'Edit images' : 'Add images'}</Text>
						<Text style={styles.imagePickerHelper}>{images.length}/8 images selected</Text>
					</Pressable>
					{images.length ? (
						<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageList}>
							{images.map(image => (
								<View key={image.id} style={styles.imageTile}>
									<Image source={{ uri: image.uri }} style={styles.selectedImage} />
									<Pressable accessibilityLabel="Remove image" accessibilityRole="button" onPress={() => setImages(current => current.filter(item => item.id !== image.id))} style={styles.removeImageButton}>
										<IconX name="close" origin={ICON_TYPE.IONICONS} size={14} color={colors.white[100]} />
									</Pressable>
								</View>
							))}
						</ScrollView>
					) : null}

					<FieldLabel text={strings.signUp.serviceName} required />
					<TextInput value={name} onChangeText={setName} placeholder={strings.services.serviceNamePlaceholder} placeholderTextColor={colors.grey[400]} style={styles.input} />

					<FieldLabel text="Category" required />
					<SelectField value={category} icon="chevron-down" onPress={() => setSelector('category')} />
				</Section>

				<Section title={strings.servicesForm.pricingTiming} step="Step 2 of 4">
					<View style={styles.twoColumn}>
						<View style={styles.column}>
							<FieldLabel text={strings.servicesForm.startingPrice} required />
							<View style={styles.priceInputWrap}>
								<Text style={styles.currency}>$</Text>
								<TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder={strings.services.pricePlaceholder} placeholderTextColor={colors.grey[400]} style={styles.priceInput} />
							</View>
							<Text style={styles.helper}>{strings.servicesForm.baseBilling}</Text>
						</View>
						<View style={styles.column}>
							<FieldLabel text="Duration" required />
							<SelectField value={duration} icon="chevron-down" onPress={() => setSelector('duration')} compact />
							<Text style={styles.helper}>{strings.servicesForm.slotAllocation}</Text>
						</View>
					</View>
				</Section>

				<Section title={strings.servicesForm.description} step="Step 3 of 4">
					<FieldLabel text={strings.servicesForm.clientScope} />
					<TextInput value={description} onChangeText={setDescription} maxLength={400} multiline numberOfLines={5} placeholder={strings.services.descriptionPlaceholder} placeholderTextColor={colors.grey[400]} style={styles.textArea} textAlignVertical="top" />
					<View style={styles.counterRow}><Text style={styles.helper}>{description.length}/400</Text></View>
				</Section>

				<Section title={strings.servicesForm.status} step="Step 4 of 4">
					<View style={styles.statusRow}>
						<View style={styles.statusCopy}>
							<Text style={styles.statusTitle}>{isActive ? strings.servicesForm.activeMarketplace : strings.servicesForm.hiddenMarketplace}</Text>
							<Text style={styles.helper}>{isActive ? strings.servicesForm.activeDescription : strings.servicesForm.hiddenDescription}</Text>
						</View>
						<Switch value={isActive} onValueChange={setIsActive} trackColor={{ false: colors.grey[300], true: colors.purple[600] }} thumbColor={colors.white[100]} ios_backgroundColor={colors.grey[300]} />
					</View>
				</Section>

				<View style={styles.actions}>
					<Pressable
						accessibilityRole="button"
						disabled={isSaving}
						onPress={saveService}
						style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
					>
						<IconX name="save-outline" origin={ICON_TYPE.IONICONS} size={20} color={colors.white[100]} />
						<Text style={styles.saveText}>{service?.id ? strings.commonForms.saveChanges : strings.commonForms.createService}</Text>
					</Pressable>
					<Pressable accessibilityRole="button" disabled={isSaving} onPress={() => navigation.goBack()} style={styles.cancelButton}>
						<Text style={styles.cancelText}>{strings.commonForms.cancel}</Text>
					</Pressable>
					{service ? <Pressable accessibilityRole="button" disabled={isSaving} onPress={confirmDelete} style={styles.deleteButton}><IconX name="trash-outline" origin={ICON_TYPE.IONICONS} size={18} color={colors.red[200]} /><Text style={styles.deleteText}>{strings.servicesForm.deleteService}</Text></Pressable> : null}
				</View>
			</ScrollView>

			<Modal visible={isSaving} transparent statusBarTranslucent>
				<View style={styles.savingOverlay}>
					<ActivityIndicator size="large" color={colors.white[100]} />
					<Text style={styles.savingText}>{service?.id ? 'Updating service...' : 'Creating service...'}</Text>
				</View>
			</Modal>

			<Modal visible={selector !== null} transparent animationType="fade" onRequestClose={() => setSelector(null)}>
				<Pressable style={styles.modalBackdrop} onPress={() => setSelector(null)}>
					<View style={styles.optionsSheet}>
						<Text style={styles.optionsTitle}>{selector === 'category' ? 'Choose category' : 'Choose duration'}</Text>
						{options.map(option => (
							<Pressable key={option} onPress={() => { selector === 'category' ? setCategory(option) : setDuration(option); setSelector(null); }} style={styles.optionRow}>
								<Text style={styles.optionText}>{option}</Text>
								{(selector === 'category' ? category : duration) === option ? <IconX name="checkmark" origin={ICON_TYPE.IONICONS} size={20} color={colors.purple[700]} /> : null}
							</Pressable>
						))}
					</View>
				</Pressable>
			</Modal>
		</View>
	);
}

function Section({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
	return <View style={styles.section}><View style={styles.sectionHeader}><View style={styles.headingGroup}><View style={styles.headingMark} /><Text style={styles.sectionTitle}>{title}</Text></View><Text style={styles.step}>{step}</Text></View>{children}</View>;
}

function FieldLabel({ text, required = false }: { text: string; required?: boolean }) {
	return <Text style={styles.label}>{text}{required ? <Text style={styles.required}> *</Text> : null}</Text>;
}

function SelectField({ value, icon, onPress, compact = false }: { value: string; icon: string; onPress: () => void; compact?: boolean }) {
	return <Pressable onPress={onPress} style={[styles.selectField, compact && styles.selectCompact]}><Text numberOfLines={1} style={styles.selectText}>{value}</Text><IconX name={icon} origin={ICON_TYPE.IONICONS} size={18} color={colors.grey[700]} /></Pressable>;
}
