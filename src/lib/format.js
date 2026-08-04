/** Formate un nombre avec des espaces comme séparateurs de milliers : 10000 → « 10 000 ». */
export function fmtNombre(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Formate une date ISO (AAAA-MM-JJ) en français : « 12 mars 2026 ». */
export function fmtDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
