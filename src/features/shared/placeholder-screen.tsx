import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { FeedbackState } from '@/components/ui/feedback-state';
import { ScreenFrame } from '@/components/layout/screen-frame';
import { spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

export function PlaceholderScreen({
  title,
  description,
  next,
}: {
  title: string;
  description: string;
  next: string;
}) {
  const { colors } = useAppTheme();

  return (
    <ScreenFrame
      actions={<Badge label="Datos simulados" tone="warning" />}
      description={description}
      title={title}>
      <FeedbackState
        description={next}
        eyebrow="Módulo preparado"
        title="La estructura responsive ya está disponible"
      />
      <View style={styles.note}>
        <Text style={[styles.noteText, { color: colors.textMuted }]}>
          Esta sección no realizará llamadas a producción. Su contrato y estados se implementarán
          con fixtures sanitizados antes de conectarla al ambiente de desarrollo.
        </Text>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  note: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  noteText: {
    maxWidth: 720,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});
