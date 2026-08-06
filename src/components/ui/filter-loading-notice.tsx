import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

type FilterLoadingNoticeProps = {
  visible: boolean;
};

export function FilterLoadingNotice({ visible }: FilterLoadingNoticeProps) {
  const { colors } = useAppTheme();

  if (!visible) return null;

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityLabel="Aplicando filtros"
      style={[
        styles.notice,
        { backgroundColor: colors.primarySoft, borderColor: colors.primary },
      ]}>
      <ActivityIndicator color={colors.primary} size="small" />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>Aplicando filtros…</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>Esperá un momento mientras actualizamos los resultados.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    width: '100%',
    minHeight: 68,
    borderWidth: 2,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '800' },
  description: { fontSize: 13, lineHeight: 18 },
});
