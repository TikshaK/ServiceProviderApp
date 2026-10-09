import { Platform, StyleSheet } from 'react-native';
import { colors, fonts, fontSize, scale, verticalScale } from '../../../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.purple[50],
  },
  searchArea: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(8),
  },
  searchInputContainer: {
    backgroundColor: colors.white[100],
    borderRadius: scale(14),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(24),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  summaryText: {
    fontFamily: fonts.SemiBold,
    color: colors.black[250],
    fontSize: fontSize[16],
    fontWeight: '600',
  },
  summaryPill: {
    minWidth: scale(30),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(999),
    backgroundColor: colors.purple[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryPillText: {
    fontFamily: fonts.Bold,
    color: colors.purple[700],
    fontSize: fontSize[12],
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: verticalScale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateWrap: {
    marginTop: verticalScale(20),
  },
  listContainer: {
    gap: verticalScale(12),
  },
  bookingCard: {
    backgroundColor: colors.white[100],
    borderRadius: scale(16),
    padding: scale(14),
    gap: verticalScale(10),
    ...Platform.select({
      ios: {
        shadowColor: colors.black[400],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  avatarWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: colors.purple[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.Bold,
    color: colors.purple[700],
    fontSize: fontSize[16],
    fontWeight: '700',
  },
  cardHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  customerName: {
    fontFamily: fonts.SemiBold,
    color: colors.black[250],
    fontSize: fontSize[16],
    fontWeight: '600',
  },
  serviceLabel: {
    fontFamily: fonts.Regular,
    color: colors.grey[700],
    fontSize: fontSize[12],
    marginTop: verticalScale(2),
  },
  statusPill: {
    backgroundColor: '#FFFBEB',
    borderRadius: scale(999),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
  },
  statusText: {
    fontFamily: fonts.SemiBold,
    color: '#B45309',
    fontSize: fontSize[11],
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  metaText: {
    fontFamily: fonts.Regular,
    color: colors.grey[700],
    fontSize: fontSize[13],
    flexShrink: 1,
  },
  notesText: {
    fontFamily: fonts.Regular,
    color: colors.grey[700],
    fontSize: fontSize[12],
    lineHeight: verticalScale(18),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalScale(2),
    gap: scale(8),
  },
  amountText: {
    fontFamily: fonts.SemiBold,
    color: colors.black[250],
    fontSize: fontSize[13],
    fontWeight: '600',
  },
  sendQuoteButton: {
    backgroundColor: colors.purple[500],
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: scale(10),
  },
  sendQuoteText: {
    fontFamily: fonts.SemiBold,
    color: colors.white[100],
    fontSize: fontSize[12],
    fontWeight: '600',
  },
});
