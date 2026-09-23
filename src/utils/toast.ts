import Toast from 'react-native-toast-message';
import { fonts, fontSize, sHeight } from '../constants';

type ToastType = 'success' | 'error' | 'info';

interface ShowToastProps {
  type?: ToastType;
  title?: string;
  message?: string;
}

export const showToast = ({ type = 'success', title, message }: ShowToastProps) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    topOffset: sHeight * 0.06,
    visibilityTime: 2500,
    autoHide: true,
    text1Style: {
      fontSize: fontSize[16],
      fontFamily: fonts.Bold,
    },
    text2Style: {
      fontSize: fontSize[12],
      fontFamily: fonts.Regular,
    },
  });
};
