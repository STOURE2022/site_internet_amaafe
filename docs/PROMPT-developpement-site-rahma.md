# PROMPT DE DÉVELOPPEMENT — SITE DU CENTRE CORANIQUE RAHMA

> **Mode d'emploi :** copiez tout le contenu ci-dessous dans Claude, et **joignez le fichier `maquette-centre-rahma.html`** à votre message. La maquette fait foi pour le design ; ce prompt fait foi pour tout le reste.

---

## RÔLE

Tu es développeur front-end senior, spécialiste des sites statiques performants pour des contextes à faible bande passante. Tu travailles pour LINOVATECH sur le site d'une association humanitaire au Mali. Tu écris du code simple, lisible et maintenable par un développeur seul — pas d'abstraction inutile, pas de dépendance superflue.

---

## CONTEXTE DU PROJET

### L'organisation

Le site est celui du **Centre Coranique Rahma**, à Yirimadio (Bamako, Mali), créé en 2023. Devise : « Solidarité – Discipline – Travail ».

C'est une **école coranique externe et gratuite** — il n'y a **ni internat, ni dortoir, ni repas servis**. Ne jamais écrire le contraire. Le centre offre gratuitement la scolarité, les fournitures et les uniformes.

Le centre est porté par l'**AMAAFE** (Association Malienne d'Aide et d'Accompagnement de la Femme et de l'Enfant), qui existe sous deux entités déclarées :

| | AMAAFE / Mali | AMAAFE / France |
|---|---|---|
| Création | 30 septembre 2010 | 25 avril 2012 |
| Référence | Récépissé n° 1811/MATCL-DNI | N° RNA W953004202 |
| Siège | Yirimadio, Bamako | Osny (95520), France |
| Régime | Association malienne | Association loi 1901 |

Contacts publics : `centrerahma.coran@gmail.com` — +223 76 33 79 15 (Mali) — +33 6 66 31 53 40 (France).

### Le parcours de l'enfant

Enseignement coranique → éducation morale et citoyenne → suivi jusqu'à 16 ans → orientation vers une formation professionnelle. L'objectif affiché est de rompre le cycle de la pauvreté par l'éducation puis par le métier.

### La situation actuelle

Les cours se tiennent dans un **hangar en tôle**, sur une parcelle prêtée par la mosquée du quartier. Chaleur en saison sèche, risques en saison des pluies, bruit, manque d'espace et de mobilier.

### Le projet prioritaire

Acquérir un **terrain** et y construire une **médersa** comprenant : salles de classe, salle de mémorisation, bibliothèque, bureaux administratifs, sanitaires, cour de récréation, espaces pour la future formation professionnelle.

---

## RÈGLE ABSOLUE SUR LES CONTENUS

**N'invente aucun chiffre, aucun nom, aucune date, aucun montant.**

Les données suivantes ne sont pas encore connues : nombre d'enfants, nombre d'enseignants, coût annuel par enfant, montant du parrainage, budget de la médersa, montant déjà collecté, horaires de visite, noms des dirigeants, dates des actualités, numéros Orange Money et Wave, IBAN.

Partout où une donnée manque, utilise le composant `.tbd` de la maquette (jeton rouge en pointillés, ex. `<span class="tbd">à confirmer</span>`) et centralise la valeur dans un fichier de contenu unique, pour qu'elle soit remplaçable en un seul endroit le jour où elle arrive.

Ne promets **aucun avantage fiscal** (pas de « 66 % déductible », pas de « reçu fiscal ») : l'éligibilité n'est pas confirmée.

Ne publie **aucune photo d'enfant identifiable ni aucun prénom réel** dans le code livré : les autorisations parentales ne sont pas encore recueillies. Prévois les emplacements, laisse les placeholders.

---

## STACK ET ARCHITECTURE

- **Site statique**, sans framework lourd. HTML + CSS + JavaScript vanilla, ou **Astro** si tu juges qu'un système de composants et de collections de contenu facilite la maintenance. Pas de React, pas de Next, pas de Tailwind.
- **Hébergement : Cloudflare Pages** (gratuit, domaine personnalisé, et Functions disponibles pour la suite). Prépare le déploiement : `wrangler.toml` ou configuration de build documentée.
- **Contenu éditable** : toutes les données variables (chiffres, textes clés, coordonnées de paiement, projets, actualités, fiches de parrainage) vivent dans des fichiers **Markdown ou JSON** sous `/content/`, jamais en dur dans le HTML. Prépare la configuration **Decap CMS** (`/admin/config.yml`) pour que le trésorier puisse éditer sans toucher au code.
- **Aucune base de données, aucun back-end** en v1.
- Pas de dépendance à un CDN externe en production : télécharge et sers les polices en local (WOFF2, `font-display: swap`).

### Le parcours de don, en v1

Le site **n'encaisse pas** l'argent. Il affiche les canaux, guide le donateur, puis recueille une déclaration.

1. Le donateur choisit un montant, une devise (FCFA / EUR / USD) et un canal.
2. Le site affiche les instructions du canal : numéro Orange Money ou Wave avec **bouton « Copier »**, ou coordonnées bancaires avec motif imposé `DON RAHMA - NOM`.
3. Écran de déclaration « J'ai envoyé mon don », avec deux chemins équivalents :
   - un formulaire (nom, **numéro émetteur**, montant, canal, date, e-mail) envoyé vers un service externe type Tally ou Google Forms — l'URL est une variable de configuration ;
   - un **bouton WhatsApp pré-rempli** (`https://wa.me/<numéro>?text=<message encodé>`) reprenant les mêmes informations. C'est le chemin majoritaire au Mali : traite-le comme principal, pas comme secondaire.

Le champ **numéro émetteur** est le plus important : c'est la clé de rapprochement avec le relevé de l'opérateur, puisque le mobile money ne transporte pas de référence exploitable.

---

## CE QU'IL FAUT CONSTRUIRE

Reproduis fidèlement la maquette jointe, structurée en pages :

| Page | Contenu |
|---|---|
| `/` Accueil | Hero, chiffres clés, Qui sommes-nous, Notre vision (parcours en 4 étapes), Nos défis, Le projet de médersa, Parrainage (aperçu), Bloc don, Actualités récentes, Newsletter |
| `/le-centre` | Histoire, mission, les 4 engagements, galerie photos |
| `/notre-projet` | La médersa en détail, les espaces prévus, avancement, appel au don |
| `/parrainage` | Fonctionnement, fiches enfants, formulaire de mise en relation |
| `/faire-un-don` | Parcours de don complet en 4 étapes |
| `/l-amaafe` | L'association, ses 10 domaines d'action, les deux entités |
| `/transparence` | Références légales des deux entités, documents téléchargeables |
| `/actualites` + `/actualites/<slug>` | Liste et article |
| `/contact` | Coordonnées, formulaire, bouton WhatsApp |
| `/mentions-legales`, `/confidentialite`, `/conditions-de-don` | Pages légales |

Les dix domaines d'action de l'AMAAFE à reprendre tels quels : santé des populations ; mariage précoce et forcé ; droits de l'enfant ; scolarisation des filles ; éducation islamique ; sorties éducatives et récréatives ; centres de jeux ; assainissement et cadre de vie ; épanouissement des femmes ; entrepreneuriat féminin.

---

## SYSTÈME DE DESIGN

Reprends exactement les variables CSS de la maquette :

```
--nuit:#0A1B12    --vert:#0F4A2F    --vert-2:#176B44   --vert-pale:#E5EFE8
--or:#D9A62B      --or-pale:#F8F0D9 --rouge:#B3271E    --rouge-pale:#FBE7E4
--banco:#C9A97F   --papier:#F4F1E8  --papier-2:#FCFAF5 --encre:#13201A
--gris:#5C6C62    --gris-2:#8A978E  --ligne:#E1D9C8
```

Typographie : **Fraunces** (titres), **Karla** (texte), **IBM Plex Mono** (chiffres, sur-titres, données), **Amiri** (arabe). Rayon par défaut 8 px. Conteneur 1220 px. Padding latéral `clamp(20px, 5vw, 72px)`.

Conserve les composants existants : `.btn` et ses variantes, `.card`, `.photo` (placeholders hachurés), `.eyebrow`, `.tbd`, `.tablet` (bloc hero), `.eng`, `.path`, `.dock` (barre de don mobile), `.rv` (révélation au défilement).

---

## CONTRAINTES TECHNIQUES

- **Mobile d'abord.** L'essentiel du trafic viendra du téléphone, sur réseau lent.
- **Budget de performance : moins de 300 Ko par page**, images comprises. Images en WebP avec `<img>` `loading="lazy"`, `width`/`height` explicites, `srcset` pour les grandes images.
- **Accessibilité** : contraste AA minimum, navigation clavier complète, `aria-pressed` sur les sélecteurs de la page don, libellés sur tous les champs, `prefers-reduced-motion` respecté, structure de titres cohérente.
- **SEO** : titres et méta-descriptions par page, Open Graph, `sitemap.xml`, `robots.txt`, données structurées JSON-LD `NGO`.
- **RGPD** : l'entité française est concernée. Formulaires avec mention de finalité, pas de traceur tiers, pas de Google Analytics — utilise une alternative sans cookie ou rien du tout en v1.
- **Français** en v1. Prévois la structure pour ajouter l'anglais et l'arabe (`hreflang`, dossier de contenu par langue) sans réécrire le site.

---

## LIVRABLES ATTENDUS

1. Le site complet, arborescence de fichiers claire.
2. `/content/` avec tous les contenus éditables, y compris un `config.json` regroupant coordonnées, numéros de paiement et chiffres clés.
3. `/admin/config.yml` pour Decap CMS.
4. `README.md` : comment lancer en local, comment déployer sur Cloudflare Pages, **comment remplacer chaque donnée `à confirmer`**, et comment ajouter une actualité.
5. Un fichier `CHECKLIST-AVANT-MISE-EN-LIGNE.md` listant tout ce qui doit être obtenu ou vérifié avant publication (autorisations photo, numéros de paiement, directeur de publication, hébergeur, chiffres).

---

## MÉTHODE DE TRAVAIL

Procède par étapes et fais-moi valider entre chacune :

1. Arborescence des fichiers et modèle de contenu (`config.json`, schémas).
2. Layout global : en-tête, navigation, pied de page, styles de base.
3. Page d'accueil complète.
4. Pages secondaires.
5. Parcours de don et formulaires.
6. Pages légales, SEO, README et checklist.

Si une information te manque, **demande-la ou pose un `.tbd`** — ne comble jamais un vide par une invention. Signale-moi tout endroit où la maquette et ce prompt se contredisent.
