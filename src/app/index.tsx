import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appEnvironment } from '@/config/environment';
import { colors, spacing } from '@/theme/tokens';

export default function FoundationScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Inforhard S.R.L</Text>
        <Text style={styles.title}>Reportes de Tarjetas</Text>
        <Text style={styles.description}>
          Base universal preparada para web, Android e iOS. La migración funcional se controla
          desde la matriz de paridad del proyecto.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado de la base</Text>
          <Text style={styles.item}>Expo SDK 57</Text>
          <Text style={styles.item}>React Native + React Native Web</Text>
          <Text style={styles.item}>Ambiente: {appEnvironment.name}</Text>
          <Text style={styles.item}>API: {appEnvironment.apiBaseUrl}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    width: '100%',
    maxWidth: 960,
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
  },
  description: {
    maxWidth: 680,
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 26,
  },
  card: {
    marginTop: spacing.lg,
    maxWidth: 560,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    marginBottom: spacing.xs,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  item: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
