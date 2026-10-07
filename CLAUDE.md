# CLAUDE.md — Budj

Ce fichier guide Claude Code pour mettre l'app **Budj** à jour avec la v2 du design (refonte Figma d'octobre 2026) : nouveau design system, nouveaux écrans, nouvelles pop-ups et la logique de données qui va avec.

Langue de travail : **français** (code, noms de variables et commentaires en anglais, textes de l'UI en français).

---

## 1. Le projet

- **App** : Budj, gestion de budget personnel (budget mensuel global, catégories avec budget alloué, dépenses fixes mensuelles, historique, évolution mois par mois).
- **Stack** : React Native avec **Expo SDK 57**, **TypeScript strict**, React Navigation (native-stack).
- **Données** : stockage **local uniquement** via `@react-native-async-storage/async-storage`. Pas de serveur. Dans ce document, « back end » désigne la couche de données locale (modèle, persistance, calculs).
- **Dossier** : `D:\Dev_Code\budj-app` (Windows). Les commandes se lancent dans le terminal de VS Code (PowerShell).
- **Police** : Outfit, via `@expo-google-fonts/outfit` (400 Regular, 500 Medium, 600 SemiBold, 700 Bold).

État connu de la v1 (à vérifier, le code a pu évoluer) :
- `src/theme` : tokens v1, à remplacer.
- `src/components` : Button, IconButton, CategoryCard, NavBar, Icon (icônes dessinées à la main, à remplacer par les SVG Figma).
- `src/data/BudjContext.tsx` : contexte + persistance AsyncStorage, données de démo.
- Écrans : Mon budget, Catégories, Détail catégorie, Dépenses fixes (sans calendrier), Historique, Ajouter une dépense.

**Avant de coder** : lis l'arborescence, `package.json`, `src/theme`, `src/data/BudjContext.tsx` et la navigation. Fais un point rapide de l'existant avant la phase 1.

---

## 2. Source de vérité : Figma

- **Fichier** : https://www.figma.com/design/kKK9zGfpK0kRMNVxgZm6Yt/Budj — `fileKey = kKK9zGfpK0kRMNVxgZm6Yt`
- **Pages utiles** :
  - `Fondations` (185:1489) : nuanciers Clair/Sombre, typo, espacements, rayons, ombres
  - `Composants` (185:1490) : bibliothèque de composants
  - `Design` (2:141) : écrans de l'app
- **Pages à ignorer** : `Tests`, `Archive`, `Design system (ancien)`.

Workflow avec le MCP Figma :
1. Charge le skill `figma-design-to-code` s'il est disponible, avant tout appel à `get_design_context`.
2. Appelle `get_design_context` **nœud par nœud** (un écran ou un composant à la fois). Il échoue sur la page entière `2:141`.
3. Compare toujours avec `get_screenshot` du même nœud.
4. Le code renvoyé par Figma est une **référence à adapter** (React web/Tailwind) : traduis-le en React Native avec les tokens et composants du projet, ne le colle pas tel quel.
5. `get_variable_defs` sur un nœud donne les tokens qu'il utilise.

Les écrans de pop-up contiennent un calque `Arrière-plan (…)` (copie de l'écran parent) et un calque `Overlay` : ils servent uniquement au contexte visuel. N'implémente que le calque `Bottom sheet`.

---

## 3. Règles de code

- **Zéro valeur en dur** pour les couleurs, tailles de texte, espacements et rayons : tout passe par le thème. Une valeur absente du thème = ajouter un token, pas un littéral.
- **Mode sombre** dès le départ : le thème expose les modes Clair et Sombre, sélectionnés via `useColorScheme()` (avec un réglage `system | light | dark` dans les données).
- **Montants en centimes** (`number` entier) dans les données. Formatage uniquement à l'affichage avec `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })` (ex. `24,78 €`). Prévoir une variante sans décimales pour les montants ronds de l'UI (`600€`).
- **Dates** : `YYYY-MM-DD` pour un jour, `YYYY-MM` pour un mois. Pas d'objet `Date` stocké.
- **Calculs dans des sélecteurs purs** (`src/data/selectors.ts`), testables sans UI. Les écrans n'additionnent rien eux-mêmes.
- **Dépendances** : toujours `npx expo install <paquet>` pour rester compatible avec le SDK 57.
- **Accessibilité** : zone tactile ≥ 44px, `accessibilityLabel` sur tous les boutons icône, `accessibilityRole` sur les éléments interactifs.
- **Ombres** : utilise la prop `boxShadow` de React Native (supportée par la New Architecture) avec les valeurs du §4.5.
- **Git** : une branche `feat/design-v2`, un commit par phase (messages courts, convention `feat(theme): …`, `feat(data): …`). Si le dossier n'est pas encore un dépôt git, initialise-le. **Ne pousse vers un remote qu'après accord explicite de Louis.**

---

## 4. Design tokens

Structure à reproduire dans `src/theme/` :

```
src/theme/
  primitives.ts   // couleurs brutes, jamais importées par les composants
  colors.ts       // tokens sémantiques { light, dark } aliasés aux primitives
  spacing.ts      // spacing + layout
  radius.ts
  typography.ts   // styles de texte (fontFamily, fontSize, lineHeight)
  shadows.ts
  ThemeProvider.tsx + useTheme()
```

Convention de nommage : le token Figma `bg/brand-subtle` devient `colors.bg.brandSubtle`, `category/vert/fg` devient `colors.category.vert.fg`.

### 4.1 Primitives

| Famille | Valeurs |
|---|---|
| neutral | 0 `#FFFFFF` · 50 `#FBFBFB` · 100 `#F6F6F6` · 200 `#E8E8E8` · 300 `#CCCCCC` · 400 `#B5B5B5` · 500 `#8A8A8A` · 600 `#626262` · 700 `#444444` · 800 `#2A2A2E` · 900 `#18181B` · 950 `#060606` |
| blue | 50 `#F1F3FF` · 100 `#E6E9FF` · 200 `#D0D7FF` · 300 `#AAB4FF` · 400 `#7B85FF` · 500 `#4549FF` · 600 `#2A20FF` · 700 `#1D0EF3` · 800 `#170BCC` · 900 `#170CB0` · 950 `#070471` · 975 `#0E0F2E` |
| green | 100 `#E5F2E4` · 200 `#B8E3B3` · 700 `#116D09` · 900 `#0F2A0D` |
| mauve | 100 `#FFF1F6` · 200 `#F5B8DD` · 700 `#6D094C` · 900 `#2E0A22` |
| orange | 100 `#FFE7D0` · 200 `#F5D2A6` · 700 `#6D4309` · 900 `#2E1F0A` |
| red | 100 `#FFD0D1` · 200 `#F5B0B2` · 500 `#FF383C` · 700 `#6D090B` · 900 `#2E0A0B` |
| cyan | 100 `#D0F5FF` · 200 `#A9E4F7` · 700 `#09386D` · 900 `#0A1F33` |
| alpha | blue-300-20 `#AAB4FF33` · blue-300-30 `#AAB4FF4D` · white-10 `#FFFFFF1A` · white-70 `#FFFFFFB3` · green-700-30 `#116D094D` · red-700-30 `#6D090B4D` · black-25 `#00000040` · black-40 `#00000066` · black-60 `#00000099` |

Les valeurs `alpha/*` sont en `#RRGGBBAA`.

### 4.2 Couleurs sémantiques (Clair / Sombre)

| Token | Clair (alias → hex) | Sombre (alias → hex) |
|---|---|---|
| `bg/app` | neutral/50 → `#FBFBFB` | neutral/950 → `#060606` |
| `bg/sheet` | neutral/100 → `#F6F6F6` | neutral/900 → `#18181B` |
| `bg/surface` | neutral/0 → `#FFFFFF` | neutral/800 → `#2A2A2E` |
| `bg/brand-subtle` | blue/50 → `#F1F3FF` | blue/975 → `#0E0F2E` |
| `bg/brand-muted` | blue/100 → `#E6E9FF` | blue/950 → `#070471` |
| `bg/brand-strong` | blue/200 → `#D0D7FF` | blue/900 → `#170CB0` |
| `bg/accent` | blue/500 → `#4549FF` | blue/500 → `#4549FF` |
| `bg/icon-button` | alpha/blue-300-20 → `#AAB4FF33` | alpha/blue-300-20 → `#AAB4FF33` |
| `bg/nav-action` | alpha/blue-300-30 → `#AAB4FF4D` | alpha/blue-300-30 → `#AAB4FF4D` |
| `bg/nav-active` | neutral/50 → `#FBFBFB` | neutral/800 → `#2A2A2E` |
| `bg/danger` | red/500 → `#FF383C` | red/500 → `#FF383C` |
| `bg/success-subtle` | alpha/green-700-30 → `#116D094D` | alpha/green-700-30 → `#116D094D` |
| `bg/danger-subtle` | alpha/red-700-30 → `#6D090B4D` | alpha/red-700-30 → `#6D090B4D` |
| `bg/overlay` | alpha/black-40 → `#00000066` | alpha/black-60 → `#00000099` |
| `text/primary` | neutral/950 → `#060606` | neutral/50 → `#FBFBFB` |
| `text/secondary` | neutral/400 → `#B5B5B5` | neutral/500 → `#8A8A8A` |
| `text/tertiary` | neutral/700 → `#444444` | neutral/300 → `#CCCCCC` |
| `text/on-accent` | neutral/50 → `#FBFBFB` | neutral/50 → `#FBFBFB` |
| `text/brand` | blue/500 → `#4549FF` | blue/300 → `#AAB4FF` |
| `text/brand-strong` | blue/600 → `#2A20FF` | blue/200 → `#D0D7FF` |
| `text/brand-subtle` | blue/400 → `#7B85FF` | blue/400 → `#7B85FF` |
| `text/brand-faint` | blue/300 → `#AAB4FF` | blue/400 → `#7B85FF` |
| `text/brand-deep` | blue/950 → `#070471` | blue/100 → `#E6E9FF` |
| `text/success` | green/700 → `#116D09` | green/200 → `#B8E3B3` |
| `text/danger` | red/700 → `#6D090B` | red/200 → `#F5B0B2` |
| `icon/primary` | neutral/950 → `#060606` | neutral/50 → `#FBFBFB` |
| `icon/brand` | blue/500 → `#4549FF` | blue/300 → `#AAB4FF` |
| `icon/on-accent` | neutral/50 → `#FBFBFB` | neutral/50 → `#FBFBFB` |
| `icon/muted` | neutral/400 → `#B5B5B5` | neutral/500 → `#8A8A8A` |
| `icon/danger` | red/500 → `#FF383C` | red/500 → `#FF383C` |
| `border/brand` | blue/500 → `#4549FF` | blue/400 → `#7B85FF` |
| `border/brand-subtle` | blue/300 → `#AAB4FF` | blue/800 → `#170BCC` |
| `border/subtle` | blue/50 → `#F1F3FF` | blue/950 → `#070471` |
| `border/glass` | alpha/white-10 → `#FFFFFF1A` | alpha/white-10 → `#FFFFFF1A` |
| `feedback/success/bg` | green/100 → `#E5F2E4` | green/900 → `#0F2A0D` |
| `feedback/success/fg` | green/700 → `#116D09` | green/200 → `#B8E3B3` |
| `feedback/danger/bg` | red/100 → `#FFD0D1` | red/900 → `#2E0A0B` |
| `feedback/danger/fg` | red/700 → `#6D090B` | red/200 → `#F5B0B2` |
| `category/vert/bg` | green/100 → `#E5F2E4` | green/900 → `#0F2A0D` |
| `category/vert/fg` | green/700 → `#116D09` | green/200 → `#B8E3B3` |
| `category/mauve/bg` | mauve/100 → `#FFF1F6` | mauve/900 → `#2E0A22` |
| `category/mauve/fg` | mauve/700 → `#6D094C` | mauve/200 → `#F5B8DD` |
| `category/orange/bg` | orange/100 → `#FFE7D0` | orange/900 → `#2E1F0A` |
| `category/orange/fg` | orange/700 → `#6D4309` | orange/200 → `#F5D2A6` |
| `category/rouge/bg` | red/100 → `#FFD0D1` | red/900 → `#2E0A0B` |
| `category/rouge/fg` | red/700 → `#6D090B` | red/200 → `#F5B0B2` |
| `category/cyan/bg` | cyan/100 → `#D0F5FF` | cyan/900 → `#0A1F33` |
| `category/cyan/fg` | cyan/700 → `#09386D` | cyan/200 → `#A9E4F7` |
| `category/bleu/bg` | blue/50 → `#F1F3FF` | blue/975 → `#0E0F2E` |
| `category/bleu/fg` | blue/950 → `#070471` | blue/100 → `#E6E9FF` |
| `effect/shadow` | alpha/black-25 → `#00000040` | alpha/black-25 → `#00000040` |

Les catégories utilisateur ont 5 couleurs possibles : `vert`, `mauve`, `orange`, `rouge`, `cyan`. **`bleu` est réservé aux dépenses fixes.**

### 4.3 Espacements, layout, rayons

- `spacing` : 0, 2, 4, 6, 8, 10, 12, 16, 18, 24, 32
- `layout` : `screenMargin` 24, `screenTop` 44, `screenBottom` 24
- `radius` : `none` 0, `xs` 2, `sm` 8, `md` 12, `lg` 24, `xl` 32, `full` 999
- Écran de référence : 393 × 852 (iPhone 16).

### 4.4 Typographie (police Outfit)

| Style | Graisse | Taille / interligne |
|---|---|---|
| Display/XL | Medium | 96 / 96 |
| Display/L | Bold | 84 / 84 |
| Display/M | Medium | 64 / 64 |
| Heading/H1 | Bold | 22 / 24 |
| Heading/H2 | SemiBold | 20 / 22 |
| Heading/H3 | Medium | 18 / 20 |
| Body/Regular | Regular | 16 / 18 |
| Body/Medium | Medium | 16 / 18 |
| Body/Bold | Bold | 16 / 18 |
| Label/Regular | Regular | 14 / 16 |
| Label/Medium | Medium | 14 / 16 |
| Label/Bold | Bold | 14 / 16 |
| Caption/Medium | Medium | 10 / 12 |

Composant `Text` du projet avec une prop `variant` (`'display-xl' | … | 'caption-medium'`) et une prop `color` qui n'accepte que des tokens `text/*`.

### 4.5 Ombres

| Style | Valeur |
|---|---|
| Ombre/Carte | `0 4px 4px rgba(0,0,0,0.25)` |
| Ombre/Légère | `0 1px 2px rgba(0,0,0,0.25)` |
| Ombre/Élevée | `0 1px 2px rgba(0,0,0,0.10), 0 3px 3px rgba(0,0,0,0.09), 0 6px 4px rgba(0,0,0,0.05), 0 11px 4px rgba(0,0,0,0.01)` |

---

## 5. Composants

Chaque composant Figma a son équivalent React Native. Récupère sa référence avec `get_design_context` sur l'ID indiqué.

| Figma (ID) | Composant RN | Props principales |
|---|---|---|
| Icônes `Icône/*` (185:1938 → 185:1960) | `icons/*.tsx` + `Icon` | `name`, `color` (token `icon/*`), `size` (16 / 20 / 24) |
| Bouton (185:1970) | `Button` | `label`, `variant: 'primary' \| 'secondary'`, `icon?`, `disabled` (opacité 0.4), `fullWidth` |
| Bouton icône (187:4) | `IconButton` | `icon`, `accessibilityLabel` — 32×32 visuel, zone tactile 44 |
| Badge évolution (187:21) | `TrendBadge` | `tone: 'positive' \| 'negative' \| 'neutral'`, `label` |
| Barre de progression (187:36) | `ProgressBar` | `ratio` (0 → ∞), `tone`, `label?` |
| Nav item (187:47), Nav bouton ajouter (187:48), Nav bar (187:1482) | `TabBar` (prop `tabBar` du navigateur à onglets) | onglets Catégories, Fixes, Historique, Évolution + bouton « + » |
| Champ de formulaire (188:85) | `TextField` | `label`, `value`, `placeholder`, `type: 'simple' \| 'double' \| 'select'` |
| Jour calendrier (188:1429) | `CalendarDay` | `day`, `state: 'default' \| 'withExpense' \| 'today' \| 'selected'`, `dots` (1–3) |
| Calendrier (188:1430) | `MonthCalendar` | `month`, `markedDays`, `selectedDay`, `onSelectDay` |
| Ligne dépense (190:140) | `ExpenseRow` | `type: 'fixed' \| 'simple' \| 'move'`, `label`, `detail`, `amount`, `amountColor`, `logo?`, `selected?` |
| Carte catégorie (190:264) | `CategoryCard` | `category`, `remaining`, `budget`, `mode: 'normal' \| 'delete'` |
| Carte dépenses fixes (190:265) | `FixedSummaryCard` | `total`, `breakdown[]` |
| Carte budget (191:153) | `BudgetCard` | `total`, `spent`, `saved?`, `tone` |
| Groupe de dépenses (191:216) | `ExpenseGroup` | `title`, `total`, `variant: 'fixed' \| 'simple'`, `children` |
| Barre graphique (192:163), Col mois (198:223), Graphique économies (198:224) | `SavingsChart` | `months: { label, value, selected }[]` |
| Ligne mois (192:209) | `MonthRow` | `month`, `spent`, `result`, `state: 'progress' \| 'regress' \| 'current'`, `ratio` |
| Ligne catégorie évolution (192:270) | `CategoryCompareRow` | `category`, `amount`, `previous`, `delta` |
| Chip catégorie (205:261) | `CategoryChip` | `label`, `color`, `selected`, `onPress` |
| Chip nouvelle catégorie (205:262) | `AddChip` | `label`, `onPress` |

**Proportions** : dans Figma, la Barre de progression et le graphique utilisent des variantes par pas de 5 %. C'est une limite de Figma. **En code, calcule la taille exacte** :
- `ProgressBar` : largeur du remplissage = `clamp(ratio, 0, 1) × largeur de la piste`. Le texte affiche le pourcentage réel arrondi (ex. `103%`).
- `SavingsChart` : hauteur d'une barre = `|valeur| ÷ max(|valeurs|) × 52px` (minimum 2px). Barres positives au-dessus de l'axe, négatives en dessous. Le libellé de valeur suit le haut (positif) ou le bas (négatif) de sa barre.

Motifs présents dans les pop-ups mais pas en composant Figma, à créer en code :
- `BottomSheet` : poignée 40×5 (`bg/brand-strong`), fond `bg/sheet`, rayon haut `lg`, padding 12/24/32/24, gap 24, overlay `bg/overlay`.
- `AmountInput` : montant en `Display/XL` centré, curseur 3px `bg/accent`, devise `€` en `Display/M` `text/secondary`. Valeur vide = `0` en `text/secondary`. Ligne d'aide en dessous (`Label/Regular`).
- `DateChip` : pastille « Aujourd'hui » (icône Calendrier 16px, `bg/brand-subtle`, contour `border/brand-subtle`).
- `DayPicker` : rangée horizontale défilante de `CalendarDay` (jours 1 à 31).
- `ColorSwatchPicker` : 5 pastilles 36px (fond `category/*/bg`, contour 2px `category/*/fg`), la sélectionnée entourée d'un anneau 48px de 2px.
- `QuickAdjust` : 4 boutons pilule `−50 €`, `−10 €`, `+10 €`, `+50 €`.
- `TextLink` : action secondaire en texte (`Body/Medium`, `text/brand`, icône optionnelle).

---

## 6. Données (« back end » local)

### 6.1 Modèle

```ts
type CategoryColor = 'vert' | 'mauve' | 'orange' | 'rouge' | 'cyan';

interface Settings {
  monthlyBudget: number;            // centimes, ex. 190000
  theme: 'system' | 'light' | 'dark';
}

interface Category {
  id: string;
  name: string;                     // unique, non vide
  color: CategoryColor;
  monthlyBudget: number;            // centimes
  createdAt: string;                // YYYY-MM-DD
}

interface FixedSubcategory {        // Épargne, Factures, Distractions + celles créées par l'utilisateur
  id: string;
  name: string;
}

interface FixedExpense {
  id: string;
  label: string;                    // ex. Netflix
  amount: number;                   // centimes, par mois
  dayOfMonth: number;               // 1–31 (si le mois est plus court : dernier jour du mois)
  subcategoryId: string;
  logo?: string;                    // clé d'un logo connu, optionnel
}

interface Expense {
  id: string;
  amount: number;                   // centimes
  label: string;
  categoryId: string | null;        // null = « Sans catégorie »
  date: string;                     // YYYY-MM-DD
  detail?: string;                  // ex. « Carte bancaire »
}

interface BudjData {
  schemaVersion: 2;
  settings: Settings;
  categories: Category[];
  fixedSubcategories: FixedSubcategory[];
  fixedExpenses: FixedExpense[];
  expenses: Expense[];
}
```

- **Persistance** : une seule clé `budj:data:v2`, écriture débouncée (≈300 ms).
- **Migration** : au démarrage, si `budj:data:v2` est absente et que des données v1 existent, migre-les (lis d'abord comment la v1 stocke ses données dans `BudjContext.tsx`), puis garde l'ancienne clé intacte. Sinon, données de démo cohérentes.
- **Actions** : `addExpenses(expenses[])` (une ou plusieurs d'un coup), `moveExpenses(ids, categoryId)`, `deleteExpense`, `addCategory`, `updateCategoryBudget`, `deleteCategory`, `addFixedExpense`, `updateFixedExpense`, `deleteFixedExpense`, `addFixedSubcategory`, `setMonthlyBudget`, `setTheme`.

### 6.2 Règles de calcul (sélecteurs)

Tous les calculs se font pour un mois `YYYY-MM` (par défaut le mois courant).

- **Total dépenses fixes du mois** = somme des `FixedExpense.amount`. Elles sont **engagées dès le 1er du mois** : elles comptent entièrement dans le restant global.
- **Dépenses fixes « déjà prélevées »** = celles dont `dayOfMonth ≤ jour actuel` (utilisé par la Carte budget de l'écran Dépenses fixes : `Dépensé` = prélevées, `Budget total` = total des fixes).
- **Dépensé variable du mois** = somme des `Expense.amount` dont `date` est dans le mois.
- **Restant global** (gros chiffre de l'accueil) = `monthlyBudget − total fixes − dépensé variable`.
- **Restant d'une catégorie** = `category.monthlyBudget − dépensé du mois dans la catégorie`. Négatif = dépassement (afficher en `text/danger`).
- **Budget réparti** = `Σ budgets des catégories + total fixes`. **Reste à répartir** = `monthlyBudget − budget réparti`. À la création ou modification d'une catégorie, alerter si le reste devient négatif (sans bloquer).
- **Ton des jauges** :
  - catégorie : `positive` si dépensé ≤ budget, `negative` sinon ;
  - dépenses fixes : `neutral` ;
  - mois en cours (Évolution) : `neutral`.
- **Économie d'un mois** = `monthlyBudget − (total fixes + dépensé variable)`. Positive = économie, négative = dépassement.
- **Ligne mois** : mois courant → `current` (« X € restants ») ; mois passés → `progress` si économie ≥ 0, sinon `regress`.
- **Graphique économies** : les 6 derniers mois, mois sélectionné = mois courant. Total affiché = somme des économies des 6 mois (« +280€ sur 6 mois »).
- **Comparaison au mois précédent** (Détail d'un mois) : pour chaque catégorie, `delta = dépensé(mois) − dépensé(mois − 1)`. Badge `positive` si delta < 0 (on dépense moins), `negative` si delta > 0, `neutral` (« Stable ») si delta = 0.
- **Badge « vs mois précédent »** sur l'écran Évolution = différence d'économie entre le mois courant et le précédent.
- **Impact dans la pop-up d'ajout** : `restant catégorie − montant saisi` → « Il restera X € sur [catégorie] ». Si négatif → « Dépassement de X € » en `text/danger`.
- **Coût annuel d'une dépense fixe** = `amount × 12`.
- **Calendrier des fixes** : un jour est `withExpense` s'il porte au moins une dépense fixe ; nombre de points = `min(nombre de fixes ce jour, 3)`.

Écris des tests unitaires pour ces sélecteurs (Jest via `jest-expo`).

---

## 7. Navigation et écrans

```
RootStack (native-stack)
├── Tabs (TabBar custom)
│   ├── Catégories (Accueil)
│   ├── Fixes
│   ├── Historique
│   └── Évolution
├── CategoryDetail
├── MoveExpense
├── FixedByCategory          (vue Dépenses fixes ouverte depuis la carte de l'accueil)
├── MonthDetail
└── Sheets (presentation: 'formSheet')
    ├── AddExpense            (simple + multiple)
    ├── NewCategory
    ├── EditBudget
    └── FixedExpenseForm
```

Pour les pop-ups, essaie d'abord `presentation: 'formSheet'` de native-stack (`sheetAllowedDetents: 'fitToContents'`, `sheetGrabberVisible`). Si le rendu ne colle pas au design (overlay, rayon, poignée), utilise `@gorhom/bottom-sheet` (installer avec `npx expo install`, vérifier la compatibilité avec le SDK 57).

### 7.1 Écrans et nœuds Figma

| Écran / pop-up | Nœud | Notes |
|---|---|---|
| Accueil — Mon budget | 181:1312 | Restant global en `Display/L` `text/brand`, Carte dépenses fixes en tête, puis Cartes catégorie |
| Accueil — mode suppression | 30:763 | Cartes en `mode: 'delete'` (icône poubelle `icon/danger`), confirmation avant suppression |
| Détail catégorie | 18:931 | Titre en `category/*/fg`, Carte budget, « Dernières dépenses » |
| Déplacer une dépense | 29:502 | Lignes en `type: 'move'` (sélection multiple), bloc « Déplacer vers ? » + Valider |
| Dépenses fixes (vue catégorie) | 181:1349 | Carte budget Neutre + Groupes de dépenses par sous-catégorie ; actions modifier/supprimer en bas |
| Onglet Fixes (calendrier) | 9:174 | Calendrier du mois + liste ; tap sur un jour = filtre la liste ; bouton « Ajouter » |
| Historique | 19:1175 | Groupes par jour (titre « 4 août », total du jour) |
| Évolution — Mois par mois | 171:632 (+ 173:855 scrollé) | Économie du mois en `Display/L`, badge vs mois précédent, Graphique économies, liste Ligne mois |
| Évolution — Détail d'un mois | 173:710 | Carte budget avec ligne « Économisé », comparaison par catégorie |
| Pop-up Ajouter — vide | 204:1140 | Bouton désactivé tant que montant = 0 ou aucune catégorie |
| Pop-up Ajouter — remplie | 204:1210 | Ligne d'impact budget sous le montant |
| Pop-up Ajouter — multiple | 205:1265 | Une carte par dépense (montant, libellé, chips défilantes), poubelle dès la 2e, total, « Ajouter les N dépenses » |
| Pop-up Nouvelle catégorie | 207:1237 | Aperçu live (CategoryCard), nom, budget, barre « Budget réparti », ColorSwatchPicker |
| Pop-up Modifier le budget | 208:1310 | AmountInput pré-rempli, « Budget actuel : X (±écart) », QuickAdjust, aperçu BudgetCard |
| Pop-up Dépense fixe — vide | 209:1378 | AmountInput, libellé, DayPicker, chips sous-catégorie (bleu) |
| Pop-up Dépense fixe — remplie | 209:1450 | Aide « Soit X € par an », résumé « Le 12 de chaque mois » |

Comportements des pop-ups :
- Le clavier numérique (`keyboardType="decimal-pad"`) s'ouvre sur l'`AmountInput` à l'ouverture.
- La virgule est le séparateur décimal, 2 décimales maximum.
- La chip « + Nouvelle » ouvre la pop-up Nouvelle catégorie (ou ajoute une sous-catégorie fixe), puis revient avec la nouvelle valeur sélectionnée.
- `DateChip` ouvre un sélecteur de date (par défaut aujourd'hui).
- « Ajouter une autre dépense » dans la pop-up simple bascule vers le mode multiple en conservant la première saisie.

---

## 8. Plan de travail

Avance phase par phase. À la fin de chaque phase : `npx tsc --noEmit` sans erreur, commit, puis un court récapitulatif à Louis.

1. **Audit** : état du repo, dépendances, données v1, navigation. Créer la branche `feat/design-v2`.
2. **Thème** : primitives, sémantique Clair/Sombre, typo, espacements, rayons, ombres, `ThemeProvider`. Supprimer les tokens v1.
3. **Icônes** : exporter les 12 SVG depuis Figma (`get_design_context` ou `download_assets` sur 185:1938 → 185:1960), les intégrer avec `react-native-svg`, supprimer les icônes dessinées à la main.
4. **Composants** du §5, chacun comparé à son `get_screenshot`.
5. **Données** : modèle v2, migration, sélecteurs, tests.
6. **Écrans** du §7.1, dans l'ordre : Accueil → Détail catégorie → Fixes → Historique → Évolution.
7. **Pop-ups** : Ajouter (simple puis multiple), Nouvelle catégorie, Modifier le budget, Dépense fixe.
8. **QA** :
   - `npx tsc --noEmit`, `npx expo-doctor`, tests verts ;
   - chaque écran comparé à son screenshot Figma, en Clair **et** en Sombre ;
   - recherche de couleurs ou tailles en dur (`grep -rE "#[0-9A-Fa-f]{6}|fontSize: [0-9]" src/` hors `src/theme`) ;
   - test manuel dans Expo Go : ajout simple et multiple, création de catégorie, modification de budget, dépense fixe, déplacement, suppression, relance de l'app (persistance).

---

## 9. Points à valider avec Louis

Si une de ces décisions bloque, demande avant d'implémenter :
- Suppression d'une catégorie qui a des dépenses : par défaut, les dépenses passent en « Sans catégorie ».
- Dépenses fixes comptées en totalité dès le 1er du mois dans le restant global (choix par défaut ci-dessus).
- Les logos des dépenses fixes (Netflix, SFR, EDF…) : images fournies ou simple initiale sur fond coloré en attendant.
- Les montants des maquettes Figma sont illustratifs et pas toujours cohérents entre eux : ne t'en sers pas pour les données de démo, calcule-les avec les règles du §6.2.
