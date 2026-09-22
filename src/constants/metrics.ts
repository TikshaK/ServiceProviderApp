import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const designWidth = 375;
const designHeight = 812;

interface Metrics {
  screenWidth: number;
  screenHeight: number;
}

const metrics: Metrics = {
  screenWidth: width < height ? width : height,
  screenHeight: width < height ? height : width,

};

export const fontSize = {
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  16: 16,
  17: 17,
  18: 18,
  20: 20,
  21: 21,
  22: 22,
  24: 24,
  26: 26,
  28: 28,
  30: 30,
  34: 34,
  44: 44,

}

export default metrics;
export const sWidth = width;
export const sHeight = height;
export const scale = (size: number) => (sWidth / designWidth) * size;
export const verticalScale = (size: number) => (sHeight / designHeight) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;