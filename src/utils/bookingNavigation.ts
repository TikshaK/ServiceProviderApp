import { getAddresses } from '../services/firebase';
import { navigationStrings } from '../constants';
import { showToast } from './toast';

type BookingNavigation = {
  navigate: (screen: string, params?: object) => void;
};

export async function navigateToBookingIfAddressExists(
  navigation: BookingNavigation,
  customerId: string | undefined,
  service?: object,
): Promise<void> {
  if (!customerId) {
    showToast({
      type: 'error',
      title: 'Unable to start booking',
      message: 'Your customer profile could not be loaded. Please sign in again.',
    });
    return;
  }

  try {
    const addresses = await getAddresses(customerId);
    if (addresses.length === 0) {
      showToast({
        type: 'info',
        title: 'Add a service address',
        message: 'Save an address before booking a service.',
      });
      navigation.navigate(navigationStrings.CUSTOMER_SAVED_ADDRESSES);
      return;
    }
  } catch (error) {
    console.error('[BOOKING] failed to check saved addresses', { customerId, error });
    showToast({
      type: 'error',
      title: 'Unable to check your address',
      message: 'Please try again before starting your booking.',
    });
    return;
  }

  navigation.navigate(
    navigationStrings.CUSTOMER_BOOK_SERVICE,
    service ? { service } : undefined,
  );
}
