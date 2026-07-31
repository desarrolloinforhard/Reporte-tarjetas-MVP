import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select-field';
import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

export type ExportFormat = 'csv' | 'pdf';

export function ExportDialog({ visible, formats, onClose, onExport }: {
  visible: boolean;
  formats: ExportFormat[];
  onClose: () => void;
  onExport: (format: ExportFormat) => Promise<void>;
}) {
  const { colors } = useAppTheme();
  const [format, setFormat] = useState<ExportFormat>(formats[0] ?? 'csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setLoading(true);
    setError('');
    try {
      await onExport(format);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo exportar el archivo.');
    } finally {
      setLoading(false);
    }
  }

  return <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
    <Pressable onPress={onClose} style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
      <Pressable onPress={(event) => event.stopPropagation()} style={[styles.panel, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={[styles.title, { color: colors.text }]}>Exportar resultados</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>Se exportarán todos los registros que coincidan con los filtros actuales.</Text>
        <SelectField label="Formato" value={format} options={formats.map((value) => ({ value, label: value === 'csv' ? 'CSV (.csv)' : 'PDF (.pdf)' }))} onChange={(value) => setFormat(value as ExportFormat)} />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <View style={styles.actions}><Button variant="secondary" onPress={onClose}>Cerrar</Button><Button loading={loading} onPress={submit}>Exportar</Button></View>
      </Pressable>
    </Pressable>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  panel: { width: '100%', maxWidth: 480, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 20, fontWeight: '800' },
  description: { fontSize: 13, lineHeight: 18 },
  error: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
