import { getAuth } from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';

export const firebaseAuth = getAuth(getApp());
