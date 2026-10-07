let counter = 0;

/** Identifiant unique, même pour plusieurs éléments créés dans la même milliseconde. */
export function createId(prefix: string): string {
  counter = (counter + 1) % 1_000_000;
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${random}`;
}
