/** Formate un nombre avec des espaces comme séparateurs de milliers : 10000 → « 10 000 ». */
export function fmtNombre(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Total des saisies « collecte hors ligne » de la médersa (FCFA), ou null
    si l'équipe n'a encore rien saisi. La part HelloAsso, automatique,
    s'ajoute côté navigateur via /api/collecte (public/js/collecte.js). */
export function collecteManuelleFCFA(medersa) {
  const lignes = medersa.collecteHorsLigne ?? [];
  if (lignes.length === 0) return null;
  return lignes.reduce((total, l) => total + (Number(l.montantFCFA) || 0), 0);
}

/** Pourcentage d'avancement de la collecte médersa, arrondi à une décimale.
    La valeur saisie à la main (pourcentageAvancement) prime si elle existe ;
    sinon le pourcentage est calculé depuis les saisies hors ligne et
    l'objectif en euros (parité fixe : 1 € = 655,957 FCFA). */
export function pourcentageCollecte(medersa) {
  if (medersa.pourcentageAvancement != null) return medersa.pourcentageAvancement;
  const collecte = collecteManuelleFCFA(medersa);
  if (collecte == null || medersa.budgetTotalEUR == null) return 0;
  const pct = (collecte / (medersa.budgetTotalEUR * 655.957)) * 100;
  return Math.min(100, Math.round(pct * 10) / 10);
}

/** Formate une date ISO (AAAA-MM-JJ) en français : « 12 mars 2026 ». */
export function fmtDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
