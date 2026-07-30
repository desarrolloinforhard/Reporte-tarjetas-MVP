import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';
import { formatDate } from '@/utils/date-format';

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { colors } = useAppTheme();
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date();
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );
  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
      index < firstWeekday ? null : new Date(year, month, index - firstWeekday + 1),
    );
  }, [visibleMonth]);
  const monthLabel = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth);

  const show = () => {
    setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    setOpen(true);
  };

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        accessibilityLabel={`${label}: ${formatDate(value)}. Abrir calendario`}
        accessibilityRole="button"
        onPress={show}
        style={[
          styles.field,
          { backgroundColor: colors.surface, borderColor: colors.borderStrong },
        ]}>
        <Text style={[styles.value, { color: colors.text }]}>{formatDate(value)}</Text>
        <Ionicons color={colors.primary} name="calendar-outline" size={18} />
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
              <Button
                accessibilityLabel="Mes anterior"
                onPress={() =>
                  setVisibleMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                  )
                }
                variant="ghost">
                ‹
              </Button>
              <Text style={[styles.title, { color: colors.text }]}>{monthLabel}</Text>
              <Button
                accessibilityLabel="Mes siguiente"
                onPress={() =>
                  setVisibleMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                  )
                }
                variant="ghost">
                ›
              </Button>
            </View>
            <View style={styles.grid}>
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                <Text key={day} style={[styles.weekday, { color: colors.textMuted }]}>
                  {day}
                </Text>
              ))}
              {calendarDays.map((day, index) =>
                day ? (
                  <Pressable
                    key={isoDate(day)}
                    onPress={() => {
                      onChange(isoDate(day));
                      setOpen(false);
                    }}
                    style={[
                      styles.day,
                      isoDate(day) === value && { backgroundColor: colors.primary },
                    ]}>
                    <Text
                      style={[
                        styles.dayText,
                        { color: isoDate(day) === value ? colors.onPrimary : colors.text },
                      ]}>
                      {day.getDate()}
                    </Text>
                  </Pressable>
                ) : (
                  <View key={`empty-${index}`} style={styles.day} />
                ),
              )}
            </View>
            <View style={styles.actions}>
              <Button
                onPress={() => {
                  onChange(isoDate(new Date()));
                  setOpen(false);
                }}
                variant="secondary">
                Hoy
              </Button>
              <Button onPress={() => setOpen(false)} variant="ghost">
                Cerrar
              </Button>
            </View>
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
  modal: { width: '100%', maxWidth: 390, borderRadius: radii.xl, padding: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { flex: 1, textAlign: 'center', textTransform: 'capitalize', fontSize: 17, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.285%', paddingVertical: spacing.sm, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  day: { width: '14.285%', minHeight: 42, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
});
