/**
 * Formate un montant en euros à la française (virgule, sans décimale inutile) :
 * 10 -> "10", 20.7 -> "20,7", 24.78 -> "24,78". Arrondi au centime.
 */
export function formatEuro(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return rounded.toString().replace('.', ',');
}
