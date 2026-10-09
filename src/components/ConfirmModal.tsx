import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { colors } from '../constants';
import IconX, { ICON_TYPE } from './IconX';
import { styles } from './confirmModalStyles';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  icon?: string;
  destructive?: boolean;
  showPasswordInput?: boolean;
  passwordPlaceholder?: string;
  onConfirm: (password?: string) => void;
  onCancel: () => void;
};

export default function ConfirmModal({ visible, title, message, confirmText, cancelText = 'Cancel', icon = 'warning', destructive = false, showPasswordInput = false, passwordPlaceholder = 'Enter your password', onConfirm, onCancel }: ConfirmModalProps) {
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    setPassword('');
    onConfirm(showPasswordInput ? password : undefined);
  };

  const handleCancel = () => {
    setPassword('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={styles.card} onPress={event => event.stopPropagation()}>
          <View style={[styles.icon, destructive && styles.iconDestructive]}><IconX name={icon} origin={ICON_TYPE.MATERIAL_ICONS} size={25} color={destructive ? colors.red[200] : colors.purple[700]} /></View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {showPasswordInput && (
            <TextInput
              style={styles.passwordInput}
              placeholder={passwordPlaceholder}
              placeholderTextColor={colors.grey[700]}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />
          )}
          <View style={styles.actions}>
            <Pressable
              style={[styles.confirmButton, destructive && styles.confirmButtonDestructive, showPasswordInput && !password && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={showPasswordInput && !password}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={handleCancel}><Text style={styles.cancelText}>{cancelText}</Text></Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
