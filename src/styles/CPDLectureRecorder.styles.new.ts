import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';

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
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.GRAY_800,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    color: COLORS.TEXT_PRIMARY,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  recordingContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordingStatus: {
    alignItems: 'center',
    marginBottom: SPACING.MD,
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
  readyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY_600,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  recordButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  stopButton: {
    backgroundColor: COLORS.ERROR,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
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
});
