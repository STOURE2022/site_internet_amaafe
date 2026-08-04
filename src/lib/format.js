/** Formate un nombre avec des espaces comme séparateurs de milliers : 10000 → « 10 000 ». */
export function fmtNombre(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Pourcentage d'avancement de la collecte médersa, arrondi à une décimale.
    La valeur saisie à la main (pourcentageAvancement) prime si elle existe ;
    sinon le pourcentage est calculé depuis le montant collecté en FCFA et
    l'objectif en euros (parité fixe : 1 € = 655,957 FCFA). */
export function pourcentageCollecte(medersa) {
  if (medersa.pourcentageAvancement != null) return medersa.pourcentageAvancement;
  if (medersa.montantCollecteFCFA == null || medersa.budgetTotalEUR == null) return 0;
  const pct = (medersa.montantCollecteFCFA / (medersa.budgetTotalEUR * 655.957)) * 100;
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
