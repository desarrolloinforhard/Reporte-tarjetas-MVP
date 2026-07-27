import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

type FeedbackStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function FeedbackState({
  eyebrow = 'Información',
  title,
  description,
  actionLabel,
  onAction,
}: FeedbackStateProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted }]}>
      <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
        <Text style={[styles.iconText, { color: colors.primary }]}>IH</Text>
      </View>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      {actionLabel && onAction ? (
        <Button variant="secondary" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 280,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconText: {
    fontSize: 14,
    fontWeight: '900',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    textAlign: 'center',
    fontSize: 21,
    fontWeight: '800',
  },
  description: {
    maxWidth: 520,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
});
