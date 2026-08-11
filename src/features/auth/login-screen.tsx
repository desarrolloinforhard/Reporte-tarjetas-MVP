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

import { ApiError } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { useSession } from '@/features/auth/session-provider';
import { radii, spacing, typography } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

export function LoginScreen() {
  const { colors } = useAppTheme();
  const { login, loginPending, loginError } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!username.trim() || !password) {
      setError('Ingresá el usuario y la contraseña.');
      return;
    }

    setError(null);
    try {
      await login(username.trim(), password);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'No se pudo iniciar sesión. Volvé a intentarlo.',
      );
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
            description="Acceso al ambiente aislado de desarrollo"
            style={styles.card}
            title="Iniciar sesión">
            <View style={styles.form}>
              <TextField
                autoCapitalize="none"
                autoComplete="username"
                editable={!loginPending}
                label="Email o usuario"
                onChangeText={setUsername}
                returnKeyType="next"
                value={username}
              />
              <TextField
                autoCapitalize="none"
                autoComplete="current-password"
                editable={!loginPending}
                error={error ?? loginError ?? undefined}
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
              <Button loading={loginPending} onPress={submit}>
                Ingresar
              </Button>
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
  notice: { textAlign: 'center', fontSize: 12, lineHeight: 18 },
});
