import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { useSession } from '@/features/auth/session-provider';
import { requestPasswordReset } from '@/features/auth/session.api';
import { radii, spacing, typography } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

export function LoginScreen() {
  const { colors } = useAppTheme();
  const { login, loginPending, loginCooldownSeconds, loginError } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryPending, setRecoveryPending] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const loginBlocked = loginCooldownSeconds > 0;
  const countdown = `${Math.floor(loginCooldownSeconds / 60)}:${String(loginCooldownSeconds % 60).padStart(2, '0')}`;
  const loginFeedback = loginBlocked
    ? `Demasiados intentos. Podés volver a probar en ${countdown}.`
    : error ?? (loginError?.startsWith('Demasiados intentos.') ? undefined : loginError) ?? undefined;

  async function submit() {
    if (!username.trim() || !password) {
      setError('Ingresá el usuario y la contraseña.');
      return;
    }

    setError(null);
    try {
      await login(username.trim(), password);
    } catch {}
  }

  async function submitRecovery() {
    if (!username.trim()) {
      setRecoveryMessage('Ingresá tu email o usuario para continuar.');
      return;
    }
    setRecoveryPending(true);
    setRecoveryMessage(null);
    try {
      await requestPasswordReset(username.trim());
      setRecoveryMessage(
        'En desarrollo no se envía el enlace por correo. La entrega real se habilitará con la plataforma de cuentas.',
      );
    } catch {
      setRecoveryMessage('No se pudo solicitar el restablecimiento. Volvé a intentarlo.');
    } finally {
      setRecoveryPending(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}>
        <View style={styles.page}>
          <View style={styles.brand}>
            <View style={[styles.logoBox, { backgroundColor: colors.primarySoft }]}>
              <Image
                accessibilityLabel="Logo de Inforhard"
                resizeMode="contain"
                source={require('../../../assets/branding/logo.png')}
                style={styles.logo}
              />
            </View>
            <View style={styles.brandCopy}>
              <Text style={[styles.company, { color: colors.primary }]}>INFORHARD S.R.L</Text>
              <Text style={[styles.product, { color: colors.text }]}>Reportes de Tarjetas</Text>
            </View>
          </View>

          <Card
            description={recoveryMode ? 'Recuperá el acceso de forma segura' : 'Acceso al ambiente aislado de desarrollo'}
            style={styles.card}
            title={recoveryMode ? 'Restablecer contraseña' : 'Iniciar sesión'}>
            <View style={styles.form}>
              <TextField
                autoCapitalize="none"
                autoComplete="username"
                editable={!loginPending && !loginBlocked}
                label={recoveryMode ? 'Email o usuario' : 'Email o usuario'}
                onChangeText={setUsername}
                returnKeyType="next"
                value={username}
              />
              {recoveryMode ? (
                <>
                  {recoveryMessage ? (
                    <Text style={[styles.recoveryMessage, { color: colors.textMuted }]}>{recoveryMessage}</Text>
                  ) : null}
                  <Button loading={recoveryPending} onPress={submitRecovery}>
                    Enviar enlace de recuperación
                  </Button>
                  <Button onPress={() => { setRecoveryMode(false); setRecoveryMessage(null); }} variant="secondary">
                    Volver a iniciar sesión
                  </Button>
                </>
              ) : (
                <>
                  <TextField
                    autoCapitalize="none"
                    autoComplete="current-password"
                    editable={!loginPending && !loginBlocked}
                    error={loginFeedback}
                    label="Contraseña"
                    onChangeText={setPassword}
                    onSubmitEditing={submit}
                    rightAccessory={
                      <Pressable
                        accessibilityHint="Alterna si la contraseña se muestra o se oculta"
                        accessibilityLabel={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        accessibilityRole="button"
                        hitSlop={10}
                        onPress={() => setPasswordVisible((visible) => !visible)}>
                        <Text style={[styles.passwordToggle, { color: colors.primary }]}>
                          {passwordVisible ? 'Ocultar' : 'Mostrar'}
                        </Text>
                      </Pressable>
                    }
                    returnKeyType="done"
                    secureTextEntry={!passwordVisible}
                    value={password}
                  />
                  <Button disabled={loginBlocked} loading={loginPending} onPress={submit}>
                    {loginBlocked ? `Esperá ${countdown}` : 'Ingresar'}
                  </Button>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => { setRecoveryMode(true); setError(null); }}
                    style={styles.recoveryLink}>
                    <Text style={[styles.recoveryLinkText, { color: colors.primary }]}>¿Olvidaste tu contraseña?</Text>
                  </Pressable>
                </>
              )}
              <Text style={[styles.notice, { color: colors.textMuted }]}>
                Esta instancia utiliza usuarios y datos sintéticos. No está conectada a producción.
              </Text>
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  page: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 50, height: 50 },
  brandCopy: { flex: 1, gap: spacing.xs },
  company: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  product: { fontSize: typography.heading, fontWeight: '900' },
  card: { width: '100%' },
  form: { gap: spacing.md },
  passwordToggle: { fontSize: 13, fontWeight: '800', padding: spacing.xs },
  recoveryLink: { alignSelf: 'center', padding: spacing.xs },
  recoveryLinkText: { fontSize: 13, fontWeight: '800' },
  recoveryMessage: { fontSize: 13, lineHeight: 19 },
  notice: { textAlign: 'center', fontSize: 12, lineHeight: 18 },
});
