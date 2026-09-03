import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../theme';
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
          <Icon name="plus" size={20} color={colors.bleue[600]} />
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
    Animated.timing(backgroundProgress, { toValue: isActive ? 1 : 0, duration: 220, useNativeDriver: true }).start();
    if (isActive) {
      labelOpacity.setValue(0);
      Animated.timing(labelOpacity, { toValue: 1, duration: 180, delay: 60, useNativeDriver: true }).start();
    }
  }, [isActive]);

  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Animated.View style={[styles.tabBackground, StyleSheet.absoluteFill, { opacity: backgroundProgress }]} />
      <Icon name={icon} size={20} color={isActive ? colors.bleue[600] : colors.bleue[300]} />
      {isActive && (
        <Animated.Text style={[typography.labelXsMedium, styles.tabLabel, { opacity: labelOpacity }]}>
          {label}
        </Animated.Text>
      )}
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
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(170,180,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(170,180,255,0.3)',
    padding: 6,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  tabBackground: {
    backgroundColor: 'rgba(251,251,251,0.7)',
    borderRadius: radius.pill,
  },
  tabLabel: {
    color: colors.bleue[600],
  },
});
