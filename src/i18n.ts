/**
 * Deux langues : français (racine du site) et anglais (/en/).
 * Chaque texte bilingue est un objet { fr, en } ; la langue de la page
 * vient d'Astro.currentLocale (réglage i18n d'astro.config.mjs).
 */

export type Lang = 'fr' | 'en';
export type L = Record<Lang, string>;

export const langs: Lang[] = ['fr', 'en'];
export const other = (lang: Lang): Lang => (lang === 'fr' ? 'en' : 'fr');

/** Lien interne, avec le dossier du site (GitHub Pages). */
export function link(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}

/** Adresse de chaque page dans les deux langues. */
export const routes = {
  home: { fr: '/', en: '/en/' },
  services: { fr: '/prestations', en: '/en/services' },
  destinations: { fr: '/destinations', en: '/en/destinations' },
  about: { fr: '/a-propos', en: '/en/about' },
  journal: { fr: '/journal', en: '/en/journal' },
  contact: { fr: '/contact', en: '/en/contact' },
  legal: { fr: '/mentions-legales', en: '/en/legal-notice' },
  privacy: { fr: '/confidentialite', en: '/en/privacy' },
} as const;
export type Route = keyof typeof routes;

export const href = (route: Route, lang: Lang, query = '') => link(routes[route][lang]) + query;

/** Textes de l'interface commune (en-tête, menu, pied de page). */
export const ui = {
  skip: { fr: 'Aller au contenu', en: 'Skip to content' },
  season: { fr: 'Saison', en: 'Season' },
  hiver: { fr: 'Hiver', en: 'Winter' },
  ete: { fr: 'Été', en: 'Summer' },
  night: { fr: 'Mode nuit', en: 'Night mode' },
  day: { fr: 'Mode jour', en: 'Day mode' },
  menu: { fr: 'Menu', en: 'Menu' },
  close: { fr: 'Fermer', en: 'Close' },
  mainNav: { fr: 'Navigation principale', en: 'Main navigation' },
  footNav: { fr: 'Pied de page', en: 'Footer' },
  home: { fr: 'accueil', en: 'home' },
  based: { fr: 'Conciergerie privée basée à Lyon', en: 'Private concierge based in Lyon' },
  photos: { fr: 'Photographies d’illustration :', en: 'Illustrative photography:' },
  created: { fr: 'Créé par', en: 'Created by' },
  legal: { fr: 'Mentions légales', en: 'Legal notice' },
  privacy: { fr: 'Confidentialité', en: 'Privacy' },
  langName: { fr: 'Français', en: 'English' },
  switchTo: { fr: 'Voir le site en français', en: 'View the site in English' },
  todo: { fr: 'à fournir par le client', en: 'to be provided by the client' },
} satisfies Record<string, L>;
