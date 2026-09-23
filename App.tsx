import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, useColorScheme, View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { store, useAuthListener } from './src/store';
import Toast from 'react-native-toast-message';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  useAuthListener();

  return (
    <NavigationContainer>
      <View style={{
        flex: 1,
        paddingTop: insets.top
      }}>
        <RootNavigator />
      </View>
        <Toast />
    </NavigationContainer>
  );
}

export default App;
