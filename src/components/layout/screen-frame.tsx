import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

type ScreenFrameProps = PropsWithChildren<{
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
}>;

export function ScreenFrame({
  title,
  description,
  eyebrow = 'Reportes de Tarjetas',
  actions,
  children,
}: ScreenFrameProps) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={[styles.scroll, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
          </View>
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    maxWidth: 1440,
    alignSelf: 'stretch',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 104,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  heading: {
    flex: 1,
    minWidth: 260,
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.title,
    lineHeight: 35,
    fontWeight: '900',
  },
  description: {
    maxWidth: 720,
    fontSize: typography.body,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
