import { StyleSheet } from 'react-native';
import { COLORS } from '../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_50,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY_600,
    lineHeight: 22,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.GRAY_800,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: 8,
    padding: 16,
    backgroundColor: COLORS.WHITE,
    color: COLORS.TEXT_PRIMARY,
  },

  // Recording section styles
  recordingContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordingStatus: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.ERROR,
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    color: COLORS.ERROR,
    fontWeight: '500',
  },
  readyText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },

  // Button styles
  recordingButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  pauseButton: {
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  resumeButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  stopButton: {
    backgroundColor: COLORS.ERROR,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
  },

  // Additional input styles
  tagsContainer: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addTagButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  addTagButtonText: {
    color: COLORS.WHITE,
    fontWeight: '500',
  },
  tag: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: COLORS.PRIMARY,
    marginRight: 4,
  },
  tagRemoveButton: {
    padding: 4,
  },
  tagRemoveText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Notes section
  notesInput: {
    height: 120,
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
  },

  // Summary section styles
  summaryContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.GRAY_900,
    lineHeight: 20,
  },
  summaryTextContainer: {
    backgroundColor: COLORS.GRAY_50,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.GRAY_500,
    fontStyle: 'italic',
  },

  // Session info styles
  sessionInfo: {
    marginBottom: 16,
  },
  sessionText: {
    fontSize: 14,
    color: COLORS.GRAY_600,
  },

  // Tag input styles
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  tagItem: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  removeTagText: {
    color: COLORS.PRIMARY,
    marginLeft: 6,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Error styles
  errorContainer: {
    backgroundColor: COLORS.ERROR_LIGHT,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 14,
  },

  // Action button styles
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY_300,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    flex: 1,
    backgroundColor: COLORS.GRAY_200,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: COLORS.GRAY_800,
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading states
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
});
  recordingContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  recordingStatus: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    color: COLORS.ERROR,
    fontWeight: '500',
  },
  readyText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingStatus: {
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  recordingDuration: {
    fontSize: 14,
    color: COLORS.GRAY_600,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLORS.GRAY_200,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  secondaryButtonText: {
    color: COLORS.GRAY_800,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.GRAY_800,
    marginBottom: 8,
  },

  tag: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
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
  clearAllButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  clearAllText: {
    color: COLORS.GRAY_600,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  label: {
    ...TYPOGRAPHY.LABEL,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  recordingContainer: {
    marginBottom: SPACING.LG,
  },
  recordingButtons: {
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    marginBottom: SPACING.LG,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  actionButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY_500,
  },
  actionButtonText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  summaryTextContainer: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    backgroundColor: COLORS.GRAY_50,
  },
  summaryText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL,
  },
  placeholderText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_DISABLED,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: SPACING.MD,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.SM,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    marginRight: SPACING.SM,
  },
  addTagButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.SM,
    justifyContent: 'center',
  },
  addTagButtonText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    backgroundColor: COLORS.PRIMARY + '20',
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    marginRight: SPACING.SM,
    marginBottom: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.PRIMARY,
    marginRight: SPACING.XS,
  },
  removeTagText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  recordButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  stopButton: {
    backgroundColor: COLORS.ERROR,
  },
  readyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY_600,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.SM,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.ERROR,
    marginRight: SPACING.SM,
  },
  recordingText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.ERROR,
  },
  sessionInfo: {
    marginTop: SPACING.MD,
    alignItems: 'center',
  },
  sessionText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.LG,
  },
  saveButton: {
    backgroundColor: COLORS.SUCCESS,
    flex: 2,
    marginRight: SPACING.SM,
  },
  clearButton: {
    backgroundColor: COLORS.GRAY_200,
    flex: 1,
    marginLeft: SPACING.SM,
  },
  clearButtonText: {
    color: COLORS.GRAY_700,
  }
});
