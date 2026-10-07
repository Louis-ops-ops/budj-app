import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, typography } from '../theme/legacy';
import { Icon, IconName } from './Icon';

export type NavSection = 'categories' | 'fixe' | 'historique';

const SECTIONS: { key: NavSection; label: string; icon: IconName }[] = [
  { key: 'categories', label: 'Catégories', icon: 'categories' },
  { key: 'fixe', label: 'Fixe', icon: 'calendar' },
  { key: 'historique', label: 'Historique', icon: 'history' },
];

type Props = {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
  onAdd: () => void;
};

/**
 * "Action bar" du design system : bouton central "+" (ajouter une dépense)
 * puis les 3 sections de navigation, l'onglet actif affichant icône + libellé.
 * Le fond de l'onglet actif fond en fondu (Animated) plutôt que d'apparaître
 * d'un coup, et le "+" a un léger effet de pression.
 */
export function NavBar({ active, onNavigate, onAdd }: Props) {
  const addScale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(addScale, { toValue: 0.88, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const pressOut = () => Animated.spring(addScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: addScale }] }}>
        <Pressable onPress={onAdd} onPressIn={pressIn} onPressOut={pressOut} style={styles.addButton}>
          <Icon name="add" size={20} tint={colors.bleue[600]} />
        </Pressable>
      </Animated.View>

      <View style={styles.tabsContainer}>
        {SECTIONS.map((section) => (
          <NavTab
            key={section.key}
            icon={section.icon}
            label={section.label}
            isActive={section.key === active}
            onPress={() => onNavigate(section.key)}
          />
        ))}
      </View>
    </View>
  );
}

function NavTab({
  icon,
  label,
  isActive,
  onPress,
}: {
  icon: IconName;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const backgroundProgress = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fond/contour animés en JS (les couleurs ne sont pas interpolables par le
    // driver natif) ; l'opacité du libellé, elle, reste native.
    Animated.timing(backgroundProgress, { toValue: isActive ? 1 : 0, duration: 220, useNativeDriver: false }).start();
    if (isActive) {
      labelOpacity.setValue(0);
      Animated.timing(labelOpacity, { toValue: 1, duration: 180, delay: 60, useNativeDriver: true }).start();
    }
  }, [isActive]);

  // Le fond et le contour sont peints sur l'onglet lui-même plutôt que par une
  // vue pleine posée par-dessus : un <Svg> est une vue native à part, qui
  // passait sous ce calque et rendait l'icône invisible une fois l'onglet actif
  // (le calque était blanc à 70 %, il est maintenant blanc opaque).
  const backgroundColor = backgroundProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(251,251,251,0)', 'rgba(251,251,251,1)'],
  });
  const borderColor = backgroundProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(69,73,255,0)', 'rgba(69,73,255,1)'],
  });

  return (
    <Pressable onPress={onPress} style={styles.tabPressable}>
      <Animated.View style={[styles.tab, { backgroundColor, borderColor }]}>
        <Icon name={icon} size={20} tint={isActive ? colors.bleue[500] : colors.bleue[400]} />
        {isActive && (
          <Animated.Text style={[typography.labelXsMedium, styles.tabLabel, { opacity: labelOpacity }]}>
            {label}
          </Animated.Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    width: '100%',
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(170,180,255,0.3)',
    borderWidth: 1,
    borderColor: colors.bleue[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(170,180,255,0.3)',
    padding: 8,
  },
  tabPressable: {
    alignSelf: 'stretch',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    // Contour toujours présent (transparent quand l'onglet est inactif) pour
    // que la largeur des onglets ne bouge pas pendant l'animation.
    borderWidth: 1,
  },
  tabLabel: {
    color: colors.bleue[500],
  },
});
