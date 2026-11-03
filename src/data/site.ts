/**
 * Contenus du site. Les photos sont des images d'illustration Unsplash,
 * à remplacer par celles du client. Ne rien inventer sur le client :
 * ce qui reste à confirmer est signalé par « À valider ».
 */

export type Season = 'hiver' | 'ete';

export interface Photo {
  id: string;
  alt: string;
}

/** Adresse d'une photo Unsplash, recadrée à la largeur voulue. */
export function photo(id: string, width: number, height?: number): string {
  const h = height ? `&h=${height}` : '';
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${width}${h}`;
}

export function srcset(id: string, ratio?: number): string {
  return [800, 1400, 2200]
    .map((w) => `${photo(id, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`)
    .join(', ');
}

export const brand = {
  name: 'Mecking Exclusive Travel',
  city: 'Lyon',
};

export const hero: Record<Season, Photo> = {
  hiver: { id: '1506905925346-21bda4d32df4', alt: 'Sommets alpins émergeant d’une mer de nuages au lever du soleil' },
  ete: { id: '1510414842594-a61c69b5ae57', alt: 'Crique aux eaux turquoise bordée de falaises' },
};

/** La méthode de travail. À valider avec le client. */
export const steps = [
  {
    title: 'Écouter',
    text: 'Vous nous dites ce que vous cherchez : un lieu, une date, une envie. Nous posons les bonnes questions avant de chercher.',
    photo: { id: '1520984032042-162d526883e0', alt: 'Chalet en bois sous la neige' },
  },
  {
    title: 'Rechercher',
    text: 'Nous sélectionnons des propositions adaptées à votre demande, à votre rythme et à votre façon de voyager.',
    photo: { id: '1548777123-e216912df7d8', alt: 'Forêt de sapins enneigés vue du ciel' },
  },
  {
    title: 'Organiser',
    text: 'Une fois votre choix fait, nous coordonnons chaque détail de la prestation retenue, jusqu’au jour J.',
    photo: { id: '1519681393784-d120267933ba', alt: 'Ciel étoilé au-dessus de sommets enneigés' },
  },
];

/** Les quatre prestations, toujours présentées séparément. */
export const services: {
  slug: string;
  title: string;
  text: string;
  cta: string;
  photo: Record<Season, Photo>;
}[] = [
  {
    slug: 'hebergements',
    title: 'Hébergements d’exception',
    text: 'Chalet au pied des pistes ou villa face à la mer : nous recherchons le lieu qui correspond à vos attentes, puis nous vous mettons en relation.',
    cta: 'Demander un hébergement',
    photo: {
      hiver: { id: '1520984032042-162d526883e0', alt: 'Chalet en bois sous la neige' },
      ete: { id: '1613490493576-7fde63acd811', alt: 'Villa contemporaine et sa piscine' },
    },
  },
  {
    slug: 'transferts',
    title: 'Transferts et chauffeurs privés',
    text: 'De la gare, de l’aéroport ou d’une adresse à l’autre, un trajet privé, à l’heure qui vous convient.',
    cta: 'Demander un transfert',
    photo: {
      hiver: { id: '1485291571150-772bcfc10da5', alt: 'Berline noire dans la pénombre' },
      ete: { id: '1485291571150-772bcfc10da5', alt: 'Berline noire dans la pénombre' },
    },
  },
  {
    slug: 'activites',
    title: 'Activités sur mesure',
    text: 'Une journée de ski, une sortie en mer, une découverte du terroir : nous trouvons l’activité qui vous ressemble, sur place.',
    cta: 'Demander une activité',
    photo: {
      hiver: { id: '1605540436563-5bca919ae766', alt: 'Skieurs sur un vaste domaine enneigé' },
      ete: { id: '1502784444187-359ac186c5bb', alt: 'Deux planches de paddle sur une eau turquoise' },
    },
  },
  {
    slug: 'gastronomie',
    title: 'Gastronomie et expériences privées',
    text: 'Une table recherchée, un chef à domicile, un moment privé : nous vous ouvrons l’accès, selon votre demande.',
    cta: 'Demander une expérience',
    photo: {
      hiver: { id: '1414235077428-338989a2e8c0', alt: 'Table dressée dans un restaurant gastronomique' },
      ete: { id: '1559339352-11d035aa65de', alt: 'Terrasse de restaurant au bord de l’eau' },
    },
  },
];

/** Destinations du cahier des charges. Les destinations de montagne précises restent à fournir. */
export const destinations: { name: string; season: Season; photo: Photo }[] = [
  { name: 'Alpes', season: 'hiver', photo: { id: '1454496522488-7a8e488e8606', alt: 'Sommet enneigé dominant une vallée' } },
  { name: 'Côte d’Azur', season: 'ete', photo: { id: '1507525428034-b723cf961d3e', alt: 'Plage au lever du soleil' } },
  { name: 'Bretagne', season: 'ete', photo: { id: '1495954484750-af469f2f9be5', alt: 'Escalier en bois menant à une plage' } },
  { name: 'Corse', season: 'ete', photo: { id: '1502784444187-359ac186c5bb', alt: 'Deux planches de paddle sur une eau turquoise' } },
  { name: 'Provence', season: 'ete', photo: { id: '1499002238440-d264edd596ec', alt: 'Champ de lavande au coucher du soleil' } },
];

/** Navigation, avec la photo montrée au survol dans le menu. */
export const nav: { href: string; label: string; photo: Photo }[] = [
  { href: '/prestations', label: 'Prestations', photo: { id: '1414235077428-338989a2e8c0', alt: '' } },
  { href: '/destinations', label: 'Destinations', photo: { id: '1506905925346-21bda4d32df4', alt: '' } },
  { href: '/a-propos', label: 'À propos', photo: { id: '1519681393784-d120267933ba', alt: '' } },
  { href: '/journal', label: 'Journal', photo: { id: '1559339352-11d035aa65de', alt: '' } },
  { href: '/contact', label: 'Contact', photo: { id: '1520984032042-162d526883e0', alt: '' } },
];

/** Photos d'ambiance qui complètent le mur des destinations. */
export const ambiance: Photo[] = [
  { id: '1519681393784-d120267933ba', alt: 'Ciel étoilé au-dessus de sommets enneigés' },
  { id: '1559339352-11d035aa65de', alt: 'Terrasse de restaurant au bord de l’eau' },
  { id: '1548777123-e216912df7d8', alt: 'Forêt de sapins enneigés vue du ciel' },
  { id: '1613490493576-7fde63acd811', alt: 'Villa contemporaine et sa piscine' },
];

/** Ce que couvre chaque prestation. Descriptions à valider avec le client. */
export const serviceDetails: Record<string, string[]> = {
  hebergements: [
    'Chalets, appartements et villas haut de gamme',
    'Recherche selon vos dates, votre groupe et vos envies',
    'Mise en relation avec le propriétaire ou le gestionnaire',
  ],
  transferts: [
    'Gares, aéroports et adresses privées',
    'Véhicule et chauffeur adaptés au trajet et aux bagages',
    'Horaires fixés selon votre programme',
  ],
  activites: [
    'Ski, sorties en mer, randonnées, découvertes locales',
    'Activité choisie selon le lieu, la saison et vos envies',
    'Coordination avec les prestataires sur place',
  ],
  gastronomie: [
    'Réservation de tables recherchées',
    'Chef à domicile ou dîner privé',
    'Moments sur mesure, selon votre demande',
  ],
};

/** Quelques mots par destination. Destinations de montagne précises à fournir. */
export const destinationText: Record<string, string> = {
  Alpes: 'Grands domaines skiables, villages d’altitude et chalets au pied des pistes. L’hiver, la montagne se vit entre glisse, repos et tables de caractère.',
  'Côte d’Azur': 'Criques, villas sur les hauteurs et terrasses face à la Méditerranée, pour un été en pleine lumière.',
  Bretagne: 'Côtes découpées, grandes plages et lumière changeante, pour un été au grand air.',
  Corse: 'Eaux turquoise, golfes sauvages et villages perchés, entre mer et montagne.',
  Provence: 'Lavande, mas en pierre et marchés de village, au rythme lent des journées d’été.',
};

/** Notre approche, tirée des attentes de la clientèle décrites dans le cahier des charges. */
export const values = [
  { title: 'Discrétion', text: 'Vos demandes et vos séjours restent entre nous.' },
  { title: 'Sur mesure', text: 'Chaque proposition part de vos envies, jamais d’un catalogue.' },
  { title: 'Un seul interlocuteur', text: 'Une personne qui vous connaît, du premier échange au jour J.' },
  { title: 'Fiabilité', text: 'Des prestataires choisis avec soin, et un suivi attentif.' },
];

/** Sujets proposés pour le journal. Aucun article n'est encore rédigé. */
export const journalTopics = [
  { theme: 'Hiver', title: 'Choisir sa station selon son style de séjour', photo: { id: '1605540436563-5bca919ae766', alt: 'Skieurs sur un vaste domaine enneigé' } },
  { theme: 'Été', title: 'Quatre littoraux français, quatre façons de vivre l’été', photo: { id: '1507525428034-b723cf961d3e', alt: 'Plage au lever du soleil' } },
  { theme: 'Conseils', title: 'Préparer un transfert sans attente à l’arrivée', photo: { id: '1485291571150-772bcfc10da5', alt: 'Berline noire dans la pénombre' } },
];
