import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24, // theme.spacing.lg
    paddingTop: 24, // theme.spacing.lg
  },
  card: {
    borderRadius: 16, // theme.borderRadius.lg
    padding: 24, // theme.spacing.lg
    marginBottom: 24, // theme.spacing.lg
  },
  section: {
    marginBottom: 32, // theme.spacing.xl
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16, // theme.typography.fontSize.base
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 20, // theme.typography.fontSize.xl
    marginBottom: 16, // theme.spacing.md
  },
  subtitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: 18, // theme.typography.fontSize.lg
    marginBottom: 8, // theme.spacing.sm
  },
  button: {
    borderRadius: 12, // theme.borderRadius.md
    paddingVertical: 16, // theme.spacing.md
    alignItems: 'center',
    marginVertical: 8, // theme.spacing.sm
  },
  buttonText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16, // theme.typography.fontSize.base
  },
});