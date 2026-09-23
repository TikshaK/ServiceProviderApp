import React, { useState } from 'react';
import {
    Image, Pressable, ScrollView, StatusBar, Text,

    TextInput, View
} from 'react-native';
import { CustomHeader, ICON_TYPE, IconX } from '../../../../components';
import { colors, strings } from '../../../../constants';
import { firebaseAuth, updateUserProfile } from '../../../../services/firebase';
import { uploadImageToCloudinary } from '../../../../services/cloudinary';
import { useImagePicker, type ImageAsset } from '../../../../hooks/useImagePicker';
import { storage } from '../../../../services/storage';
import storageKeys from '../../../../constants/storageKeys';
import {
    setUserProfile, useAppDispatch,
    useAppSelector
} from '../../../../store';
import { UserProfile } from '../../../../types/user';
import { styles } from './styles';
import { showToast } from '../../../../utils';

type ProviderEditProfileProps = { navigation: any };

export default function ProviderEditProfile({ navigation }: ProviderEditProfileProps) {
    const dispatch = useAppDispatch();
    const profile = useAppSelector(state => state.user.profile);
    const authEmail = useAppSelector(state => state.auth.email);
    const [fullName, setFullName] = useState(profile?.fullName ?? '');
    const [serviceName, setServiceName] = useState(profile?.serviceName ?? '');
    const [phone, setPhone] = useState(profile?.phone ?? '');
    const [experience, setExperience] = useState(profile?.experience ?? '');
    const [category, setCategory] = useState(profile?.category ?? '');
    const [avatarUri, setAvatarUri] = useState(profile?.avatarUrl ?? '');
    const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { chooseSource, loading: pickerLoading } = useImagePicker();

    const saveChanges = async () => {
        if (!fullName.trim() || !serviceName.trim() || !phone.trim()) {
            showToast({ type: 'error', title: strings.alerts.missingInformation, message: 'Name, business name, and phone are required.' });
            return;
        }

        const uid = profile?.uid ?? firebaseAuth.currentUser?.uid;
        if (!uid) {
            showToast({ type: 'error', title: strings.alerts.sessionExpired, message: 'Please sign in again before editing your profile.' });
            return;
        }

        const updatedProfile: UserProfile = {
            uid,
            email: profile?.email ?? authEmail ?? '',
            fullName: fullName.trim(),
            phone: phone.trim(),
            role: profile?.role ?? 'provider',
            serviceName: serviceName.trim(),
            experience: experience.trim() || undefined,
            category: category.trim() || undefined,
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
        <View
            style={styles.container}
        >
            <StatusBar
                barStyle="dark-content"
            />
            <CustomHeader
                title={strings.profile.profileEditor}
                showBackButton onLeftPress={() => navigation.goBack()}
                backgroundColor={colors.purple[50]}
            />
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={styles.contextRow}
                >
                    <Text
                        style={styles.screenTitle}
                    >
                        Edit Profile

                    </Text>
                    <View
                        style={styles.accountBadge}
                    >
                        <IconX
                            name="checkmark-circle"
                            origin={ICON_TYPE.IONICONS}
                            size={15}
                            color={colors.purple[700]}
                        />
                        <Text
                            style={styles.accountBadgeText}
                        >
                            Provider account
                        </Text>
                    </View>
                </View>

                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrap}>
                        {avatarUri ?
                            <Image
                                source={{ uri: avatarUri }}
                                style={styles.avatar}
                            />
                            :
                            <View
                                style={styles.avatarPlaceholder}
                            >
                                <IconX
                                    name="person"
                                    origin={ICON_TYPE.IONICONS}
                                    size={34}
                                    color={colors.purple[700]}
                                />
                            </View>
                        }
                        <Pressable
                            accessibilityLabel="Change profile photo"
                            disabled={pickerLoading}
                            onPress={() => chooseSource(handleAvatarSelected, 1)}
                            style={styles.cameraButton}
                        >
                            <IconX
                                name="camera"
                                origin={ICON_TYPE.IONICONS}
                                size={17} color={colors.white[100]}
                            />
                        </Pressable>
                    </View>
                </View>

                <Section
                    title={strings.profile.personalInformation}
                    step="Step 1 of 3"
                >
                    <Field
                        label={strings.commonForms.fullName}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder={strings.commonForms.yourFullName}
                        icon="person-outline"
                    />
                    <Field
                        label={strings.commonForms.phoneNumber}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder={strings.commonForms.yourPhoneNumber}
                        keyboardType="phone-pad"
                        icon="call-outline"
                    />
                    <Field
                        label={strings.commonForms.emailAddress}
                        value={profile?.email ?? authEmail ?? ''}
                        onChangeText={() => undefined}
                        placeholder={strings.commonForms.yourEmailAddress}
                        icon="mail-outline"
                        editable={false}
                        helper={strings.commonForms.emailManaged}
                    />
                </Section>

                <Section
                    title={strings.profile.businessInformation}
                    step="Step 2 of 3"
                >
                    <Field
                        label={strings.profile.businessName}
                        value={serviceName} onChangeText={setServiceName}
                        placeholder={strings.profile.providerBusinessPlaceholder}
                        icon="business-outline"
                    />
                    <Field
                        label={strings.profile.businessCategory}
                        value={category} onChangeText={setCategory}
                        placeholder={strings.profile.categoryPlaceholder}
                        icon="briefcase-outline"
                    />
                    <Field
                        label={strings.profile.yearsExperience}
                        value={experience} onChangeText={setExperience}
                        placeholder={strings.profile.experiencePlaceholder}
                        keyboardType="number-pad"
                        icon="ribbon-outline"
                    />
                </Section>



                <View style={styles.actions}>
                    <Pressable accessibilityRole="button" disabled={loading} onPress={saveChanges} style={[styles.saveButton, loading && styles.disabledButton]}><IconX name="save-outline" origin={ICON_TYPE.IONICONS} size={20} color={colors.white[100]} /><Text style={styles.saveText}>{loading ? 'Saving...' : 'Save Changes'}</Text></Pressable>
                    <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

function Section({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
    return <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <View style={styles.headingGroup}>
                <View style={styles.headingMark} />
                <Text style={styles.sectionTitle}>{title}</Text></View><Text style={styles.step}>{step}</Text></View>{children}</View>;
}

function Field({ label, value, onChangeText, placeholder, icon, keyboardType = 'default', editable = true, helper }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; icon: string; keyboardType?: 'default' | 'phone-pad' | 'number-pad'; editable?: boolean; helper?: string }) {
    return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={[styles.inputWrap, !editable && styles.inputDisabled]}><IconX name={icon} origin={ICON_TYPE.IONICONS} size={19} color={editable ? colors.grey[700] : colors.grey[400]} /><TextInput value={value} onChangeText={onChangeText} editable={editable} keyboardType={keyboardType} placeholder={placeholder} placeholderTextColor={colors.grey[400]} style={styles.input} /></View>{helper ? <Text style={styles.helper}>{helper}</Text> : null}</View>;
}
