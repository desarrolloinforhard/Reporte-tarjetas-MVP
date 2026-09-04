import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useSession } from '@/features/auth/session-provider';
import {
  detectWebInstallPlatform,
  isStandaloneWebApp,
  WebInstallPlatform,
} from '@/features/install/pwa-install';
import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

type InstallChoice = { outcome: 'accepted' | 'dismissed'; platform: string };

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<InstallChoice>;
};

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function getPlatform(): WebInstallPlatform {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return 'desktop';
  return detectWebInstallPlatform({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
  });
}

function isInstalled() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return true;
  return isStandaloneWebApp({
    displayModeStandalone: window.matchMedia('(display-mode: standalone)').matches,
    navigatorStandalone: (navigator as NavigatorWithStandalone).standalone,
  });
}

export function PwaInstallPrompt() {
  const { colors } = useAppTheme();
  const { authenticated, loginSucceededAt } = useSession();
  const platform = useMemo(() => getPlatform(), []);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isInstalled);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [dismissedPromptFor, setDismissedPromptFor] = useState<number | null>(null);
  const visible = Platform.OS === 'web'
    && authenticated
    && loginSucceededAt !== null
    && !installed
    && dismissedPromptFor !== loginSucceededAt;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  function closePrompt() {
    setDismissedPromptFor(loginSucceededAt);
    setInstructionsVisible(false);
  }

  async function install() {
    if (deferredPrompt) {
      const prompt = deferredPrompt;
      setDeferredPrompt(null);
      await prompt.prompt();
      closePrompt();
      return;
    }
    setInstructionsVisible(true);
  }

  if (Platform.OS !== 'web' || installed) return null;

  const instruction = platform === 'ios'
    ? 'En Safari: tocá Compartir, elegí Agregar a Inicio, activá Abrir como app web y tocá Agregar.'
    : platform === 'android'
      ? 'Abrí el menú ⋮ del navegador y elegí Instalar aplicación o Agregar a pantalla principal.'
      : 'Usá el ícono de instalación de la barra de direcciones o la opción Instalar aplicación del menú.';
  const supportingText = platform === 'ios'
    ? 'Tené Reportes de Tarjetas en la pantalla de inicio de tu iPhone.'
    : 'Abrila más rápido desde tu dispositivo y usala como una aplicación.';

  return (
    <Modal
      animationType="fade"
      onRequestClose={closePrompt}
      transparent
      visible={visible}>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View style={[styles.panel, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Pressable
            accessibilityLabel="Cerrar aviso de instalación"
            accessibilityRole="button"
            hitSlop={10}
            onPress={closePrompt}
            style={[styles.close, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.closeText, { color: colors.text }]}>×</Text>
          </Pressable>

          <View style={styles.logoBox}>
            <Image
              accessibilityLabel="Logo de Inforhard"
              resizeMode="contain"
              source={require('../../../assets/branding/logo-horizontal.png')}
              style={styles.logo}
            />
          </View>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Instalá la app</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>{supportingText}</Text>

          {instructionsVisible || platform === 'ios' ? (
            <View style={[styles.instructions, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.instructionsText, { color: colors.text }]}>{instruction}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button onPress={closePrompt} style={styles.action} variant="secondary">
              Ahora no
            </Button>
            {instructionsVisible || platform === 'ios' ? (
              <Button onPress={closePrompt} style={styles.action}>Entendido</Button>
            ) : (
              <Button onPress={install} style={styles.action}>
                {deferredPrompt ? 'Instalar' : 'Cómo instalar'}
              </Button>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 410,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 22, lineHeight: 24 },
  logoBox: {
    width: '100%',
    maxWidth: 260,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logo: { width: 240, height: 36 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  description: { maxWidth: 320, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  instructions: {
    width: '100%',
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  instructionsText: { fontSize: 13, lineHeight: 20, fontWeight: '700', textAlign: 'center' },
  actions: { width: '100%', flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  action: { flex: 1 },
});
