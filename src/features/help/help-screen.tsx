import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { HelpBlock, helpSections } from '@/features/help/help-content';
import { breakpoints, radii, spacing, typography } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

function Block({ block }: { block: HelpBlock }) {
  const { colors, isDark } = useAppTheme();
  const accent = isDark ? colors.primary : colors.primaryStrong;

  if (block.type === 'paragraph') {
    return <Text style={[styles.paragraph, { color: colors.text }]}>{block.text}</Text>;
  }
  if (block.type === 'heading') {
    return <Text style={[styles.blockHeading, { color: accent }]}>{block.text}</Text>;
  }
  if (block.type === 'definitions') {
    return (
      <View style={[styles.definitions, { backgroundColor: colors.primarySoft }]}>
        {block.items.map((item) => (
          <View key={item.term} style={styles.definition}>
            <Text style={[styles.definitionTerm, { color: accent }]}>{item.term}</Text>
            <Text style={[styles.definitionText, { color: colors.text }]}>{item.description}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {block.items.map((item, index) => (
        <View key={`${index}-${item}`} style={styles.listRow}>
          <View style={[styles.listMarker, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.listMarkerText, { color: accent }]}>
              {block.type === 'steps' ? index + 1 : '•'}
            </Text>
          </View>
          <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function HelpScreen() {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();
  const accent = isDark ? colors.primary : colors.primaryStrong;
  const mainScroll = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({});
  const [activeId, setActiveId] = useState(helpSections[0]?.id ?? 'resumen');
  const desktop = width >= breakpoints.desktop;

  function registerPosition(id: string, event: LayoutChangeEvent) {
    positions.current[id] = event.nativeEvent.layout.y;
  }

  function navigateTo(id: string) {
    setActiveId(id);
    mainScroll.current?.scrollTo({ y: Math.max(0, (positions.current[id] ?? 0) - 16), animated: true });
  }

  const index = (
    <ScrollView
      contentContainerStyle={desktop ? styles.desktopIndexContent : styles.mobileIndexContent}
      horizontal={!desktop}
      showsHorizontalScrollIndicator={false}
      style={
        desktop
          ? [styles.desktopIndex, { backgroundColor: colors.surface, borderColor: colors.border }]
          : [styles.mobileIndex, { backgroundColor: colors.surface, borderColor: colors.border }]
      }>
      {desktop ? (
        <View style={styles.indexHeading}>
          <Text style={[styles.indexTitle, { color: colors.text }]}>Guía de uso</Text>
          <Text style={[styles.indexSubtitle, { color: colors.textMuted }]}>Reportes de Tarjetas</Text>
        </View>
      ) : null}
      {helpSections.map((section) => {
        const active = section.id === activeId;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={section.id}
            onPress={() => navigateTo(section.id)}
            style={({ pressed }) => [
              desktop ? styles.indexItem : styles.indexPill,
              {
                backgroundColor: active || pressed ? colors.primarySoft : desktop ? 'transparent' : colors.surface,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}>
            {desktop ? (
              <View style={[styles.indexNumber, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.indexNumberText, { color: accent }]}>
                  {section.number ?? '•'}
                </Text>
              </View>
            ) : null}
            <Text
              numberOfLines={1}
              style={[
                desktop ? styles.indexItemText : styles.indexPillText,
                { color: active ? accent : colors.text },
              ]}>
              {section.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={[styles.root, !desktop && styles.mobileRoot, { backgroundColor: colors.background }]}>
      {index}
      <ScrollView
        contentContainerStyle={styles.mainContent}
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y + 80;
          let current = helpSections[0]?.id ?? 'resumen';
          for (const section of helpSections) {
            if ((positions.current[section.id] ?? Number.POSITIVE_INFINITY) <= y) current = section.id;
          }
          if (current !== activeId) setActiveId(current);
        }}
        ref={mainScroll}
        scrollEventThrottle={100}
        style={styles.mainScroll}>
        <View style={styles.guideColumn}>
          <View style={styles.hero}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
              <Ionicons color={colors.onPrimary} name="book-outline" size={28} />
            </View>
            <Text style={[styles.eyebrow, { color: accent }]}>INFORHARD S.R.L.</Text>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Guía de uso</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>Manual simple para consultar pagos, liquidaciones, conciliaciones y ventas desde Reportes de Tarjetas.</Text>
            <View style={[styles.readOnlyBadge, { backgroundColor: colors.primarySoft }]}>
              <Ionicons color={accent} name="eye-outline" size={16} />
              <Text style={[styles.readOnlyText, { color: accent }]}>Aplicación de solo lectura</Text>
            </View>
          </View>

          {helpSections.map((section, sectionIndex) => {
            const previousSection = helpSections[sectionIndex - 1];
            const nextSection = helpSections[sectionIndex + 1];

            return <View
              key={section.id}
              onLayout={(event) => registerPosition(section.id, event)}
              style={[styles.section, { borderTopColor: colors.border }]}>
              <View style={styles.sectionHeading}>
                {section.number ? (
                  <View style={[styles.sectionNumber, { backgroundColor: colors.primarySoft }]}>
                    <Text style={[styles.sectionNumberText, { color: accent }]}>{section.number}</Text>
                  </View>
                ) : null}
                <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              </View>
              <View style={styles.blocks}>
                {section.blocks.map((block, index) => <Block block={block} key={`${section.id}-${index}`} />)}
              </View>
              <View style={[styles.sectionNavigation, { borderTopColor: colors.border }]}>
                {previousSection ? (
                  <Pressable onPress={() => navigateTo(previousSection.id)}>
                    <Text style={[styles.sectionLink, { color: accent }]}>← {previousSection.title}</Text>
                  </Pressable>
                ) : <View />}
                {nextSection ? (
                  <Pressable onPress={() => navigateTo(nextSection.id)}>
                    <Text style={[styles.sectionLink, styles.nextLink, { color: accent }]}>{nextSection.title} →</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>;
          })}

          <View style={[styles.supportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons color={accent} name="headset-outline" size={24} />
            <Text style={[styles.supportTitle, { color: accent }]}>Soporte técnico</Text>
            <Text style={[styles.supportText, { color: colors.textMuted }]}>INFORHARD S.R.L. · Reportes de Tarjetas</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', minHeight: 0 },
  mobileRoot: { flexDirection: 'column' },
  desktopIndex: { width: 280, borderRightWidth: 1, flexGrow: 0, flexShrink: 0 },
  desktopIndexContent: { padding: spacing.lg, gap: 3 },
  indexHeading: { marginBottom: spacing.md, gap: 2 },
  indexTitle: { fontSize: 18, fontWeight: '900' },
  indexSubtitle: { fontSize: typography.small },
  indexItem: { minHeight: 42, borderWidth: 1, borderColor: 'transparent', borderRadius: radii.md, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  indexNumber: { width: 25, height: 25, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  indexNumberText: { fontSize: 10, fontWeight: '900' },
  indexItemText: { flex: 1, fontSize: 13, fontWeight: '700' },
  mobileIndex: { flexGrow: 0, height: 58, borderBottomWidth: 1 },
  mobileIndexContent: { paddingHorizontal: spacing.md, paddingVertical: 9, gap: spacing.sm, alignItems: 'center' },
  indexPill: { minHeight: 38, borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  indexPillText: { fontSize: 12, fontWeight: '800' },
  mainScroll: { flex: 1 },
  mainContent: { flexGrow: 1, paddingHorizontal: spacing.md, paddingBottom: 112 },
  guideColumn: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  hero: { paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm, alignItems: 'flex-start' },
  heroIcon: { width: 52, height: 52, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  eyebrow: { fontSize: typography.caption, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '900' },
  description: { maxWidth: 650, fontSize: 16, lineHeight: 25 },
  readOnlyBadge: { marginTop: spacing.sm, minHeight: 34, borderRadius: radii.pill, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  readOnlyText: { fontSize: 12, fontWeight: '800' },
  section: { borderTopWidth: 1, paddingVertical: spacing.xl, gap: spacing.lg },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionNumber: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sectionNumberText: { fontSize: 12, fontWeight: '900' },
  sectionTitle: { flex: 1, fontSize: 23, lineHeight: 29, fontWeight: '900' },
  blocks: { gap: 14 },
  paragraph: { fontSize: 15, lineHeight: 25 },
  blockHeading: { marginTop: spacing.sm, fontSize: 15, lineHeight: 21, fontWeight: '900' },
  definitions: { borderRadius: radii.md, padding: spacing.md, gap: 13 },
  definition: { gap: 3 },
  definitionTerm: { fontSize: 14, fontWeight: '900' },
  definitionText: { fontSize: 14, lineHeight: 21 },
  list: { gap: 9 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  listMarker: { width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  listMarkerText: { fontSize: 11, fontWeight: '900' },
  listText: { flex: 1, minWidth: 0, fontSize: 15, lineHeight: 23 },
  sectionNavigation: { borderTopWidth: 1, paddingTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  sectionLink: { maxWidth: 250, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  nextLink: { textAlign: 'right' },
  supportCard: { borderWidth: 1, borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center', gap: 5 },
  supportTitle: { fontSize: 14, fontWeight: '900' },
  supportText: { fontSize: 13, textAlign: 'center' },
});
