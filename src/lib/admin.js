/** Calculs partagés du tableau de bord d'administration.
    Tout est évalué au build, à partir de content/config.json,
    des collections de contenu et de public/documents/. */
import { readdirSync, statSync } from 'node:fs';

/* La médiathèque Decap est une fenêtre modale (bouton « Médias » de
   l'éditeur), sans URL directe ; et elle téléverse dans images/uploads.
   Les PDF de public/documents/ se déposent donc via GitHub. */
export const CMS = '/admin/#';
export const versConfig = `${CMS}/collections/configuration/entries/config`;

/** Lien vers l'éditeur, ouvert directement sur une section de la
    configuration : « ?cible=… » est lu par public/admin/index.html qui
    défile jusqu'à la section et la surligne. Le libellé doit être
    exactement celui du formulaire Decap (public/admin/config.yml). */
export const versConfigSection = (section) =>
  `/admin/?cible=${encodeURIComponent(section)}#/collections/configuration/entries/config`;
export const versEditeur = '/admin/';
export const REPO = 'https://github.com/STOURE2022/site_internet_amaafe';
export const versDocumentsGitHub = `${REPO}/upload/main/public/documents`;

/** Les emplacements photo du site (config.photos), avec les pages où
    chacun apparaît — même ordre que le formulaire de l'éditeur. */
export const PHOTOS_SITE = [
  { cle: 'familleCentre', label: 'Les élèves du centre (photo de famille)', pages: 'Accueil' },
  { cle: 'elevesUniforme', label: 'Les élèves en uniforme', pages: 'Accueil · Le Centre' },
  { cle: 'unCours', label: 'Un cours au centre', pages: 'Accueil · Le Centre' },
  { cle: 'sortieEducative', label: 'Une sortie éducative', pages: "Accueil · Le Centre · L'AMAAFE" },
  { cle: 'courCentre', label: 'La cour du centre', pages: 'Le Centre' },
  { cle: 'hangar', label: 'Les cours sous le hangar en tôle', pages: 'Accueil · Le Centre · Notre projet' },
  { cle: 'remiseFournitures', label: 'Remise des fournitures', pages: 'Le Centre' },
  { cle: 'recitation', label: 'La récitation', pages: 'Le Centre' },
  { cle: 'uniformes', label: 'Les uniformes', pages: 'Le Centre' },
  { cle: 'detente', label: 'Moment de détente', pages: 'Le Centre' },
  { cle: 'sensibilisation', label: 'Une action de sensibilisation', pages: "L'AMAAFE" },
  { cle: 'equipeAmaafe', label: "L'équipe AMAAFE", pages: "L'AMAAFE" },
  { cle: 'planMedersa', label: "Plan ou vue d'artiste de la future médersa", pages: 'Accueil · Notre projet' },
];

/** Liste des PDF publiés dans public/documents/. */
export function lireDocuments() {
  return readdirSync(new URL('../../public/documents/', import.meta.url)).filter((f) => f.endsWith('.pdf'));
}

/** Documents publiés : la liste vit dans config.documentsPublies (gérée
    dans l'admin, PDF téléversés dans public/documents) ; la taille est
    lue sur le disque quand le fichier existe. */
export function lireDocumentsPublies(config) {
  const dossier = new URL('../../public/documents/', import.meta.url);
  return (config.documentsPublies ?? []).map((d) => {
    let taille = null;
    try {
      taille = statSync(new URL(encodeURIComponent((d.fichier ?? '').split('/').pop()), dossier)).size;
    } catch { /* fichier introuvable : la carte s'affiche sans taille */ }
    return { titre: d.titre, description: d.description ?? null, href: d.fichier, taille };
  });
}

/** Y a-t-il des statuts parmi les documents publiés ? */
export function statutsPublies(config) {
  return (config.documentsPublies ?? []).some((d) =>
    `${d.titre ?? ''} ${d.fichier ?? ''}`.toLowerCase().includes('statut'));
}

/** Images de la médiathèque (public/images/uploads/), avec taille et URL. */
export function lireMedias() {
  const dossier = new URL('../../public/images/uploads/', import.meta.url);
  return readdirSync(dossier)
    .filter((f) => /\.(jpe?g|png|webp|gif|svg)$/i.test(f))
    .map((f) => ({ nom: f, taille: statSync(new URL(f, dossier)).size, href: `/images/uploads/${f}` }));
}

/** Taille de fichier lisible : « 148 Ko », « 3,7 Mo ». */
export function fmtTaille(octets) {
  return octets >= 1e6
    ? (octets / 1e6).toFixed(1).replace('.', ',') + ' Mo'
    : Math.max(1, Math.round(octets / 1024)) + ' Ko';
}

/** Données manquantes sur le site, avec sévérité (r = canal de don bloqué). */
export function listeACompleter(config, nbFichesEnfants) {
  const p = config.paiement;
  const statutsPresents = statutsPublies(config);
  const photosManquantes = PHOTOS_SITE.filter((ph) => !(config.photos ?? {})[ph.cle]).length;
  return [
    !p.wave.numero && { titre: 'Numéro Wave', detail: 'Le canal affiche « à communiquer » sur la page don.', sev: 'r', href: versConfigSection('Coordonnées de paiement') },
    !p.paypal.lien && { titre: 'Lien PayPal', detail: 'Lien paypal.me ou e-mail du compte de l’association.', sev: 'r', href: versConfigSection('Coordonnées de paiement') },
    !p.virementMali.rib && { titre: 'RIB du compte Mali', detail: 'Coordonnées du virement bancaire au Mali.', sev: 'r', href: versConfigSection('Coordonnées de paiement') },
    !p.virementFrance.iban && { titre: 'IBAN du compte France', detail: 'Coordonnées du virement bancaire en France.', sev: 'r', href: versConfigSection('Coordonnées de paiement') },
    !p.orangeMoney.titulaire && { titre: 'Titulaire Orange Money', detail: 'Nom affiché au donateur à la validation.', sev: 'o', href: versConfigSection('Coordonnées de paiement') },
    !p.wero.titulaire && { titre: 'Titulaire Wero', detail: 'Nom du destinataire à vérifier par le donateur.', sev: 'o', href: versConfigSection('Coordonnées de paiement') },
    config.medersa.montantCollecteFCFA == null && { titre: 'Montant collecté (médersa)', detail: 'Active la jauge d’avancement de la collecte.', sev: 'o', href: versConfigSection('Projet de médersa') },
    !statutsPresents && { titre: 'Statuts de l’association (PDF)', detail: 'Téléversez le PDF depuis l’admin, section Documents.', sev: 'o', href: versConfigSection('Documents à télécharger (page Transparence)') },
    photosManquantes > 0 && { titre: 'Photos du site', detail: `${photosManquantes} emplacement${photosManquantes > 1 ? 's' : ''} hachuré${photosManquantes > 1 ? 's' : ''} en attente d’une photo.`, sev: 'o', href: '/admin/tableau-de-bord/medias/' },
    nbFichesEnfants === 0 && { titre: 'Fiches enfants à parrainer', detail: 'Aucune fiche publiée — autorisations parentales signées.', sev: 'o', href: `${CMS}/collections/enfants/new` },
    !config.formulaires.declarationDonUrl && { titre: 'Formulaires externes', detail: 'Déclaration de don, parrainage, contact, newsletter.', sev: 'o', href: versConfigSection('Formulaires externes (URLs)') },
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
    { nom: 'HelloAsso (carte bancaire)', c: '#46BE8A', ok: !!(p.helloasso ?? {}).lien },
    { nom: 'Virement Mali', c: '#D9A62B', ok: !!p.virementMali.rib },
    { nom: 'Virement France', c: '#0F4A2F', ok: !!p.virementFrance.iban },
  ];
}
