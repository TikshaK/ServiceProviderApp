import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Octicons from 'react-native-vector-icons/Octicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Foundation from 'react-native-vector-icons/Foundation';

export enum ICON_TYPE {
  IONICONS = 'ionicons',
  ANT_DESIGN = 'AntDesign',
  EVIL_ICONS = 'EvilIcons',
  FONT_AWESOME = 'FontAwesome',
  FONT_AWESOME5 = 'FontAwesome5',
  MATERIAL_ICONS = 'MaterialIcons',
  FEATHER_ICONS = 'Feather',
  ENTYPO = 'Entypo',
  OCTICONS = 'Octicons',
  MATERIAL_COMMUNITY = 'MaterialCommunityIcons',
  SIMPLELINE = 'SimpleLineIcons',
  FONTISTO = 'Fontisto',
  FOUNDATION = 'Foundation',
}

export interface IconXProps {
  origin?: ICON_TYPE;
  name: string;
  color?: string;
  size?: number;
  paddingLeft?: number;
  style?: any;
}

const IconX: React.FC<IconXProps> = ({
  origin = ICON_TYPE.IONICONS,
  name,
  color = '#00355F',
  size = 20,
  paddingLeft,
  style,
}) => {
  let Element: any = Ionicons;

  switch (origin) {
    case ICON_TYPE.ANT_DESIGN:
      Element = AntDesign;
      break;
    case ICON_TYPE.ENTYPO:
      Element = Entypo;
      break;
    case ICON_TYPE.MATERIAL_ICONS:
      Element = MaterialIcons;
      break;
    case ICON_TYPE.FONT_AWESOME5:
      Element = FontAwesome5;
      break;
    case ICON_TYPE.FEATHER_ICONS:
      Element = Feather;
      break;
    case ICON_TYPE.EVIL_ICONS:
      Element = EvilIcons;
      break;
    case ICON_TYPE.FONT_AWESOME:
      Element = FontAwesome;
      break;
    case ICON_TYPE.OCTICONS:
      Element = Octicons;
      break;
    case ICON_TYPE.MATERIAL_COMMUNITY:
      Element = MaterialCommunityIcons;
      break;
    case ICON_TYPE.SIMPLELINE:
      Element = SimpleLineIcons;
      break;
    case ICON_TYPE.FONTISTO:
      Element = Fontisto;
      break;
    case ICON_TYPE.FOUNDATION:
      Element = Foundation;
      break;
    case ICON_TYPE.IONICONS:
    default:
      Element = Ionicons;
      break;
  }

  return <Element 
  name={name}
  size={size} 
  color={color}
  style={[{ paddingLeft
  
   }, style]} 
  />;
};

export default IconX;
