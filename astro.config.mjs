import { defineConfig } from 'astro/config';

// Publié sur GitHub Pages, dans le dossier du dépôt. Français à la racine, anglais dans /en/.
export default defineConfig({
  site: 'https://legenienumerique.github.io',
  base: '/Mecking-Exclusive-Travel',
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: { prefixDefaultLocale: false },
  },
});
