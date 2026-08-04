# Checklist avant mise en ligne

Tout ce qui doit être **obtenu, vérifié ou décidé** avant de publier le site.
Cocher chaque case ; le README explique où renseigner chaque donnée.

## 1. Données à obtenir auprès du bureau

- [ ] Nombre d'enfants scolarisés (`chiffres.enfants`)
- [ ] Nombre d'enseignants et encadrants (`chiffres.enseignants`)
- [ ] Coût annuel par enfant (`chiffres.coutAnnuelParEnfantFCFA`) — permet d'afficher la grille d'impact des dons
- [ ] Montant mensuel du parrainage (`parrainage.montantMensuelFCFA` / `montantMensuelEUR`)
- [ ] Budget du projet de médersa arrêté par le bureau (`medersa.budgetTotalFCFA`)
- [ ] Montant déjà collecté (`medersa.montantCollecteFCFA`) et pourcentage (`medersa.pourcentageAvancement`)
- [ ] Horaires de visite du centre (`contact.horairesVisite`)

## 2. Coordonnées de paiement (à vérifier deux fois — argent en jeu)

- [ ] Numéro **Orange Money** officiel de l'association + nom du titulaire (`paiement.orangeMoney`)
- [ ] Numéro **Wave** officiel + lien de paiement éventuel (`paiement.wave`)
- [ ] RIB du compte bancaire **Mali** + nom de la banque (`paiement.virementMali`)
- [ ] IBAN + BIC du compte **France** (`paiement.virementFrance`)
- [ ] Numéro de téléphone **Wero** relié au compte bancaire de l'association + nom du titulaire (`paiement.wero`) — vérifier que Wero est activé sur ce compte dans l'application de la banque
- [ ] Lien **PayPal** (paypal.me) ou adresse e-mail PayPal de l'association (`paiement.paypal.lien`) — à renseigner par l'admin ; d'ici là le canal affiche « à communiquer »
- [ ] Vérifier que le **nom affiché à la validation** d'un envoi Orange Money / Wave est bien celui de l'association (un donateur doit pouvoir le reconnaître)
- [ ] Confirmer que le numéro WhatsApp configuré (`whatsapp.numero`, actuellement le +223 76 33 79 15) est bien **relié à un compte WhatsApp actif et consulté** — c'est lui qui reçoit les déclarations de don et les demandes de parrainage

## 3. Formulaires et canaux

- [ ] Créer le formulaire de **déclaration de don** (Tally ou Google Forms : nom, numéro émetteur, montant, canal, date, e-mail) et renseigner `formulaires.declarationDonUrl`
- [ ] Créer (ou non) le formulaire de **parrainage** → `formulaires.parrainageUrl`
- [ ] Créer (ou non) le formulaire de **contact** → `formulaires.contactUrl` (sinon : l'envoi passe par le client e-mail du visiteur)
- [ ] Choisir l'outil de **lettre d'information** → `formulaires.newsletterUrl` (sinon : inscription par e-mail)
- [ ] Renseigner les liens **réseaux sociaux** réellement actifs (`reseaux.*`)
- [ ] Désigner qui consulte la boîte `centrerahma.coran@gmail.com` et à quelle fréquence

## 4. Protection des enfants (bloquant)

- [ ] Faire signer les **autorisations parentales** (image + prénom) avant toute photo ou fiche nominative
- [ ] Tant que les autorisations manquent : ne publier **aucune photo identifiable, aucun prénom réel** (le site est livré ainsi)
- [ ] Remplacer les emplacements hachurés par de vraies photos **uniquement** pour les enfants autorisés
- [ ] Compléter les fiches `content/enfants/` (prénom, âge, niveau, année d'entrée) selon les autorisations

## 5. Mentions légales et conformité

- [ ] Désigner le **directeur de la publication** (à remplacer dans `src/layouts/Base.astro` et `src/pages/mentions-legales.astro`)
- [ ] Confirmer l'**hébergeur** définitif et compléter la mention (Cloudflare Pages prévu)
- [ ] Définir le **secret `ADMIN_PASSWORD`** dans Cloudflare (Workers & Pages → site-internet-amaafe → Settings → Variables and Secrets) — sans lui, la zone `/admin/` reste fermée à tous, y compris l'équipe ; choisir un mot de passe long et le partager uniquement avec le bureau
- [x] ~~Ne jamais annoncer d'avantage fiscal tant que l'éligibilité n'est pas confirmée~~ — **rescrit fiscal obtenu** par AMAAFE / France : l'avantage fiscal est annoncé sur `/conditions-de-don/`, `/faire-un-don/` et l'accueil. Conserver le rescrit dans les archives de l'association (et le publier sur `/transparence/` si souhaité)
- [ ] Relire la politique de confidentialité si un service externe (formulaire, newsletter) est ajouté — le nommer dans la page
- [ ] Vérifier les statuts et références légales affichées sur `/transparence/` avec les documents officiels

## 6. Contenus

- [ ] Relire et valider les **3 actualités d'exemple** (`content/actualites/`) : confirmer les faits, ajouter les dates réelles, ou les dépublier (`publie: false`)
- [ ] Faire relire tous les textes par le bureau (notamment : école **externe**, sans internat ni repas — ne jamais écrire le contraire)
- [ ] Téléverser les documents de transparence disponibles (statuts en PDF) et créer les liens sur `/transparence/`

## 7. Technique

- [ ] Créer le dépôt GitHub et pousser le code
- [ ] Connecter le dépôt à **Cloudflare Pages** (build : `npm run build`, sortie : `dist`)
- [ ] Acheter/relier le **domaine définitif** et remplacer `site` dans `astro.config.mjs`
- [ ] Renseigner `repo:` dans `public/admin/config.yml` et déployer le proxy OAuth pour activer Decap CMS (voir README)
- [ ] Tester le parcours de don complet sur un téléphone : choisir un montant → copier le numéro → envoyer un petit don réel de test → le déclarer par WhatsApp → vérifier qu'il est retrouvable sur le relevé de l'opérateur
- [ ] Tester le site sur une connexion lente (mode « Slow 3G » des outils développeur) et sur un petit écran
- [ ] Vérifier `https://…/sitemap.xml` et `https://…/robots.txt` après mise en ligne

## 8. Après la mise en ligne

- [ ] Déclarer le sitemap dans Google Search Console
- [ ] Mettre en place la publication régulière des comptes (engagement affiché sur le site)
- [ ] Prévoir qui met à jour la barre d'avancement de la collecte, et à quel rythme
