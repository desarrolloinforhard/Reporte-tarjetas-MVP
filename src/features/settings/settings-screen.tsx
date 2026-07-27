import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScreenFrame } from '@/components/layout/screen-frame';
import { appEnvironment } from '@/config/environment';
import { radii, spacing } from '@/theme/tokens';
import { ThemePreference, useAppTheme } from '@/theme/theme-provider';

const themeOptions: { label: string; value: ThemePreference; description: string }[] = [
  { label: 'Sistema', value: 'system', description: 'Usa la preferencia del dispositivo' },
  { label: 'Claro', value: 'light', description: 'Fondo claro y alto contraste' },
  { label: 'Oscuro', value: 'dark', description: 'Ideal para ambientes con poca luz' },
];

export function SettingsScreen() {
  const { colors, preference, setPreference } = useAppTheme();

  return (
    <ScreenFrame
      actions={<Badge label={appEnvironment.name} tone="info" />}
      description="Preferencias visuales, entorno y diagnóstico de la aplicación."
      title="Configuración">
      <View style={styles.grid}>
        <Card
          description="La persistencia se incorporará junto con la sesión segura."
          style={styles.card}
          title="Apariencia">
          <View style={styles.optionList}>
            {themeOptions.map((option) => {
              const active = option.value === preference;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  key={option.value}
                  onPress={() => setPreference(option.value)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: active ? colors.primarySoft : pressed ? colors.surfaceMuted : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}>
                  <View style={styles.optionCopy}>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>{option.label}</Text>
                    <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
                      {option.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      { borderColor: active ? colors.primary : colors.borderStrong },
                    ]}>
                    {active ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card description="Información pública y no sensible" style={styles.card} title="Diagnóstico">
          {[
            ['Aplicación', '0.1.0'],
            ['Ambiente', appEnvironment.name],
            ['API configurada', appEnvironment.apiBaseUrl],
            ['Plataformas', 'Web · Android · iOS'],
          ].map(([label, value]) => (
            <View key={label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
              <Text
                numberOfLines={2}
                selectable
                style={[styles.detailValue, { color: colors.text }]}>
                {value}
              </Text>
            </View>
          ))}
        </Card>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 420,
    minWidth: 280,
    maxWidth: '100%',
  },
  optionList: {
    gap: spacing.sm,
  },
  option: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  optionDescription: {
    fontSize: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailRow: {
    minHeight: 52,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    width: 108,
    fontSize: 12,
    fontWeight: '700',
  },
  detailValue: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
  },
});
