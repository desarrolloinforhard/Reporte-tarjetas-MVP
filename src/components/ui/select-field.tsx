import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

export type SelectOption = { value: string; label: string };

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) || options[0];

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        accessibilityLabel={`${label}: ${selected?.label || 'Sin selección'}`}
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          {
            backgroundColor: colors.surface,
            borderColor: value ? colors.primary : colors.borderStrong,
          },
        ]}>
        <Text numberOfLines={1} style={[styles.value, { color: colors.text }]}>
          {selected?.label || 'Seleccionar'}
        </Text>
        <Ionicons color={colors.primary} name="chevron-down" size={17} />
      </Pressable>
      <Modal animationType="fade" onRequestClose={() => setOpen(false)} transparent visible={open}>
        <Pressable
          onPress={() => setOpen(false)}
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <Pressable
            accessibilityViewIsModal
            onPress={(event) => event.stopPropagation()}
            style={[styles.modal, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>{label}</Text>
              <Button onPress={() => setOpen(false)} variant="ghost">Cerrar</Button>
            </View>
            <ScrollView contentContainerStyle={styles.options}>
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value || 'all'}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      {
                        backgroundColor: active ? colors.primarySoft : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text style={[styles.optionText, { color: colors.text }]}>
                      {option.label}
                    </Text>
                    {active ? <Ionicons color={colors.primary} name="checkmark" size={18} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600' },
  field: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  value: { flex: 1, fontSize: 13, fontWeight: '600' },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  modal: { width: '100%', maxWidth: 420, maxHeight: '78%', borderRadius: radii.xl, padding: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { fontSize: 18, fontWeight: '700' },
  options: { gap: spacing.sm },
  option: { minHeight: 46, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  optionText: { flex: 1, fontSize: 14, fontWeight: '600' },
});
