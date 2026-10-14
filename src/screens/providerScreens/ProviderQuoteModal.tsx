import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CustomInput } from '../../components';
import { colors, fontSize, fonts, scale, verticalScale } from '../../constants';
import {
  firebaseAuth,
  getProviderPublicProfile,
  getServices,
  getUserProfile,
  submitOpenBookingQuote,
} from '../../services/firebase';
import { useAppSelector } from '../../store';
import type { OpenBookingListing } from '../../types/booking';
import { showToast } from '../../utils';

type QuoteTarget = Pick<OpenBookingListing, 'id' | 'category' | 'scheduledDate' | 'city'>;

type ProviderQuoteModalProps = {
  booking: QuoteTarget | null;
  onClose: () => void;
  onQuoteSent: (bookingId: string) => void;
};

export default function ProviderQuoteModal({
  booking,
  onClose,
  onQuoteSent,
}: ProviderQuoteModalProps) {
  const profile = useAppSelector(state => state.user.profile);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setQuoteAmount('');
  }, [booking?.id]);

  const handleAmountChange = (text: string) => {
    const sanitizedText = text.replace(/[^\d.]/g, '');
    const decimalIndex = sanitizedText.indexOf('.');
    if (
      sanitizedText.length > 10
      || sanitizedText.indexOf('.', decimalIndex + 1) !== -1
      || (decimalIndex !== -1 && sanitizedText.length - decimalIndex - 1 > 2)
    ) {
      return;
    }
    setQuoteAmount(sanitizedText);
  };

  const sendQuote = async () => {
    if (!booking) {
      console.error('[PROVIDER_QUOTE] submission stopped: no booking selected');
      return;
    }

    const amount = Number(quoteAmount);
    const validCurrencyAmount = quoteAmount.length <= 10
      && /^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(quoteAmount)
      && Number.isFinite(amount)
      && amount > 0;
    if (!validCurrencyAmount) {
      showToast({
        type: 'error',
        title: 'Enter a valid price',
        message: 'Enter an amount greater than zero with no more than two decimal places.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const authUser = firebaseAuth.currentUser;
      if (!authUser?.uid) {
        throw new Error('Your sign-in session could not be found. Please sign in again.');
      }

      let providerProfile = profile?.uid === authUser.uid && profile.role === 'provider' ? profile : null;
      let profileSource = providerProfile ? 'redux' : 'none';
      if (!providerProfile) {
        const publicProfile = await getProviderPublicProfile(authUser.uid);
        if (publicProfile?.role === 'provider') {
          providerProfile = {
            ...publicProfile,
            email: authUser.email ?? '',
            phone: authUser.phoneNumber ?? '',
          };
          profileSource = 'public';
        } else {
          providerProfile = await getUserProfile(authUser.uid);
          profileSource = providerProfile ? 'private' : 'none';
          if (!providerProfile) {
            const services = await getServices({ providerId: authUser.uid, activeOnly: false });
            const ownedService = services.find(service => service.providerId === authUser.uid);
            if (ownedService) {
              providerProfile = {
                uid: authUser.uid,
                email: authUser.email ?? '',
                fullName: ownedService.providerName || authUser.displayName || 'Provider',
                phone: authUser.phoneNumber ?? '',
                role: 'provider',
                serviceName: ownedService.title,
                category: ownedService.category,
              };
              profileSource = 'service';
            }
          }
        }
      }
      if (!providerProfile || providerProfile.role !== 'provider') {
        throw new Error('Your provider profile could not be loaded. Please sign in again and retry.');
      }

      console.log('[PROVIDER_QUOTE] provider profile resolved', {
        bookingId: booking.id,
        providerId: providerProfile.uid,
        source: profileSource,
      });
      await submitOpenBookingQuote(booking.id, booking.category, providerProfile, amount);
      onQuoteSent(booking.id);
      onClose();
      showToast({
        type: 'success',
        title: 'Quote sent',
        message: 'The customer can now review your price.',
      });
    } catch (error) {
      console.log('[PROVIDER_QUOTE] submission failed', {
        bookingId: booking.id,
        category: booking.category,
        providerId: profile?.uid ?? firebaseAuth.currentUser?.uid,
        error,
      });
      showToast({
        type: 'error',
        title: 'Unable to send quote',
        message: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={Boolean(booking)}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!submitting) onClose();
      }}
    >
      <View style={[styles.backdrop,{
 
      }]}>
        <View style={styles.modal}>
          <Text style={styles.title}>Send a quote</Text>
          <Text style={styles.subtitle}>
            {booking?.category} service · {booking?.scheduledDate} · {booking?.city}
          </Text>
          <Text style={styles.label}>Your price</Text>
          <CustomInput
            value={quoteAmount}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
            inputStyle={styles.input}
            containerStyle={styles.inputContainer}
            dropStyle={styles.inputWrap}
            leftIcon={<Text style={styles.currency}>$</Text>}
            showClearButton={false}
            maxLength={10}
            accessibilityLabel="Quote price"
          />
          <Text style={styles.hint}>
            The customer must approve your price before this booking is confirmed.
          </Text>
          <View style={styles.actions}>
            <Pressable
              style={styles.cancelButton}
              disabled={submitting}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.submitButton}
              disabled={submitting}
              onPress={sendQuote}
            >
              {submitting
                ? <ActivityIndicator color={colors.white[100]} />
                : <Text style={styles.submitText}>Submit quote</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(22),
    backgroundColor: 'rgba(24, 24, 27, 0.48)',
  },
  modal: {
    padding: scale(20),
    borderRadius: scale(18),
    backgroundColor: colors.white[100],
  },
  title: {
    fontFamily: fonts.Bold,
    fontSize: fontSize[20],
    color: colors.black[250],
  },
  subtitle: {
    marginTop: verticalScale(6),
    marginBottom: verticalScale(20),
    fontFamily: fonts.Regular,
    fontSize: fontSize[13],
    lineHeight: verticalScale(19),
    color: colors.grey[700],
  },
  label: {
    marginBottom: verticalScale(8),
    fontFamily: fonts.SemiBold,
    fontSize: fontSize[13],
    color: colors.black[250],
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: colors.purple[200],
    borderRadius: scale(12),
    backgroundColor: colors.white[100],
  },
  inputContainer: {
    minHeight: verticalScale(52),
    paddingHorizontal: scale(12),
  },
  input: {
    fontFamily: fonts.SemiBold,
    fontSize: fontSize[18],
    color: colors.black[250],
  },
  currency: {
    marginRight: scale(8),
    fontFamily: fonts.SemiBold,
    fontSize: fontSize[18],
    color: colors.purple[700],
  },
  hint: {
    marginTop: verticalScale(10),
    fontFamily: fonts.Regular,
    fontSize: fontSize[12],
    lineHeight: verticalScale(17),
    color: colors.grey[700],
  },
  actions: {
    flexDirection: 'row',
    gap: scale(10),
    marginTop: verticalScale(22),
  },
  cancelButton: {
    flex: 1,
    minHeight: verticalScale(46),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(11),
    backgroundColor: colors.purple[100],
  },
  cancelText: {
    fontFamily: fonts.SemiBold,
    fontSize: fontSize[14],
    color: colors.purple[700],
  },
  submitButton: {
    flex: 1,
    minHeight: verticalScale(46),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(11),
    backgroundColor: colors.purple[600],
  },
  submitText: {
    fontFamily: fonts.SemiBold,
    fontSize: fontSize[14],
    color: colors.white[100],
  },
});
