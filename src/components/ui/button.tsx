import { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = PropsWithChildren<
  PressableProps & {
    variant?: ButtonVariant;
    loading?: boolean;
    style?: ViewStyle;
  }
>;

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;

  const palette = {
    primary: {
      background: colors.primary,
      border: colors.primary,
      text: colors.onPrimary,
    },
    secondary: {
      background: colors.surface,
      border: colors.borderStrong,
      text: colors.text,
    },
    ghost: {
      background: 'transparent',
      border: 'transparent',
      text: colors.primary,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor:
            pressed && variant !== 'primary' ? colors.primarySoft : palette.background,
          borderColor: palette.border,
          opacity: isDisabled ? 0.55 : 1,
        },
        style,
      ]}
      {...props}>
      {loading ? <ActivityIndicator color={palette.text} /> : null}
      <Text style={[styles.label, { color: palette.text }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
});
