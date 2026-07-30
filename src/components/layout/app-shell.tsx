import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, usePathname, useRouter } from 'expo-router';
import { PropsWithChildren, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppRoute, appRoutes, isRouteActive } from '@/navigation/routes';
import { breakpoints, radii, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/theme-provider';

function NavItem({
  route,
  horizontal = false,
  onPress,
}: {
  route: AppRoute;
  horizontal?: boolean;
  onPress: () => void;
}) {
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const active = isRouteActive(pathname, route.href);

  return (
    <Pressable
      accessibilityLabel={`${route.label}. ${route.description}`}
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        horizontal && styles.navItemHorizontal,
        active && styles.navItemActive,
        {
          backgroundColor: active
            ? colors.primary
            : pressed
              ? colors.surfaceMuted
              : 'transparent',
          borderColor: active ? colors.primary : pressed ? colors.borderStrong : 'transparent',
        },
      ]}>
      <View
        style={[
          styles.navSymbol,
          { backgroundColor: 'transparent' },
        ]}>
        <Ionicons
          color={active ? '#102018' : colors.textMuted}
          name={route.icon as keyof typeof Ionicons.glyphMap}
          size={horizontal ? 17 : 18}
        />
      </View>
      <View style={horizontal ? styles.topNavCopy : styles.navCopy}>
        <Text
          numberOfLines={1}
          style={[
            horizontal ? styles.topNavLabel : styles.navLabel,
            { color: active ? '#102018' : colors.text },
          ]}>
          {route.label}
        </Text>
        {!horizontal ? (
          <Text numberOfLines={1} style={[styles.navDescription, { color: colors.textMuted }]}>
            {route.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function MobileBrand() {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.logoBox, { backgroundColor: colors.primarySoft }]}>
      <Image
        accessibilityLabel="Logo de Inforhard"
        resizeMode="contain"
        source={require('../../../assets/branding/logo.png')}
        style={styles.logo}
      />
    </View>
  );
}

function TopBrand() {
  return (
    <View style={styles.topBrand}>
      <Image
        accessibilityLabel="Logo horizontal de Inforhard"
        resizeMode="contain"
        source={require('../../../assets/branding/logo-horizontal.png')}
        style={styles.horizontalLogo}
      />
    </View>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = width < breakpoints.tablet;
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
              styles.topNavigation,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <TopBrand />
            <ScrollView
              contentContainerStyle={styles.topNavItems}
              horizontal
              showsHorizontalScrollIndicator={false}>
              {appRoutes.map((route) => (
                <NavItem
                  horizontal
                  key={route.href}
                  onPress={() => navigate(route)}
                  route={route}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.main}>
          {isMobile ? (
            <View
              style={[
                styles.mobileHeader,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <MobileBrand />
              <View style={styles.mobileHeading}>
                <Text style={[styles.mobileProduct, { color: colors.text }]}>
                  {activeRoute?.label ?? 'Inicio'}
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
            <View accessibilityRole="tablist" style={styles.bottomBar}>
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
                    backgroundColor: moreActive ? 'rgba(255,255,255,0.20)' : 'transparent',
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
    flexDirection: 'column',
  },
  topNavigation: {
    minHeight: 70,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
    zIndex: 20,
  },
  topBrand: {
    minWidth: 150,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalLogo: {
    width: 142,
    height: 31,
  },
  topNavItems: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingVertical: 8,
  },
  navItem: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  navItemHorizontal: {
    minHeight: 42,
    paddingHorizontal: 11,
    gap: 5,
  },
  navItemActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  navSymbol: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCopy: {
    flex: 1,
    gap: 1,
  },
  topNavCopy: {
    flexShrink: 0,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  topNavLabel: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  navDescription: {
    fontSize: 9,
  },
  main: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
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
