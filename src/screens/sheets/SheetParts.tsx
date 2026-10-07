import React from 'react';
import { View } from 'react-native';
import { Text } from '../../components';
import { makeStyles } from '../../theme';

/** En-tête de pop-up : titre (Heading/H1) et élément optionnel à droite. */
export function SheetHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.header}>
      <Text variant="heading-h1" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {right}
    </View>
  );
}

/** Bloc vertical pleine largeur (champ + libellé, chips…). */
export function SheetSection({ children, gap = 12 }: { children: React.ReactNode; gap?: 8 | 12 }) {
  const styles = useStyles();
  return <View style={[styles.section, gap === 8 ? styles.gap8 : styles.gap12]}>{children}</View>;
}

/** Libellé de section (« Catégorie », « Couleur »…). */
export function SheetLabel({ children, color = 'brand' }: { children: React.ReactNode; color?: 'brand' | 'secondary' }) {
  return (
    <Text variant="label-medium" color={color}>
      {children}
    </Text>
  );
}

/** Rangée de chips qui passe à la ligne. */
export function ChipWrap({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return <View style={styles.chips}>{children}</View>;
}

const useStyles = makeStyles((t) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    gap: t.spacing[12],
  },
  title: {
    flexShrink: 1,
  },
  section: {
    alignSelf: 'stretch',
  },
  gap8: {
    gap: t.spacing[8],
  },
  gap12: {
    gap: t.spacing[12],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing[8],
  },
}));
