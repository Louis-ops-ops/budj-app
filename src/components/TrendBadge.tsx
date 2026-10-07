import React from 'react';
import { View } from 'react-native';
import { makeStyles, useTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type Tone = 'positive' | 'negative' | 'neutral';

type Props = {
  /** Positif = économie, Négatif = dépassement, Neutre = mois en cours / stable. */
  tone: Tone;
  label: string;
};

const ICONS: Record<Tone, IconName> = {
  positive: 'trendUp',
  negative: 'trendDown',
  neutral: 'clock',
};

/** Badge d'évolution (Figma « Badge évolution » 187:21). */
export function TrendBadge({ tone, label }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const tint =
    tone === 'positive' ? colors.feedback.success.fg : tone === 'negative' ? colors.feedback.danger.fg : colors.text.brandStrong;
  return (
    <View style={[styles.base, styles[tone]]}>
      <Icon name={ICONS[tone]} size={14} tint={tint} />
      <Text
        variant="label-medium"
        color={tone === 'positive' ? 'success' : tone === 'negative' ? 'danger' : 'brandStrong'}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: t.spacing[4],
    paddingHorizontal: t.spacing[8] - t.sizes.borderWidth.thin,
    paddingVertical: t.spacing[4] - t.sizes.borderWidth.thin,
    borderRadius: t.radius.full,
    borderWidth: t.sizes.borderWidth.thin,
  },
  positive: {
    backgroundColor: t.colors.feedback.success.bg,
    borderColor: t.colors.feedback.success.fg,
  },
  negative: {
    backgroundColor: t.colors.feedback.danger.bg,
    borderColor: t.colors.feedback.danger.fg,
  },
  neutral: {
    backgroundColor: t.colors.bg.app,
    borderColor: t.colors.border.brand,
  },
}));
