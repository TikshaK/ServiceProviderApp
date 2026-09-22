import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
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
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ visible, title, message, confirmText, cancelText = 'Cancel', icon = 'warning', destructive = false, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={event => event.stopPropagation()}>
          <View style={[styles.icon, destructive && styles.iconDestructive]}><IconX name={icon} origin={ICON_TYPE.MATERIAL_ICONS} size={25} color={destructive ? colors.red[200] : colors.purple[700]} /></View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable style={[styles.confirmButton, destructive && styles.confirmButtonDestructive]} onPress={onConfirm}><Text style={styles.confirmText}>{confirmText}</Text></Pressable>
            <Pressable style={styles.cancelButton} onPress={onCancel}><Text style={styles.cancelText}>{cancelText}</Text></Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
