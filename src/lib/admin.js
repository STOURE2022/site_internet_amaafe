/** Calculs partagés du tableau de bord d'administration.
    Tout est évalué au build, à partir de content/config.json,
    des collections de contenu et de public/documents/. */
import { readdirSync } from 'node:fs';

/* La médiathèque Decap est une fenêtre modale (bouton « Médias » de
   l'éditeur), sans URL directe ; et elle téléverse dans images/uploads.
   Les PDF de public/documents/ se déposent donc via GitHub. */
export const CMS = '/admin/#';
export const versConfig = `${CMS}/collections/configuration/entries/config`;
export const versEditeur = '/admin/';
export const REPO = 'https://github.com/STOURE2022/site_internet_amaafe';
export const versDocumentsGitHub = `${REPO}/upload/main/public/documents`;

/** Liste des PDF publiés dans public/documents/. */
export function lireDocuments() {
  return readdirSync(new URL('../../public/documents/', import.meta.url)).filter((f) => f.endsWith('.pdf'));
}

/** Données manquantes sur le site, avec sévérité (r = canal de don bloqué). */
export function listeACompleter(config, nbFichesEnfants) {
  const p = config.paiement;
  const statutsPresents = lireDocuments().some((f) => f.toLowerCase().includes('statut'));
  return [
    !p.wave.numero && { titre: 'Numéro Wave', detail: 'Le canal affiche « à communiquer » sur la page don.', sev: 'r', href: versConfig },
    !p.paypal.lien && { titre: 'Lien PayPal', detail: 'Lien paypal.me ou e-mail du compte de l’association.', sev: 'r', href: versConfig },
    !p.virementMali.rib && { titre: 'RIB du compte Mali', detail: 'Coordonnées du virement bancaire au Mali.', sev: 'r', href: versConfig },
    !p.virementFrance.iban && { titre: 'IBAN du compte France', detail: 'Coordonnées du virement bancaire en France.', sev: 'r', href: versConfig },
    !p.orangeMoney.titulaire && { titre: 'Titulaire Orange Money', detail: 'Nom affiché au donateur à la validation.', sev: 'o', href: versConfig },
    !p.wero.titulaire && { titre: 'Titulaire Wero', detail: 'Nom du destinataire à vérifier par le donateur.', sev: 'o', href: versConfig },
    config.medersa.montantCollecteFCFA == null && { titre: 'Montant collecté (médersa)', detail: 'Active la jauge d’avancement de la collecte.', sev: 'o', href: versConfig },
    !statutsPresents && { titre: 'Statuts de l’association (PDF)', detail: 'Déposer le PDF dans public/documents sur GitHub.', sev: 'o', href: versDocumentsGitHub },
    nbFichesEnfants === 0 && { titre: 'Fiches enfants à parrainer', detail: 'Aucune fiche publiée — autorisations parentales signées.', sev: 'o', href: `${CMS}/collections/enfants/new` },
    !config.formulaires.declarationDonUrl && { titre: 'Formulaires externes', detail: 'Déclaration de don, parrainage, contact, newsletter.', sev: 'o', href: versConfig },
  ].filter(Boolean);
}

/** État des canaux de paiement, calculé depuis la configuration. */
export function etatCanaux(config) {
  const p = config.paiement;
  return [
    { nom: 'Orange Money', c: '#F26522', ok: !!p.orangeMoney.numero },
    { nom: 'Wero (Europe)', c: '#7A5CF0', ok: !!p.wero.numero },
    { nom: 'Wave', c: '#1DC3F0', ok: !!p.wave.numero },
    { nom: 'PayPal', c: '#0055B8', ok: !!p.paypal.lien },
    { nom: 'Virement Mali', c: '#D9A62B', ok: !!p.virementMali.rib },
    { nom: 'Virement France', c: '#0F4A2F', ok: !!p.virementFrance.iban },
  ];
}
