import { PropsWithChildren, useMemo, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Href, usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appRoutes, AppRoute, isRouteActive } from '@/navigation/routes';
import { breakpoints, radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

function NavItem({
  route,
  compact,
  onPress,
}: {
  route: AppRoute;
  compact?: boolean;
  onPress: () => void;
}) {
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const active = isRouteActive(pathname, route.href);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${route.label}. ${route.description}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        compact && styles.navItemCompact,
        {
          backgroundColor: active ? colors.primarySoft : pressed ? colors.surfaceMuted : 'transparent',
          borderColor: 'transparent',
        },
      ]}>
      <View
        style={[
          styles.navSymbol,
          {
            backgroundColor: active ? colors.primary : colors.surfaceMuted,
          },
        ]}>
        <Ionicons
          color={active ? colors.onPrimary : colors.textMuted}
          name={route.icon as keyof typeof Ionicons.glyphMap}
          size={18}
        />
      </View>
      {!compact ? (
        <View style={styles.navCopy}>
          <Text style={[styles.navLabel, { color: active ? colors.primary : colors.text }]}>
            {route.label}
          </Text>
          <Text numberOfLines={1} style={[styles.navDescription, { color: colors.textMuted }]}>
            {route.description}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.brand, compact && styles.brandCompact]}>
      <View style={[styles.logoBox, { backgroundColor: colors.primarySoft }]}>
        <Image
          accessibilityLabel="Logo de Inforhard"
          resizeMode="contain"
          source={require('../../../assets/branding/logo.png')}
          style={styles.logo}
        />
      </View>
      {!compact ? (
        <View style={styles.brandCopy}>
          <Text style={[styles.company, { color: colors.primary }]}>Inforhard S.R.L</Text>
          <Text style={[styles.product, { color: colors.text }]}>Reportes de Tarjetas</Text>
        </View>
      ) : null}
    </View>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDesktop = width >= breakpoints.desktop;
  const isTablet = width >= breakpoints.tablet && !isDesktop;
  const isMobile = width < breakpoints.tablet;
  const compactSidebar = isTablet || sidebarCollapsed;
  const activeRoute = useMemo(
    () => appRoutes.find((route) => isRouteActive(pathname, route.href)) ?? appRoutes[0],
    [pathname],
  );
  const mobileRoutes = appRoutes.slice(0, 4);
  const moreActive = appRoutes.slice(4).some((route) => isRouteActive(pathname, route.href));

  function navigate(route: AppRoute) {
    setMenuOpen(false);
    router.push(route.href as Href);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.shell}>
        {!isMobile ? (
          <View
            style={[
              styles.sidebar,
              compactSidebar && styles.sidebarCompact,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <Brand compact={compactSidebar} />
            <View style={styles.navList}>
              {appRoutes.map((route) => (
                <NavItem
                  compact={compactSidebar}
                  key={route.href}
                  onPress={() => navigate(route)}
                  route={route}
                />
              ))}
            </View>
            <View style={[styles.environment, { backgroundColor: colors.surfaceMuted }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
              {!compactSidebar ? (
                <View>
                  <Text style={[styles.environmentTitle, { color: colors.text }]}>
                    Desarrollo
                  </Text>
                  <Text style={[styles.environmentCopy, { color: colors.textMuted }]}>
                    Datos simulados
                  </Text>
                </View>
              ) : null}
            </View>
            {isDesktop ? (
              <Pressable
                accessibilityLabel={
                  sidebarCollapsed ? 'Abrir menú lateral' : 'Cerrar menú lateral'
                }
                accessibilityRole="button"
                onPress={() => setSidebarCollapsed((current) => !current)}
                style={({ pressed }) => [
                  styles.sidebarToggle,
                  {
                    backgroundColor: pressed ? colors.primarySoft : colors.surfaceMuted,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={[styles.sidebarToggleText, { color: colors.textMuted }]}>
                  {sidebarCollapsed ? '☰' : '‹'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View
          onStartShouldSetResponderCapture={() => {
            if (isDesktop && !sidebarCollapsed) setSidebarCollapsed(true);
            return false;
          }}
          style={styles.main}>
          {isMobile ? (
            <View
              style={[
                styles.mobileHeader,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Brand compact />
              <View style={styles.mobileHeading}>
                <Text style={[styles.mobileProduct, { color: colors.text }]}>
                  {activeRoute?.label}
                </Text>
                <Text style={[styles.mobileCompany, { color: colors.textMuted }]}>Inforhard</Text>
              </View>
              <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>NG</Text>
              </View>
            </View>
          ) : null}

          {children}

          {isMobile ? (
            <View
              accessibilityRole="tablist"
              style={styles.bottomBar}>
              {mobileRoutes.map((route) => {
                const active = isRouteActive(pathname, route.href);
                return (
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    key={route.href}
                    onPress={() => navigate(route)}
                    style={[
                      styles.bottomItem,
                      { backgroundColor: active ? 'rgba(255,255,255,0.20)' : 'transparent' },
                    ]}>
                    <Text
                      style={[
                        styles.bottomLabel,
                        {
                          color: '#FFFFFF',
                          fontWeight: active ? '900' : '700',
                          opacity: active ? 1 : 0.82,
                        },
                      ]}>
                      {route.shortLabel}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                accessibilityLabel="Abrir más secciones"
                accessibilityRole="tab"
                accessibilityState={{ selected: moreActive }}
                onPress={() => setMenuOpen(true)}
                style={[
                  styles.bottomItem,
                  {
                    backgroundColor: moreActive
                      ? 'rgba(255,255,255,0.20)'
                      : 'transparent',
                  },
                ]}>
                <Text
                  style={[
                    styles.bottomLabel,
                    {
                      color: '#FFFFFF',
                      fontWeight: moreActive ? '900' : '700',
                      opacity: moreActive ? 1 : 0.82,
                    },
                  ]}>
                  Más
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
        transparent
        visible={menuOpen}>
        <Pressable
          accessibilityLabel="Cerrar menú"
          onPress={() => setMenuOpen(false)}
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[styles.mobileMenu, { backgroundColor: colors.surface }]}>
            <View style={styles.menuHeader}>
              <View>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Más secciones</Text>
                <Text style={[styles.menuDescription, { color: colors.textMuted }]}>
                  Navegación y preferencias
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Cerrar"
                accessibilityRole="button"
                onPress={() => setMenuOpen(false)}
                style={[styles.closeButton, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.closeText, { color: colors.text }]}>×</Text>
              </Pressable>
            </View>
            {appRoutes.slice(4).map((route) => (
              <NavItem key={route.href} onPress={() => navigate(route)} route={route} />
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  shell: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 220,
    borderRightWidth: 1,
    padding: 10,
    gap: 14,
  },
  sidebarCompact: {
    width: 58,
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  brand: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  brandCompact: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 34,
    height: 34,
    opacity: 1,
  },
  brandCopy: {
    flex: 1,
    gap: 2,
  },
  company: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  product: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  navList: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    minHeight: 46,
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  navItemCompact: {
    width: 46,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navSymbol: {
    width: 29,
    height: 29,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCopy: {
    flex: 1,
    gap: 1,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  navDescription: {
    fontSize: 9,
  },
  environment: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  environmentTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  environmentCopy: {
    fontSize: 9,
  },
  sidebarToggle: {
    width: 40,
    height: 34,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarToggleText: {
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '800',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  mobileHeader: {
    height: 64,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  mobileHeading: {
    flex: 1,
  },
  mobileProduct: {
    fontSize: 15,
    fontWeight: '800',
  },
  mobileCompany: {
    fontSize: 11,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '900',
  },
  bottomBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 58,
    borderWidth: 1,
    borderColor: '#00B85C',
    borderRadius: 22,
    backgroundColor: '#00B85C',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  bottomItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 3,
  },
  bottomLabel: {
    maxWidth: '100%',
    fontSize: 11,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  mobileMenu: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  menuDescription: {
    fontSize: 12,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 24,
    lineHeight: 26,
  },
});
