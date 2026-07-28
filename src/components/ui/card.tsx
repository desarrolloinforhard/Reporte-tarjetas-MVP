import { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

type CardProps = PropsWithChildren<{
  title?: string;
  description?: string;
  accessory?: ReactNode;
  style?: ViewStyle;
}>;

export function Card({ title, description, accessory, children, style }: CardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}>
      {title || accessory ? (
        <View style={styles.header}>
          <View style={styles.heading}>
            {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
            {description ? (
              <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
            ) : null}
          </View>
          {accessory}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heading: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
});
