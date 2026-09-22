import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../../constants';
import { fontSize, sWidth, scale, verticalScale } from '../../../../constants/metrics';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white[100],
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[100] ?? '#EEEEEE',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(16),
    paddingBottom: verticalScale(40),
    gap: scale(16),
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white[100],
    padding: scale(16),
    borderRadius: scale(12),
    shadowColor: colors.grey[400],
    shadowOffset: { width: scale(0), height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: scale(3),
    elevation: 2,
  },
  activeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: scale(8),
    height: verticalScale(8),
    borderRadius: scale(4),
    backgroundColor: colors.green[500],
    marginRight: scale(8),
  },
  activeCountText: {
    fontSize: fontSize[14],
    fontFamily: fonts.SemiBold,
    color: colors.black[500],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purple[700],
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: scale(12),
  },
  addButtonText: {
    color: colors.white[100],
    fontFamily: fonts.SemiBold,
    fontSize: fontSize[14],
    marginLeft: scale(4),
  },
  serviceList: {
    gap: scale(12),
  },
  card: {
    backgroundColor: colors.white[100],
    borderRadius: scale(16),
    padding: scale(16),
    shadowColor: colors.grey[400],
    shadowOffset: { width: scale(0), height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  cardInactive: {
    opacity: 0.7,
  },
  cardTop: {
    flexDirection: 'row',
    marginBottom: verticalScale(12),
  },
  imageContainer: {
    width: scale(80),
    height: verticalScale(80),
    borderRadius: scale(12),
    overflow: 'hidden',
    marginRight: scale(12),
    position: 'relative',
    backgroundColor: colors.grey[100],
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  imageInactive: {
    opacity: 0.6,
  },
  iconOverlay: {
    position: 'absolute',
    top: verticalScale(4),
    left: scale(4),
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: scale(12),
    width: scale(24),
    height: verticalScale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(4),
  },
  serviceTitle: {
    fontSize: fontSize[16],
    fontFamily: fonts.SemiBold,
    color: colors.black[500],
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(4),
  },
  editText: {
    fontSize: fontSize[12],
    fontFamily: fonts.SemiBold,
    color: colors.grey[600],
    marginLeft: scale(2),
  },
  serviceDesc: {
    fontSize: fontSize[13],
    fontFamily: fonts.Regular,
    color: colors.grey[700],
    marginBottom: verticalScale(8),
    lineHeight: verticalScale(18),
  },
  tagsRow: {
    flexDirection: 'row',
    gap: scale(8),
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grey[100] ?? '#F5F5F5',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(100),
  },
  tagText: {
    fontSize: fontSize[12],
    fontFamily: fonts.SemiBold,
    color: colors.grey[600],
    marginLeft: scale(4),
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.grey[100] ?? '#F5F5F5',
    padding: scale(12),
    borderRadius: scale(12),
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: fontSize[12],
    fontFamily: fonts.Regular,
    color: colors.grey[600],
  },
  priceValue: {
    fontSize: fontSize[18],
    fontFamily: fonts.Bold,
    color: colors.purple[700],
  },
  priceValueInactive: {
    color: colors.grey[600],
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(100),
  },
  statusActive: {
    backgroundColor: '#E0E7FF', // surface-container from mockup approximation
  },
  statusInactive: {
    backgroundColor: colors.grey[200],
  },
  statusText: {
    fontSize: fontSize[12],
    fontFamily: fonts.SemiBold,
  },
  statusTextActive: {
    color: colors.purple[700],
  },
  statusTextInactive: {
    color: colors.grey[600],
  },
});