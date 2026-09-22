import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  Pressable,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fonts } from '../constants';
import { fontSize } from '../constants/metrics';
import IconX, { ICON_TYPE } from './IconX';

interface CustomSearchBarProps extends TextInputProps {
  searchText?: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  containerStyles?: StyleProp<ViewStyle>;
  inputStyles?: StyleProp<TextStyle>;
  onSearchPress?: () => void;
  onPress?: () => void;
  onFilterPress?: () => void;
  onClear?: () => void;
  showFilter?: boolean;
}

const CustomSearchBar: React.FC<CustomSearchBarProps> = ({
  searchText = '',
  setSearchText,
  containerStyles,
  inputStyles,
  placeholder = 'Search...',
  onSearchPress,
  onPress,
  onFilterPress,
  onClear,
  showFilter = false,
  ...rest
}) => {
  const handleClear = () => {
    setSearchText('');
    onClear?.();
  };

  const inputWrapper = (
    <View style={styles.searchInputWrapper}>
      <IconX
        name="search"
        size={20}
        color={colors.grey[450]}
        origin={ICON_TYPE.IONICONS}
        style={styles.searchIcon}
      />
      <TextInput
        {...rest}
        editable={!onPress && rest.editable !== false}
        pointerEvents={onPress ? 'none' : 'auto'}
        value={searchText}
        style={[styles.searchInput, inputStyles]}
        placeholder={placeholder}
        placeholderTextColor={colors.grey[400]}
        onChangeText={setSearchText}
        returnKeyType="search"
        onSubmitEditing={onSearchPress}
      />
      {!!searchText && (
        <TouchableOpacity
          accessibilityLabel="Clear search"
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.clearButton}
        >
          <IconX
            name="close-circle"
            size={18}
            color={colors.grey[400]}
            origin={ICON_TYPE.IONICONS}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.searchContainer, containerStyles]}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={placeholder}
          onPress={onPress}
          style={styles.inputPressable}
        >
          {inputWrapper}
        </Pressable>
      ) : inputWrapper}

      {showFilter && (
        <TouchableOpacity
          accessibilityLabel="Filter search results"
          style={styles.filterButton}
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <IconX
            name="sliders"
            size={20}
            color={colors.white[100]}
            origin={ICON_TYPE.FEATHER_ICONS}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: colors.grey[200],
  },
  inputPressable: {
    flex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize[14],
    fontFamily: fonts.Regular,
    color: colors.black[500],
    padding: 0,
    height: '100%',
  },
  clearButton: {
    marginLeft: 8,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.purple[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomSearchBar;
