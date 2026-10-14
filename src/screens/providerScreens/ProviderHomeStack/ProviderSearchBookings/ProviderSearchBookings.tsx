import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CustomHeader, CustomSearchBar, EmptyState, ICON_TYPE, IconX } from '../../../../components';
import { colors, navigationStrings } from '../../../../constants';
import { subscribeToAllOpenBookings } from '../../../../services/firebase';
import { useAppSelector } from '../../../../store';
import { hasActiveProviderQuote, type OpenBookingListing } from '../../../../types/booking';
import ProviderQuoteModal from '../../ProviderQuoteModal';
import { styles } from './styles';

export default function ProviderSearchBookings({ navigation }: { navigation: any }) {
  const profile = useAppSelector(state => state.user.profile);
  const [bookings, setBookings] = useState<OpenBookingListing[]>([]);
  const [quoteBooking, setQuoteBooking] = useState<OpenBookingListing | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      const unsubscribe = subscribeToAllOpenBookings(items => {
        if (!active) return;
        setBookings(items);
        setLoading(false);
      }, error => {
        console.error('[PROVIDER_SEARCH_BOOKINGS] subscription failed', error);
        if (active) setLoading(false);
      });
      return () => {
        active = false;
        unsubscribe();
      };
    }, []),
  );

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return bookings;

    return bookings.filter(item => {
      const customerMatch = item.customerName.toLowerCase().includes(normalizedQuery);
      const categoryMatch = item.category.toLowerCase().includes(normalizedQuery);
      const cityMatch = item.city.toLowerCase().includes(normalizedQuery);
      return customerMatch || categoryMatch || cityMatch;
    });
  }, [bookings, query]);

  const openDetails = (booking: OpenBookingListing) => {
    navigation.navigate(navigationStrings.PROVIDER_BOOKING_DETAILS, {
      booking: {
        id: booking.id,
        clientName: booking.customerName,
        customerName: booking.customerName,
        serviceTitle: `${booking.category} service`,
        category: booking.category,
        status: 'Pending',
        dateText: `${booking.scheduledDate} • ${booking.scheduledTime}`,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        address: booking.city,
        city: booking.city,
        amount: 'Awaiting quote',
        notes: booking.specialInstructions,
        isOpenBooking: true,
        quotes: booking.quotes,
        quoteHistory: booking.quoteHistory,
        hasSentQuote: hasActiveProviderQuote(booking, profile?.uid),
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <CustomHeader
        title="Search Bookings"
        showBackButton
        onLeftPress={() => navigation.goBack()}
      />

      <View style={styles.searchArea}>
        <CustomSearchBar
          placeholder="Search by category or customer name"
          searchText={query}
          setSearchText={setQuery}
          containerStyles={styles.searchInputContainer}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            Open requests
          </Text>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillText}>
              {filteredBookings.length}
            </Text>
          </View>
        </View>

        {loading ? (
          <View
            style={styles.loadingContainer}
          >
            <ActivityIndicator
              size="small"
              color={colors.purple[700]}
            />
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyStateWrap}>
            <EmptyState
              title="No open requests found"
              message="Try a different customer name or category to search for a request."
              icon="search-outline"
            />
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredBookings.map(booking => (
              <Pressable
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => openDetails(booking)}
                accessibilityRole="button"
              >
                <View style={styles.cardHeader}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>
                      {booking.customerName.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.cardHeaderText}>
                    <Text style={styles.customerName}>
                      {booking.customerName}
                    </Text>
                    <Text style={styles.serviceLabel}>
                      {booking.category} service
                    </Text>
                  </View>

                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>
                      Open

                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <IconX
                    name="location-outline"
                    origin={ICON_TYPE.IONICONS}
                    size={16}
                    color={colors.purple[700]}
                  />
                  <Text style={styles.metaText}
                  >
                    {booking.city}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <IconX
                    name="time-outline"
                    origin={ICON_TYPE.IONICONS}
                    size={16}
                    color={colors.purple[700]}
                  />
                  <Text
                    style={styles.metaText}
                  >
                    {booking.scheduledDate} • {booking.scheduledTime}
                  </Text>
                </View>

                {booking.specialInstructions ? (
                  <Text
                    style={styles.notesText}
                    numberOfLines={2}
                  >
                    {booking.specialInstructions}
                  </Text>
                ) : null}

                <View style={styles.footerRow}>
                  <Text style={styles.amountText}>
                    Awaiting quote
                  </Text>
                  {(() => {
                    const hasQuoted = hasActiveProviderQuote(booking, profile?.uid);
                    return (
                      <Pressable
                        style={[styles.sendQuoteButton, hasQuoted && { backgroundColor: colors.grey[400] }]}
                        onPress={event => {
                          event.stopPropagation();
                          if (!hasQuoted) setQuoteBooking(booking);
                        }}
                        accessibilityRole="button"
                      >
                        <Text style={styles.sendQuoteText}>
                          {hasQuoted ? 'Already sent' : 'Send quote'}
                        </Text>
                      </Pressable>
                    );
                  })()}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      <ProviderQuoteModal
        booking={quoteBooking}
        onClose={() => setQuoteBooking(null)}
        onQuoteSent={() => setQuoteBooking(null)}
      />
    </View>
  );
}
