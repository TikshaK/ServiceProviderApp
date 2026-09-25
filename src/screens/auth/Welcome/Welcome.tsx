import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, images, navigationStrings, scale, strings } from '../../../constants';
import { ICON_TYPE, IconX } from '../../../components';
import { styles } from './styles';

type UserRole = 'customer' | 'provider';

type RoleOptionProps = {
  role: UserRole;
  icon: string;
  icon_origin: ICON_TYPE;
  title: string;
  description: string;
  badge?: string;
  selectedRole: UserRole;
  onSelect: (role: UserRole) => void;
};

function RoleOption({
  role,
  icon,
  icon_origin,
  title,
  description,
  badge,
  selectedRole,
  onSelect,
}: RoleOptionProps) {
  const isSelected = role === selectedRole;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      onPress={() => onSelect(role)}
      style={({ pressed }) => [
        styles.roleCard,
        isSelected && styles.selectedRoleCard,
        pressed && styles.pressedCard,
      ]}>
      <View style={[styles.roleIcon,
      isSelected && styles.selectedRoleIcon]}>
        <IconX
          name={icon}
          origin={icon_origin}
          color={isSelected ? colors.white[100] : colors.purple[700]}
        />
      </View>
      <View style={styles.roleCopy}>
        <View style={styles.roleTitleRow}>
          <Text style={styles.roleTitle}>{title}</Text>
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
        </View>
        <Text style={styles.roleDescription}>{description}</Text>
      </View>
      <View style={[styles.radio, isSelected && styles.selectedRadio]}>
        <Text style={isSelected ? styles.checkmark : styles.radioDot}>
          {isSelected ? '✓' : '○'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function Welcome({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

  return (
    <View style={[styles.container, { 
      paddingTop: insets.top, 
      paddingBottom: insets.bottom 
      }]}> 
      <StatusBar barStyle="dark-content" />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        enableOnAndroid={true}
        bounces={false}
        enableAutomaticScroll
        extraScrollHeight={Platform.OS === 'android' ? 180 : 120}
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.logo}>
            <Image
              source={images.logo}
              style={{ width: scale(40), height: scale(40) }}
            />
            <View style={styles.logoAccent} />
          </View>

          <Text style={styles.heading}>{strings.welcome.heading}</Text>
          <Text style={styles.subheading}>{strings.welcome.subheading}</Text>
        </View>

        <View accessibilityRole="radiogroup" style={styles.options}>
          <RoleOption
            role="customer"
            icon="briefcase-outline"
            icon_origin={ICON_TYPE.IONICONS}
            title={strings.welcome.customerTitle}
            description={strings.welcome.customerDescription}
            selectedRole={selectedRole}
            onSelect={setSelectedRole}
          />
          <RoleOption
            role="provider"
            icon="engineering"
            icon_origin={ICON_TYPE.MATERIAL_ICONS}
            title={strings.welcome.providerTitle}
            description={strings.welcome.providerDescription}
            badge={strings.welcome.providerBadge}
            selectedRole={selectedRole}
            onSelect={setSelectedRole}
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('SignUp', { role: selectedRole })}
            style={({ pressed }) => [styles.continueButton, pressed && styles.pressedButton]}>
            <Text style={styles.continueText}>{strings.common.continue}</Text>
      
          </Pressable>
          <View style={styles.signInRow}>
            <Text style={styles.signInPrompt}>{strings.common.alreadyHaveAccount}</Text>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate(navigationStrings.LOGIN)}>
              <Text style={styles.signInText}>{strings.common.signIn}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

