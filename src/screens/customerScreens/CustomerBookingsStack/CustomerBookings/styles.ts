import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../../constants';
import metrics, { fontSize, scale, verticalScale } from '../../../../constants/metrics';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white[100] ?? '#FAFAFA',
  },
  header: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(250, 248, 255, 0.8)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  logo: {
    width: scale(32),
    height: verticalScale(32),
    resizeMode: 'contain',
  },
  headerTitleContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: fontSize[14],
    fontFamily: fonts.Bold,
    color: colors.black[500],
    lineHeight: verticalScale(20),
  },
  headerSubtitle: {
    fontSize: fontSize[12],
    fontFamily: fonts.Regular,
    color: colors.grey[700],
    lineHeight: verticalScale(16),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  notificationBtn: {
    width: scale(44),
    height: verticalScale(44),
    borderRadius: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: verticalScale(8),
    right: scale(8),
    width: scale(8),
    height: verticalScale(8),
    borderRadius: scale(4),
    backgroundColor: colors.purple[700],
    borderWidth: scale(2),
    borderColor: colors.white[100],
  },
  profileAvatar: {
    width: scale(32),
    height: verticalScale(32),
    borderRadius: scale(16),
    backgroundColor: colors.purple[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(80),
  },
  tabsScrollView: {
    maxHeight: verticalScale(50),
    marginBottom: verticalScale(16),
    marginTop: verticalScale(4),
  },
  feedContainer: {
    gap: scale(12),
  },
  card: {
    backgroundColor: colors.white[100],
    borderRadius: scale(16),
    padding: scale(16),
    shadowColor: colors.grey[400],
    shadowOffset: { width: scale(0), height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: scale(3),
    elevation: 2,
    gap: scale(14),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  cardDateText: {
    fontSize: fontSize[11],
    fontFamily: fonts.SemiBold,
    color: colors.black[500],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(2),
    borderRadius: scale(12),
  },
  statusBadgeAccepted: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeCancelled: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: fontSize[11],
    fontFamily: fonts.SemiBold,
  },
  statusTextAccepted: {
    color: '#059669',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextCompleted: {
    color: '#059669',
  },
  statusTextCancelled: {
    color: '#DC2626',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(12),
  },
  cardImage: {
    width: scale(56),
    height: verticalScale(56),
    borderRadius: scale(12),
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize[16],
    fontFamily: fonts.SemiBold,
    color: colors.black[500],
  },
  cardProvider: {
    fontSize: fontSize[13],
    fontFamily: fonts.Regular,
    color: colors.grey[700],
    marginTop: verticalScale(2),
  },
  cardSpecialist: {
    fontSize: fontSize[12],
    fontFamily: fonts.Regular,
    color: colors.grey[700],
    marginTop: verticalScale(2),
  },
  cardLocationPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: verticalScale(8),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    flex: 1,
    paddingRight: scale(16),
  },
  locationText: {
    fontSize: fontSize[13],
    fontFamily: fonts.Regular,
    color: colors.grey[700],
  },
  priceText: {
    fontSize: fontSize[16],
    fontFamily: fonts.Bold,
    color: colors.black[500],
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    paddingTop: verticalScale(4),
  },
  btnPrimary: {
    flex: 1,
    height: verticalScale(40),
    borderRadius: scale(12),
    backgroundColor: colors.purple[700],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: scale(6),
  },
  btnPrimaryText: {
    fontSize: fontSize[12],
    fontFamily: fonts.SemiBold,
    color: colors.white[100],
  },
  btnPrimaryDisabled: {
    backgroundColor: colors.purple[500],
    opacity: 0.6,
  },
  btnPrimaryTextDisabled: {
    color: colors.white[100],
  },
  btnSecondary: {
    flex: 1,
    height: verticalScale(40),
    borderRadius: scale(12),
    backgroundColor: colors.grey[100] ?? '#F2F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontSize: fontSize[12],
    fontFamily: fonts.SemiBold,
    color: colors.purple[700],
  },
  btnIconOnly: {
    width: scale(40),
    height: verticalScale(40),
    borderRadius: scale(12),
    backgroundColor: colors.grey[100] ?? '#F2F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    backgroundColor: colors.white[100],
    borderRadius: scale(16),
    padding: scale(24),
    alignItems: 'center',
    shadowColor: colors.grey[400],
    shadowOffset: { width: scale(0), height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: scale(3),
    elevation: 2,
  },
  emptyIconContainer: {
    width: scale(48),
    height: verticalScale(48),
    borderRadius: scale(24),
    backgroundColor: colors.grey[100] ?? '#F2F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
  },
  emptyTitle: {
    fontSize: fontSize[16],
    fontFamily: fonts.SemiBold,
    color: colors.black[500],
    marginBottom: verticalScale(4),
  },
  emptyDesc: {
    fontSize: fontSize[13],
    fontFamily: fonts.Regular,
    color: colors.grey[700],
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  emptyRefund: {
    fontSize: fontSize[12],
    fontFamily: fonts.Regular,
    color: colors.grey[700],
    backgroundColor: colors.grey[100] ?? '#F2F3FF',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  }
});