import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Les contenus éditables vivent dans /content/ (à la racine du projet),
// pour être modifiables via Decap CMS sans toucher au code.

/* Nombre tolérant : l'éditeur peut enregistrer un nombre sous forme de
   texte (« "7" ») ou vider le champ (« "" ») — on normalise en nombre ou
   null au lieu de faire échouer la publication du site. */
const nombreSouple = z.preprocess((v) => {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}, z.number().nullable());

const actualites = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/actualites' }),
  schema: z.object({
    titre: z.string(),
    categorie: z.string(),
    extrait: z.string(),
    // Date au format AAAA-MM-JJ. Laisser vide tant que la date réelle
    // n'est pas connue : le site affichera « date à préciser ».
    date: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    publie: z.boolean().default(true),
  }),
});

const enfants = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/enfants' }),
  schema: z.object({
    // Ne renseigner prénom et photo qu'avec l'autorisation écrite des parents.
    prenom: z.string().nullable().optional(),
    age: nombreSouple.optional(),
    niveau: z.string().nullable().optional(),
    anneeEntree: nombreSouple.optional(),
    photo: z.string().nullable().optional(),
    publie: z.boolean().default(true),
  }),
});

const temoignages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/temoignages' }),
  schema: z.object({
    nom: z.string(),
    role: z.string(),
    // Page d'affichage : « parrainage » ou « amaafe ».
    contexte: z.enum(['parrainage', 'amaafe']),
    ordre: z.preprocess((v) => {
      const n = Number(v);
      return v == null || v === '' || Number.isNaN(n) ? 99 : n;
    }, z.number()),
    publie: z.boolean().default(true),
  }),
});

export const collections = { actualites, enfants, temoignages };
