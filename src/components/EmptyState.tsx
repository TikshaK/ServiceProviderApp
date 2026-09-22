import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../constants';
import IconX, { ICON_TYPE } from './IconX';
import { styles } from './emptyStateStyles';

type EmptyStateProps = {
  title?: string;
  message?: string;
  icon?: string;
};

export default function EmptyState({ title = 'No records found', message = 'There is nothing to show here yet.', icon = 'folder-open-outline' }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}><IconX name={icon} origin={ICON_TYPE.IONICONS} size={28} color={colors.purple[700]} /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}
