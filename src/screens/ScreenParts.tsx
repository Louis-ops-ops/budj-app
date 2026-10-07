import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IconButton, Text } from '../components';
import { makeStyles, type CategoryTone, type TextColor, type TextVariant } from '../theme';

type TitleProps = {
  title: string;
  variant?: Extract<TextVariant, 'heading-h1' | 'heading-h2'>;
  color?: TextColor;
  categoryColor?: CategoryTone;
  /** Bouton(s) à droite du titre. */
  actions?: React.ReactNode;
  /** Sous-titre sur deux colonnes (« Budget défini de » … « 1 900€ »). */
  subtitle?: [string, string?];
};

/** Titre de page ou de section, avec actions et sous-titre en text/brand-faint. */
export function PageTitle({ title, variant = 'heading-h1', color, categoryColor, actions, subtitle }: TitleProps) {
  const styles = useStyles();
  return (
    <View style={styles.titleBlock}>
      <View style={styles.row}>
        <Text variant={variant} color={color} categoryColor={categoryColor} accessibilityRole="header" style={styles.shrink}>
          {title}
        </Text>
        {actions && <View style={styles.actions}>{actions}</View>}
      </View>
      {subtitle && (
        <View style={styles.row}>
          <Text variant="body-regular" color="brandFaint" style={styles.shrink}>
            {subtitle[0]}
          </Text>
          {subtitle[1] !== undefined && (
            <Text variant="body-regular" color="brandFaint">
              {subtitle[1]}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

/** Ligne du bouton retour, en tête des écrans de détail. */
export function BackRow() {
  const navigation = useNavigation();
  return (
    <View>
      <IconButton icon="chevron" rotation={180} accessibilityLabel="Retour" onPress={() => navigation.goBack()} />
    </View>
  );
}

/** Message affiché à la place d'une liste vide. */
export function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="label-regular" color="secondary">
      {children}
    </Text>
  );
}

/** Colonne de blocs avec un espacement du design system. */
export function Stack({ gap, children }: { gap: 12 | 16 | 24; children: React.ReactNode }) {
  const styles = useStyles();
  return <View style={styles[`gap${gap}`]}>{children}</View>;
}

const useStyles = makeStyles((t) => ({
  titleBlock: {
    gap: t.spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[12],
  },
  shrink: {
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[12],
  },
  gap12: {
    gap: t.spacing[12],
  },
  gap16: {
    gap: t.spacing[16],
  },
  gap24: {
    gap: t.spacing[24],
  },
}));
