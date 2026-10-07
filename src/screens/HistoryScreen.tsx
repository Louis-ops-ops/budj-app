import React from 'react';
import { FlatList, View } from 'react-native';
import { ExpenseGroup, ExpenseRow } from '../components';
import { useBudj } from '../data/BudjContext';
import { findCategory, historyGroups, historyMonthTotal, type HistoryItem } from '../data/selectors';
import { UNCATEGORIZED_LABEL } from '../data/types';
import type { TabScreenProps } from '../navigation/types';
import { makeStyles } from '../theme';
import { dayLabel } from '../utils/dateLabels';
import { formatMoneyCompact } from '../utils/money';
import { ScreenLayout } from './ScreenLayout';
import { EmptyText, PageTitle } from './ScreenParts';

/**
 * Historique (Figma 19:1175) : un groupe par jour, du plus récent au plus
 * ancien, avec le total du jour. Les dépenses fixes déjà prélevées ce mois-ci
 * y figurent aussi.
 */
export function HistoryScreen({ navigation }: TabScreenProps<'History'>) {
  const styles = useStyles();
  const { data, today } = useBudj();
  const groups = historyGroups(data, today);

  const renderItem = (item: HistoryItem) => {
    if (item.kind === 'fixed') {
      return (
        <ExpenseRow
          key={item.key}
          type="fixed"
          label={item.fixed.label}
          detail="Prélèvement automatique"
          amount={item.fixed.amount}
          onPress={() => navigation.navigate('FixedExpenseForm', { fixedExpenseId: item.fixed.id })}
        />
      );
    }
    const { expense } = item;
    const category = findCategory(data, expense.categoryId);
    return (
      <ExpenseRow
        key={item.key}
        type="simple"
        label={expense.label}
        detail={expense.detail ?? category?.name ?? UNCATEGORIZED_LABEL}
        amount={expense.amount}
        amountColor={category?.color ?? 'primary'}
        onPress={() => navigation.navigate('CategoryDetail', { categoryId: expense.categoryId })}
      />
    );
  };

  return (
    <ScreenLayout scrollable={false}>
      <FlatList
        data={groups}
        keyExtractor={(group) => group.date}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <View style={styles.header}>
            <PageTitle
              title="Historique des dépenses"
              subtitle={['Dépensé ce mois-ci', formatMoneyCompact(historyMonthTotal(data, today))]}
            />
          </View>
        }
        ListEmptyComponent={<EmptyText>Aucune dépense pour l’instant : ajoute la première avec le bouton +.</EmptyText>}
        renderItem={({ item: group }) => (
          <ExpenseGroup title={dayLabel(group.date, today)} total={group.total} variant="simple">
            {group.items.map(renderItem)}
          </ExpenseGroup>
        )}
      />
    </ScreenLayout>
  );
}

function Separator() {
  const styles = useStyles();
  return <View style={styles.separator} />;
}

const useStyles = makeStyles((t) => ({
  content: {
    paddingHorizontal: t.layout.screenMargin,
    paddingBottom: t.spacing[24],
  },
  header: {
    paddingBottom: t.spacing[32],
  },
  separator: {
    height: t.spacing[32],
  },
}));
