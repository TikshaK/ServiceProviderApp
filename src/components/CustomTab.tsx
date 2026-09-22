import React from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fonts, fontSize, scale, verticalScale } from '../constants';

export type CustomTabOption = {
  key: string;
  label: string;
  count?: number;
};

export type CustomTabProps = {
  tabs: CustomTabOption[];
  activeKey: string;
  onChange: (key: string) => void;
  equalWidth?: boolean;
  activeColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

const CustomTab: React.FC<CustomTabProps> = ({
  tabs,
  activeKey,
  onChange,
  equalWidth = false,
  activeColor = colors.purple[600],
  containerStyle,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    scrollEnabled={!equalWidth}
    style={[styles.container, containerStyle]}
    contentContainerStyle={equalWidth ? styles.equalWidthRow : styles.intrinsicRow}
  >
    {tabs.map(tab => {
      const isActive = tab.key === activeKey;
      return (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onChange(tab.key)}
          activeOpacity={0.7}
          style={[
            equalWidth ? styles.equalWidthItem : styles.tabButton,
            isActive && { backgroundColor: activeColor, borderColor: activeColor },
          ]}
        >
          <Text numberOfLines={1} style={[styles.tabText, isActive && styles.activeTabText]}>{tab.label}</Text>
          {tab.count !== undefined && (
            <View style={[styles.badge, isActive && styles.activeBadge]}>
              <Text style={[styles.badgeText, isActive && styles.activeBadgeText]}>{tab.count}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    height: verticalScale(50),
    marginVertical: verticalScale(8),
  },
  intrinsicRow: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(4),
    gap: scale(8),
    alignItems: 'center',
  },
  equalWidthRow: {
    flexGrow: 1,
    flexDirection: 'row',
  },
  tabButton: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: scale(999),
    backgroundColor: colors.white[100],
    borderWidth: scale(1),
    borderColor: colors.purple[200],
  },
  equalWidthItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(8),
  },
  tabText: {
    flexShrink: 0,
    fontFamily: fonts.SemiBold,
    color: colors.grey[700],
    fontSize: fontSize[13],
    lineHeight: verticalScale(18),
  },
  activeTabText: {
    color: colors.white[100],
  },
  badge: {
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(1),
    borderRadius: scale(999),
    backgroundColor: colors.purple[100],
  },
  activeBadge: {
    backgroundColor: `${colors.white[100]}33`,
  },
  badgeText: {
    fontFamily: fonts.Bold,
    color: colors.purple[700],
    fontSize: fontSize[11],
    lineHeight: verticalScale(14),
  },
  activeBadgeText: {
    color: colors.white[100],
  },
});

export default CustomTab;
