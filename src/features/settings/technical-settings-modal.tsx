import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import {
  ApiMode,
  apiModeForUrl,
  getApiBaseUrl,
  normalizeApiBaseUrl,
  saveRuntimeApiBaseUrl,
} from '@/config/runtime-api';
import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

const TECHNICAL_KEY = '*123*';
const modeOptions = [
  { value: 'local', label: 'Localhost' },
  { value: 'lan', label: 'Red local HTTP' },
  { value: 'remote', label: 'Remoto HTTPS / ngrok' },
];

export function TechnicalSettingsModal({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: (url: string) => void;
}) {
  const { colors } = useAppTheme();
  const configuredUrl = getApiBaseUrl();
  const [accessGranted, setAccessGranted] = useState(false);
  const [technicalKey, setTechnicalKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [accessError, setAccessError] = useState('');
  const [mode, setMode] = useState<ApiMode>(() => apiModeForUrl(configuredUrl));
  const [url, setUrl] = useState(configuredUrl);
  const [testedUrl, setTestedUrl] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [statusTone, setStatusTone] = useState<'success' | 'danger' | 'muted'>('muted');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  function closeAll() {
    setAccessGranted(false);
    setTechnicalKey('');
    setAccessError('');
    setStatus('');
    setTestedUrl(null);
    setSavedUrl(null);
    onClose();
  }

  function grantAccess() {
    if (technicalKey !== TECHNICAL_KEY) {
      setAccessError('Clave técnica incorrecta.');
      return;
    }
    const current = getApiBaseUrl();
    setMode(apiModeForUrl(current));
    setUrl(current);
    setSavedUrl(null);
    setAccessError('');
    setAccessGranted(true);
  }

  function changeMode(value: string) {
    const nextMode = value as ApiMode;
    setMode(nextMode);
    setTestedUrl(null);
    setSavedUrl(null);
    setStatus('');
    if (nextMode === 'local') setUrl(normalizeApiBaseUrl('', 'local'));
  }

  function candidateUrl() {
    return normalizeApiBaseUrl(url, mode);
  }

  async function testConnection() {
    let candidate: string;
    try {
      candidate = candidateUrl();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'La URL no es válida.');
      setStatusTone('danger');
      return;
    }

    setTesting(true);
    setTestedUrl(null);
    setStatus('Probando conexión…');
    setStatusTone('muted');
    try {
      const response = await fetch(`${candidate}/health`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!payload || typeof payload !== 'object') throw new Error('Respuesta inválida');
      setTestedUrl(candidate);
      setUrl(candidate);
      setStatus('Conexión correcta. Ya podés guardar.');
      setStatusTone('success');
    } catch {
      setStatus('No se pudo conectar. Revisá la URL, la red y el backend.');
      setStatusTone('danger');
    } finally {
      setTesting(false);
    }
  }

  async function saveConnection() {
    const candidate = candidateUrl();
    if (testedUrl !== candidate) {
      setStatus('Probá esta URL correctamente antes de guardarla.');
      setStatusTone('danger');
      return;
    }
    setSaving(true);
    try {
      await saveRuntimeApiBaseUrl(candidate);
      setSavedUrl(candidate);
      onSaved(candidate);
      setStatus('Configuración técnica guardada en este dispositivo.');
      setStatusTone('success');
    } finally {
      setSaving(false);
    }
  }

  const statusColor = statusTone === 'danger'
    ? colors.danger
    : statusTone === 'success'
      ? colors.primary
      : colors.textMuted;

  return (
    <Modal animationType="fade" onRequestClose={closeAll} transparent visible={visible}>
      <Pressable onPress={closeAll} style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={[
            styles.panel,
            accessGranted && styles.technicalPanel,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          ]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.heading}>
              <Text style={[styles.title, { color: colors.text }]}>
                {accessGranted ? 'Configuración técnica' : 'Acceso técnico'}
              </Text>
              {accessGranted ? (
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Cambiá el servidor usado por la aplicación en este dispositivo.
                </Text>
              ) : null}
            </View>
            <Pressable accessibilityLabel="Cerrar" onPress={closeAll} style={styles.close}>
              <Text style={[styles.closeText, { color: colors.text }]}>×</Text>
            </Pressable>
          </View>

          {!accessGranted ? (
            <View style={styles.body}>
              <TextField
                autoCapitalize="none"
                autoCorrect={false}
                error={accessError}
                label="Clave técnica"
                onChangeText={(value) => {
                  setTechnicalKey(value);
                  setAccessError('');
                }}
                onSubmitEditing={grantAccess}
                placeholder="Ingresá la clave"
                secureTextEntry={!showKey}
                value={technicalKey}
              />
              <Pressable onPress={() => setShowKey((current) => !current)}>
                <Text style={[styles.showKey, { color: colors.primary }]}>
                  {showKey ? 'Ocultar clave' : 'Mostrar clave'}
                </Text>
              </Pressable>
              <View style={styles.actions}>
                <Button onPress={closeAll} variant="secondary">Cancelar</Button>
                <Button disabled={!technicalKey} onPress={grantAccess}>Entrar</Button>
              </View>
            </View>
          ) : (
            <View style={styles.body}>
              <View style={styles.modeField}>
                <SelectField
                  label="Modo de API"
                  onChange={changeMode}
                  options={modeOptions}
                  value={mode}
                />
              </View>
              <TextField
                autoCapitalize="none"
                autoCorrect={false}
                editable={mode !== 'local'}
                hint={mode === 'lan'
                  ? 'Ejemplo: 192.168.1.111:5001'
                  : mode === 'remote'
                    ? 'Usá una URL HTTPS segura.'
                    : 'Usa la URL local definida para desarrollo.'}
                label="URL / IP del servidor"
                onChangeText={(value) => {
                  setUrl(value);
                  setTestedUrl(null);
                  setSavedUrl(null);
                  setStatus('');
                }}
                placeholder="https://servidor/api/v1"
                value={url}
              />
              <View style={[styles.currentBox, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.currentLabel, { color: colors.textMuted }]}>Actual</Text>
                <Text selectable style={[styles.currentValue, { color: colors.text }]}>
                  {configuredUrl}
                </Text>
              </View>
              {status ? <Text style={[styles.status, { color: statusColor }]}>{status}</Text> : null}
              <View style={styles.actions}>
                <Button onPress={closeAll} variant="ghost">Cerrar</Button>
                <Button loading={testing} onPress={testConnection} variant="secondary">Probar</Button>
                <Button
                  disabled={!testedUrl || savedUrl === testedUrl}
                  loading={saving}
                  onPress={saveConnection}>
                  {savedUrl === testedUrl && testedUrl ? 'Guardado' : 'Guardar'}
                </Button>
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  panel: { width: '100%', maxWidth: 480, borderWidth: 1, borderRadius: radii.xl, overflow: 'hidden' },
  technicalPanel: { maxWidth: 820 },
  header: { minHeight: 64, borderBottomWidth: 1, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heading: { flex: 1, gap: 3 },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 12 },
  close: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 25, lineHeight: 27 },
  body: { padding: spacing.lg, gap: spacing.md },
  modeField: { maxWidth: 320, alignSelf: 'center', width: '100%' },
  showKey: { alignSelf: 'flex-end', fontSize: 12, fontWeight: '700' },
  currentBox: { borderRadius: radii.md, padding: spacing.md, gap: 4 },
  currentLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  currentValue: { fontSize: 13 },
  status: { fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
});
