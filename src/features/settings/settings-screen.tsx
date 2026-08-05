import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getHealth } from '@/api/health.api';
import { ScreenFrame } from '@/components/layout/screen-frame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { appEnvironment } from '@/config/environment';
import { queryClient } from '@/config/query-client';
import { getApiBaseUrl } from '@/config/runtime-api';
import { useSession } from '@/features/auth/session-provider';
import { TechnicalSettingsModal } from '@/features/settings/technical-settings-modal';
import { breakpoints, radii, spacing } from '@/theme/tokens';
import { ThemePreference, useAppTheme } from '@/theme/theme-provider';

const themeOptions: { label: string; value: ThemePreference; description: string }[] = [
  { label: 'Sistema', value: 'system', description: 'Usa la preferencia del dispositivo' },
  { label: 'Claro', value: 'light', description: 'Fondo claro y alto contraste' },
  { label: 'Oscuro', value: 'dark', description: 'Ideal para ambientes con poca luz' },
];

function SettingsContent({ compact = false }: { compact?: boolean }) {
  const { colors, preference, savedPreference, savePreference, setPreference } = useAppTheme();
  const { logout, user, loading } = useSession();
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeSaved, setThemeSaved] = useState(false);
  const [technicalVisible, setTechnicalVisible] = useState(false);
  const [configuredApiUrl, setConfiguredApiUrl] = useState(getApiBaseUrl);
  const hasThemeChanges = preference !== savedPreference;
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  });
  const apiConnected = healthQuery.isSuccess;
  const databaseLabel = healthQuery.data?.database
    ? healthQuery.data.database.connected
      ? 'Conectada'
      : 'Aislada / sin conexión'
    : 'No informada';
  const checkedAt = healthQuery.dataUpdatedAt
    ? new Intl.DateTimeFormat('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(healthQuery.dataUpdatedAt)
    : 'Pendiente';

  async function handleSaveTheme() {
    setSavingTheme(true);
    try {
      await savePreference(preference);
      setThemeSaved(true);
    } finally {
      setSavingTheme(false);
    }
  }

  return (
      <View style={[styles.grid, compact && styles.compactGrid]}>
        <Card
          description="Elegí una apariencia y guardala para conservarla al reiniciar."
          style={{ ...styles.card, ...(compact ? styles.compactCard : {}) }}
          title="Apariencia">
          <View style={styles.optionList}>
            {themeOptions.map((option) => {
              const active = option.value === preference;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  key={option.value}
                  onPress={() => {
                    setPreference(option.value);
                    setThemeSaved(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    compact && styles.compactOption,
                    {
                      backgroundColor: active
                        ? colors.primarySoft
                        : pressed
                          ? colors.surfaceMuted
                          : colors.surface,
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
          <View style={styles.saveRow}>
            <Text style={[styles.saveStatus, { color: colors.textMuted }]}>
              {hasThemeChanges
                ? 'Hay cambios sin guardar'
                : themeSaved
                  ? 'Configuración guardada'
                  : 'Preferencia actual guardada'}
            </Text>
            <Button
              disabled={!hasThemeChanges}
              loading={savingTheme}
              onPress={handleSaveTheme}
              variant={hasThemeChanges ? 'primary' : 'secondary'}>
              {hasThemeChanges ? 'Guardar configuración' : 'Guardado'}
            </Button>
          </View>
        </Card>

        <Card
          accessory={
            <Badge
              label={healthQuery.isPending ? 'Comprobando' : apiConnected ? 'Conectada' : 'Sin conexión'}
              tone={healthQuery.isPending ? 'info' : apiConnected ? 'success' : 'danger'}
            />
          }
          description="Información pública y no sensible"
          style={{ ...styles.card, ...(compact ? styles.compactCard : {}) }}
          title="Diagnóstico">
          {[
            ['Aplicación', '0.1.0'],
            ['Ambiente', appEnvironment.name],
            ['API configurada', configuredApiUrl],
            ['Estado de API', apiConnected ? healthQuery.data.status : 'No disponible'],
            ['Base de datos', databaseLabel],
            ['Última comprobación', checkedAt],
            ['Actualización', 'Automática cada 5 segundos'],
            ['Plataformas', 'Web · Android · iOS'],
          ].map(([label, value]) => (
            <View key={label} style={[styles.detailRow, compact && styles.compactDetailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
              <Text
                numberOfLines={2}
                selectable
                style={[styles.detailValue, { color: colors.text }]}>
                {value}
              </Text>
            </View>
          ))}
          {healthQuery.isError ? (
            <View style={styles.diagnosticAction}>
              <Text
                style={[
                  styles.optionDescription,
                  styles.diagnosticMessage,
                  { color: colors.danger },
                ]}>
                No se pudo conectar con el backend configurado.
              </Text>
              <Button variant="secondary" onPress={() => healthQuery.refetch()}>
                Reintentar
              </Button>
            </View>
          ) : null}
        </Card>

        <Card
          description="Sesión del ambiente aislado de desarrollo"
          style={{ ...styles.card, ...(compact ? styles.compactCard : {}) }}
          title="Cuenta">
          <View style={styles.account}>
            <View>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                {user?.display_name || 'Usuario'}
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
                {user?.username} · {user?.role}
              </Text>
            </View>
            <Button loading={loading} onPress={logout} variant="secondary">
              Cerrar sesión
            </Button>
            <View style={[styles.technicalAccess, { borderTopColor: colors.border }]}>
              <View style={styles.optionCopy}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Soporte técnico</Text>
                <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
                  Configuración protegida de la conexión API.
                </Text>
              </View>
              <Button onPress={() => setTechnicalVisible(true)} variant="secondary">
                Entrar como técnico
              </Button>
            </View>
          </View>
        </Card>
        <TechnicalSettingsModal
          onClose={() => setTechnicalVisible(false)}
          onSaved={(url) => {
            setConfiguredApiUrl(url);
            void queryClient.invalidateQueries();
          }}
          visible={technicalVisible}
        />
      </View>
  );
}

export function SettingsScreen() {
  return (
    <ScreenFrame
      actions={<Badge label={appEnvironment.name} tone="info" />}
      description="Preferencias visuales, entorno y diagnóstico de la aplicación."
      title="Configuración">
      <SettingsContent />
    </ScreenFrame>
  );
}

export function SettingsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.desktop;

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <Pressable
          accessibilityLabel="Cerrar configuración"
          onPress={onClose}
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
        />
        <View
          style={[styles.modalPanel, desktop && styles.modalPanelDesktop, { backgroundColor: colors.surfaceElevated }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.modalHeading}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Configuración</Text>
              <Text style={[styles.modalDescription, { color: colors.textMuted }]}>Preferencias, conexión y cuenta</Text>
            </View>
            <Badge label={appEnvironment.name} tone="info" />
            <Pressable
              accessibilityLabel="Cerrar configuración"
              accessibilityRole="button"
              onPress={onClose}
              style={[styles.modalClose, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.modalCloseText, { color: colors.text }]}>×</Text>
            </Pressable>
          </View>
          <ScrollView
            alwaysBounceVertical={false}
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            overScrollMode="always"
            scrollEnabled
            showsVerticalScrollIndicator
            style={styles.modalScroll}>
            <SettingsContent compact />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  compactGrid: {
    gap: spacing.sm,
  },
  card: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 420,
    minWidth: 280,
    maxWidth: '100%',
  },
  compactCard: {
    flexBasis: 280,
    minWidth: 250,
    padding: 14,
    gap: spacing.sm,
  },
  optionList: {
    gap: spacing.sm,
  },
  saveRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  saveStatus: {
    flexGrow: 1,
    fontSize: 12,
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
  compactOption: {
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
  compactDetailRow: {
    minHeight: 38,
    paddingVertical: 6,
  },
  detailLabel: {
    width: 118,
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
  account: {
    gap: spacing.md,
  },
  technicalAccess: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  diagnosticAction: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  diagnosticMessage: {
    flex: 1,
    minWidth: 200,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  modalPanel: {
    width: '100%',
    maxWidth: 720,
    height: '80%',
    maxHeight: '80%',
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  modalPanelDesktop: {
    maxWidth: 1080,
    height: '88%',
    maxHeight: '88%',
  },
  modalHeader: {
    minHeight: 66,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalHeading: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalDescription: {
    fontSize: 12,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    lineHeight: 26,
  },
  modalBody: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  modalScroll: {
    flex: 1,
    minHeight: 0,
  },
});
