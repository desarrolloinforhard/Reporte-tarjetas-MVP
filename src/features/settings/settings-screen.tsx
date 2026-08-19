import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getHealth } from '@/api/health.api';
import { ScreenFrame } from '@/components/layout/screen-frame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
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
  const { changePassword, logout, user, loading } = useSession();
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeSaved, setThemeSaved] = useState(false);
  const [technicalVisible, setTechnicalVisible] = useState(false);
  const [configuredApiUrl, setConfiguredApiUrl] = useState(getApiBaseUrl);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordFormVisible, setPasswordFormVisible] = useState(false);
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
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

  async function handleChangePassword() {
    setPasswordSaved(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Completá la contraseña actual, la nueva y su confirmación.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmación no coincide con la nueva contraseña.');
      return;
    }
    setPasswordPending(true);
    setPasswordError(null);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
      setPasswordFormVisible(false);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setPasswordPending(false);
    }
  }

  function passwordStrength(value: string) {
    if (!value) return null;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    if (score <= 1) return { label: 'Débil', color: colors.danger };
    if (score <= 3) return { label: 'Media', color: colors.warning };
    return { label: 'Fuerte', color: colors.success };
  }

  const strength = passwordStrength(newPassword);
  const passwordAccessory = (visible: boolean, onPress: () => void) => (
    <Pressable
      accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      accessibilityRole="button"
      hitSlop={10}
      onPress={onPress}>
      <Text style={[styles.passwordToggle, { color: colors.primary }]}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
    </Pressable>
  );

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
              style={hasThemeChanges ? undefined : { backgroundColor: colors.surfaceMuted, borderColor: colors.border }}
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
              <Button
                onPress={() => healthQuery.refetch()}
                style={{ backgroundColor: colors.primarySoft, borderColor: colors.primary }}
                variant="secondary">
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
              <Text
                style={[styles.optionDescription, { color: colors.textMuted }]}>
                {user?.username} · {user?.role}
              </Text>
              {user?.company ? (
                <Text
                  style={[styles.optionDescription, { color: colors.textMuted }]}>
                  Empresa activa: {user.company.display_name}
                </Text>
              ) : null}
            </View>
            <Button loading={loading} onPress={() => setLogoutConfirmVisible(true)} variant="danger">
              Cerrar sesión
            </Button>
            <View style={[styles.technicalAccess, { borderTopColor: colors.border }]}>
              <View style={styles.optionCopy}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Seguridad de la cuenta</Text>
                <Text style={[styles.optionDescription, { color: colors.textMuted }]}>Actualizá tu contraseña de acceso.</Text>
              </View>
              <Button
                onPress={() => {
                  setPasswordFormVisible((visible) => !visible);
                  setPasswordError(null);
                  setPasswordSaved(false);
                }}
                style={passwordFormVisible ? undefined : { backgroundColor: colors.primarySoft, borderColor: colors.primary }}
                variant="secondary">
                {passwordFormVisible ? 'Cancelar' : 'Cambiar contraseña'}
              </Button>
            </View>
            {passwordFormVisible ? (
              <View style={styles.passwordForm}>
                <Text style={[styles.optionDescription, { color: colors.textMuted }]}>La nueva contraseña cierra las demás sesiones de esta cuenta.</Text>
                <TextField
                  autoCapitalize="none"
                  autoComplete="current-password"
                  editable={!passwordPending}
                  label="Contraseña actual"
                  onChangeText={setCurrentPassword}
                  rightAccessory={passwordAccessory(currentPasswordVisible, () => setCurrentPasswordVisible((visible) => !visible))}
                  secureTextEntry={!currentPasswordVisible}
                  value={currentPassword}
                />
                <TextField
                  autoCapitalize="none"
                  autoComplete="new-password"
                  editable={!passwordPending}
                  hint="Al menos 8 caracteres y distinta de la actual."
                  label="Nueva contraseña"
                  onChangeText={setNewPassword}
                  rightAccessory={passwordAccessory(newPasswordVisible, () => setNewPasswordVisible((visible) => !visible))}
                  secureTextEntry={!newPasswordVisible}
                  value={newPassword}
                />
                {strength ? (
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>Seguridad de la contraseña: {strength.label}</Text>
                ) : null}
                <TextField
                  autoCapitalize="none"
                  autoComplete="new-password"
                  editable={!passwordPending}
                  error={passwordError ?? undefined}
                  label="Confirmar nueva contraseña"
                  onChangeText={setConfirmPassword}
                  onSubmitEditing={handleChangePassword}
                  rightAccessory={passwordAccessory(confirmPasswordVisible, () => setConfirmPasswordVisible((visible) => !visible))}
                  secureTextEntry={!confirmPasswordVisible}
                  value={confirmPassword}
                />
                <Button loading={passwordPending} onPress={handleChangePassword}>
                  Guardar nueva contraseña
                </Button>
              </View>
            ) : null}
            {passwordSaved ? (
              <Text style={[styles.optionDescription, { color: colors.success }]}>Contraseña actualizada correctamente.</Text>
            ) : null}
            <View style={[styles.technicalAccess, { borderTopColor: colors.border }]}>
              <View style={styles.optionCopy}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Soporte técnico</Text>
                <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
                  Configuración protegida de la conexión API.
                </Text>
              </View>
              <Button
                onPress={() => setTechnicalVisible(true)}
                style={{ backgroundColor: colors.primarySoft, borderColor: colors.primary }}
                variant="secondary">
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
        <Modal animationType="fade" onRequestClose={() => setLogoutConfirmVisible(false)} transparent visible={logoutConfirmVisible}>
          <View style={styles.confirmBackdrop}>
            <View style={[styles.confirmPanel, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={[styles.confirmTitle, { color: colors.text }]}>¿Cerrar sesión?</Text>
              <Text style={[styles.confirmText, { color: colors.textMuted }]}>Vas a salir de esta cuenta en este dispositivo.</Text>
              <View style={styles.confirmActions}>
                <Button onPress={() => setLogoutConfirmVisible(false)} variant="secondary">Cancelar</Button>
                <Button
                  loading={loading}
                  onPress={async () => {
                    setLogoutConfirmVisible(false);
                    await logout();
                  }}
                  variant="danger">
                  Cerrar sesión
                </Button>
              </View>
            </View>
          </View>
        </Modal>
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
  passwordForm: {
    gap: spacing.md,
  },
  passwordToggle: { fontSize: 13, fontWeight: '800', padding: spacing.xs },
  strengthLabel: { fontSize: 12, fontWeight: '800', marginTop: -spacing.xs },
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
  confirmBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: spacing.lg,
  },
  confirmPanel: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  confirmTitle: { fontSize: 20, fontWeight: '900' },
  confirmText: { fontSize: 14, lineHeight: 20 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, flexWrap: 'wrap' },
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
