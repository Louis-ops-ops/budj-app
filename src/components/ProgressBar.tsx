import React from 'react';
import { View } from 'react-native';
import { makeStyles } from '../theme';
import { formatPercent } from '../utils/money';
import { Text } from './Text';
import type { Tone } from './TrendBadge';

type Props = {
  /** Dépensé ÷ budget, de 0 à l'infini. */
  ratio: number;
  tone: Tone;
  /** Texte à droite de la jauge ; par défaut le pourcentage réel arrondi (ex. « 103% »). */
  label?: string;
  showLabel?: boolean;
};

/**
 * Jauge dépensé / alloué (Figma « Barre de progression » 187:36). Le
 * remplissage est proportionnel au ratio exact (Figma s'arrête à des pas de
 * 5 %) ; au-delà de 100 % la jauge est pleine et passe en ton négatif.
 */
export function ProgressBar({ ratio, tone, label, showLabel = true }: Props) {
  const styles = useStyles();
  const safeRatio = Number.isFinite(ratio) ? Math.max(0, ratio) : 1;
  const effectiveTone: Tone = safeRatio > 1 ? 'negative' : tone;
  const fill = Math.min(safeRatio, 1);
  const text = label ?? formatPercent(safeRatio);
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(Math.min(safeRatio, 1) * 100), text }}
    >
      <View style={styles.track}>
        <View style={[styles.fill, styles[effectiveTone], { width: `${fill * 100}%` }]} />
      </View>
      {showLabel && (
        <Text
          variant="caption-medium"
          color={effectiveTone === 'positive' ? 'success' : effectiveTone === 'negative' ? 'danger' : 'brand'}
          style={styles.label}
          numberOfLines={1}
        >
          {text}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: t.spacing[12],
    height: t.sizes.progress.height,
  },
  track: {
    flex: 1,
    height: t.sizes.progress.track,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.bg.brandStrong,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: t.radius.full,
  },
  neutral: {
    backgroundColor: t.colors.bg.accent,
  },
  positive: {
    backgroundColor: t.colors.feedback.success.fg,
  },
  negative: {
    backgroundColor: t.colors.feedback.danger.fg,
  },
  label: {
    width: t.sizes.progress.label,
    textAlign: 'right',
  },
}));
