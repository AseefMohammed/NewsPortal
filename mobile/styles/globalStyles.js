import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    ...theme.shadows.soft,
  },
  section: {
    marginBottom: theme.spacing.xl || 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontFamily: theme.fonts.regular.fontFamily,
    fontSize: theme.typography?.fontSize?.base || 16,
    color: theme.colors.text,
  },
  title: {
    fontFamily: theme.fonts.bold.fontFamily,
    fontSize: theme.typography?.fontSize?.xl || 20,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.fonts.medium.fontFamily,
    fontSize: theme.typography?.fontSize?.lg || 18,
    marginBottom: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  button: {
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontFamily: theme.fonts.bold.fontFamily,
    fontSize: theme.typography?.fontSize?.base || 16,
    color: theme.colors.surfaceUltraLight || '#fff',
  },
});