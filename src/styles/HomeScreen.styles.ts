import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_50,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    textAlign: 'center',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: -20,
    elevation: 4,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.GRAY_600,
    marginTop: 4,
  },
  menuContainer: {
    padding: 16,
    marginTop: 16,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.GRAY_800,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.GRAY_800,
    marginBottom: 6,
  },
  menuItemSubtitle: {
    fontSize: 15,
    color: COLORS.GRAY_600,
    lineHeight: 22,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    // Add shadow
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4, // for Android
    marginRight: 12,
  },
  menuItemIconText: {
    fontSize: 28, // Make icon/emoji larger within the circle
    lineHeight: 32, // Ensure proper vertical centering
  },
  tipsContainer: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.WHITE,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.WHITE,
    marginBottom: 8,
    lineHeight: 20,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.ERROR_LIGHT,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 14,
    textAlign: 'center',
  },
  // Premium modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.LG,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.MD,
  },
  modalText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.BASE,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LG,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: COLORS.SUCCESS,
    padding: SPACING.MD,
    borderRadius: 8,
    marginBottom: SPACING.SM,
  },
  upgradeButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  cancelText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  // Welcome text styles
  welcomeText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    color: COLORS.WHITE,
    marginBottom: SPACING.SM,
  },
  // Menu item additional styles
  menuItemText: {
    flex: 1,
    marginLeft: SPACING.MD,
  },
  // Premium badge styles
  premiumBadge: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  }
});
