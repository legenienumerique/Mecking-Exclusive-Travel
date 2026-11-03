/**
 * Contenus du site, en français et en anglais. Les photos sont des images
 * d'illustration Unsplash, à remplacer par celles du client. Ne rien inventer
 * sur le client : ce qui reste à confirmer est signalé dans la page (.todo).
 */
import type { L, Route } from '../i18n';

export { link } from '../i18n';

export type Season = 'hiver' | 'ete';

export interface Photo {
  id: string;
  alt: L;
}

/** Adresse d'une photo Unsplash, recadrée à la largeur voulue. */
export function photo(id: string, width: number, height?: number): string {
  const h = height ? `&h=${height}` : '';
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${width}${h}`;
}

export function srcset(id: string, ratio?: number): string {
  return [800, 1400, 2200]
    .map((w) => `${photo(id, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`)
    .join(', ');
}

export const brand = {
  name: 'Mecking Exclusive Travel',
  city: 'Lyon',
};

/** Banque de photos, avec leur description dans les deux langues. */
const P = {
  clouds: { id: '1506905925346-21bda4d32df4', alt: { fr: 'Sommets alpins émergeant d’une mer de nuages au lever du soleil', en: 'Alpine peaks rising above a sea of clouds at sunrise' } },
  cove: { id: '1510414842594-a61c69b5ae57', alt: { fr: 'Crique aux eaux turquoise bordée de falaises', en: 'Turquoise cove lined with cliffs' } },
  chalet: { id: '1520984032042-162d526883e0', alt: { fr: 'Chalet en bois sous la neige', en: 'Wooden chalet in the snow' } },
  forest: { id: '1548777123-e216912df7d8', alt: { fr: 'Forêt de sapins enneigés vue du ciel', en: 'Snowy fir forest seen from above' } },
  stars: { id: '1519681393784-d120267933ba', alt: { fr: 'Ciel étoilé au-dessus de sommets enneigés', en: 'Starry sky over snowy peaks' } },
  villa: { id: '1613490493576-7fde63acd811', alt: { fr: 'Villa contemporaine et sa piscine', en: 'Contemporary villa with a pool' } },
  car: { id: '1485291571150-772bcfc10da5', alt: { fr: 'Berline noire dans la pénombre', en: 'Black sedan in the shadows' } },
  skiers: { id: '1605540436563-5bca919ae766', alt: { fr: 'Skieurs sur un vaste domaine enneigé', en: 'Skiers on a vast snowy slope' } },
  paddle: { id: '1502784444187-359ac186c5bb', alt: { fr: 'Deux planches de paddle sur une eau turquoise', en: 'Two paddleboards on turquoise water' } },
  table: { id: '1414235077428-338989a2e8c0', alt: { fr: 'Table dressée dans un restaurant gastronomique', en: 'Table set in a fine-dining restaurant' } },
  terrace: { id: '1559339352-11d035aa65de', alt: { fr: 'Terrasse de restaurant au bord de l’eau', en: 'Waterside restaurant terrace' } },
  peak: { id: '1454496522488-7a8e488e8606', alt: { fr: 'Sommet enneigé dominant une vallée', en: 'Snowy summit above a valley' } },
  beach: { id: '1507525428034-b723cf961d3e', alt: { fr: 'Plage au lever du soleil', en: 'Beach at sunrise' } },
  stairs: { id: '1495954484750-af469f2f9be5', alt: { fr: 'Escalier en bois menant à une plage', en: 'Wooden stairs leading to a beach' } },
  lavender: { id: '1499002238440-d264edd596ec', alt: { fr: 'Champ de lavande au coucher du soleil', en: 'Lavender field at sunset' } },
} satisfies Record<string, Photo>;

export const hero: Record<Season, Photo> = { hiver: P.clouds, ete: P.cove };

/** Photos d'ambiance qui complètent le mur des destinations. */
export const ambiance: Photo[] = [P.stars, P.terrace, P.forest, P.villa];

/** La méthode de travail. À valider avec le client. */
export const steps: { title: L; text: L; photo: Photo }[] = [
  {
    title: { fr: 'Écouter', en: 'Listen' },
    text: {
      fr: 'Vous nous dites ce que vous cherchez : un lieu, une date, une envie. Nous posons les bonnes questions avant de chercher.',
      en: 'You tell us what you are looking for: a place, a date, a wish. We ask the right questions before we start searching.',
    },
    photo: P.chalet,
  },
  {
    title: { fr: 'Rechercher', en: 'Search' },
    text: {
      fr: 'Nous sélectionnons des propositions adaptées à votre demande, à votre rythme et à votre façon de voyager.',
      en: 'We select options suited to your request, your pace and the way you like to travel.',
    },
    photo: P.forest,
  },
  {
    title: { fr: 'Organiser', en: 'Arrange' },
    text: {
      fr: 'Une fois votre choix fait, nous coordonnons chaque détail de la prestation retenue, jusqu’au jour J.',
      en: 'Once you have chosen, we coordinate every detail of that service, right up to the day itself.',
    },
    photo: P.stars,
  },
];

/** Les quatre prestations, toujours présentées séparément. */
export const services: { slug: string; title: L; text: L; cta: L; details: L[]; photo: Record<Season, Photo> }[] = [
  {
    slug: 'hebergements',
    title: { fr: 'Hébergements d’exception', en: 'Exceptional homes' },
    text: {
      fr: 'Chalet au pied des pistes ou villa face à la mer : nous recherchons le lieu qui correspond à vos attentes, puis nous vous mettons en relation.',
      en: 'A ski-in chalet or a seafront villa: we look for the place that matches your expectations, then put you in touch.',
    },
    cta: { fr: 'Demander un hébergement', en: 'Request a home' },
    details: [
      { fr: 'Chalets, appartements et villas haut de gamme', en: 'High-end chalets, apartments and villas' },
      { fr: 'Recherche selon vos dates, votre groupe et vos envies', en: 'Search based on your dates, your group and your wishes' },
      { fr: 'Mise en relation avec le propriétaire ou le gestionnaire', en: 'Introduction to the owner or manager' },
    ],
    photo: { hiver: P.chalet, ete: P.villa },
  },
  {
    slug: 'transferts',
    title: { fr: 'Transferts et chauffeurs privés', en: 'Private transfers and drivers' },
    text: {
      fr: 'De la gare, de l’aéroport ou d’une adresse à l’autre, un trajet privé, à l’heure qui vous convient.',
      en: 'From the station, the airport or one address to another: a private ride, at the time that suits you.',
    },
    cta: { fr: 'Demander un transfert', en: 'Request a transfer' },
    details: [
      { fr: 'Gares, aéroports et adresses privées', en: 'Stations, airports and private addresses' },
      { fr: 'Véhicule et chauffeur adaptés au trajet et aux bagages', en: 'Vehicle and driver suited to the journey and luggage' },
      { fr: 'Horaires fixés selon votre programme', en: 'Times set around your schedule' },
    ],
    photo: { hiver: P.car, ete: P.car },
  },
  {
    slug: 'activites',
    title: { fr: 'Activités sur mesure', en: 'Tailored activities' },
    text: {
      fr: 'Une journée de ski, une sortie en mer, une découverte du terroir : nous trouvons l’activité qui vous ressemble, sur place.',
      en: 'A day on the slopes, a trip out to sea, a taste of local life: we find the activity that suits you, on the spot.',
    },
    cta: { fr: 'Demander une activité', en: 'Request an activity' },
    details: [
      { fr: 'Ski, sorties en mer, randonnées, découvertes locales', en: 'Skiing, boat trips, hikes, local discoveries' },
      { fr: 'Activité choisie selon le lieu, la saison et vos envies', en: 'Chosen for the place, the season and your wishes' },
      { fr: 'Coordination avec les prestataires sur place', en: 'Coordination with local providers' },
    ],
    photo: { hiver: P.skiers, ete: P.paddle },
  },
  {
    slug: 'gastronomie',
    title: { fr: 'Gastronomie et expériences privées', en: 'Dining and private experiences' },
    text: {
      fr: 'Une table recherchée, un chef à domicile, un moment privé : nous vous ouvrons l’accès, selon votre demande.',
      en: 'A sought-after table, a private chef, a private moment: we open the door for you, on request.',
    },
    cta: { fr: 'Demander une expérience', en: 'Request an experience' },
    details: [
      { fr: 'Réservation de tables recherchées', en: 'Bookings at sought-after restaurants' },
      { fr: 'Chef à domicile ou dîner privé', en: 'Private chef or private dinner' },
      { fr: 'Moments sur mesure, selon votre demande', en: 'Tailored moments, on request' },
    ],
    photo: { hiver: P.table, ete: P.terrace },
  },
];

/** Destinations du cahier des charges. Les destinations de montagne précises restent à fournir. */
export const destinations: { key: string; name: L; season: Season; text: L; photo: Photo }[] = [
  {
    key: 'alpes',
    name: { fr: 'Alpes', en: 'Alps' },
    season: 'hiver',
    text: {
      fr: 'Grands domaines skiables, villages d’altitude et chalets au pied des pistes. L’hiver, la montagne se vit entre glisse, repos et tables de caractère.',
      en: 'Vast ski areas, mountain villages and ski-in chalets. In winter, the mountains are about the slopes, rest and characterful tables.',
    },
    photo: P.peak,
  },
  {
    key: 'cote-azur',
    name: { fr: 'Côte d’Azur', en: 'French Riviera' },
    season: 'ete',
    text: {
      fr: 'Criques, villas sur les hauteurs et terrasses face à la Méditerranée, pour un été en pleine lumière.',
      en: 'Coves, hillside villas and terraces facing the Mediterranean, for a summer full of light.',
    },
    photo: P.beach,
  },
  {
    key: 'bretagne',
    name: { fr: 'Bretagne', en: 'Brittany' },
    season: 'ete',
    text: {
      fr: 'Côtes découpées, grandes plages et lumière changeante, pour un été au grand air.',
      en: 'Rugged coastlines, wide beaches and ever-changing light, for a summer in the open air.',
    },
    photo: P.stairs,
  },
  {
    key: 'corse',
    name: { fr: 'Corse', en: 'Corsica' },
    season: 'ete',
    text: {
      fr: 'Eaux turquoise, golfes sauvages et villages perchés, entre mer et montagne.',
      en: 'Turquoise waters, wild bays and hilltop villages, between sea and mountains.',
    },
    photo: P.paddle,
  },
  {
    key: 'provence',
    name: { fr: 'Provence', en: 'Provence' },
    season: 'ete',
    text: {
      fr: 'Lavande, mas en pierre et marchés de village, au rythme lent des journées d’été.',
      en: 'Lavender, stone farmhouses and village markets, at the slow pace of summer days.',
    },
    photo: P.lavender,
  },
];

/** Navigation, avec la photo montrée au survol dans le menu. */
export const nav: { route: Route; label: L; photo: Photo }[] = [
  { route: 'services', label: { fr: 'Prestations', en: 'Services' }, photo: P.table },
  { route: 'destinations', label: { fr: 'Destinations', en: 'Destinations' }, photo: P.clouds },
  { route: 'about', label: { fr: 'À propos', en: 'About' }, photo: P.stars },
  { route: 'journal', label: { fr: 'Journal', en: 'Journal' }, photo: P.terrace },
  { route: 'contact', label: { fr: 'Contact', en: 'Contact' }, photo: P.chalet },
];

/** Notre approche, tirée des attentes de la clientèle décrites dans le cahier des charges. */
export const values: { title: L; text: L }[] = [
  { title: { fr: 'Discrétion', en: 'Discretion' }, text: { fr: 'Vos demandes et vos séjours restent entre nous.', en: 'Your requests and your stays stay between us.' } },
  { title: { fr: 'Sur mesure', en: 'Tailored' }, text: { fr: 'Chaque proposition part de vos envies, jamais d’un catalogue.', en: 'Every proposal starts from your wishes, never from a catalogue.' } },
  { title: { fr: 'Un seul interlocuteur', en: 'One point of contact' }, text: { fr: 'Une personne qui vous connaît, du premier échange au jour J.', en: 'One person who knows you, from the first exchange to the day itself.' } },
  { title: { fr: 'Fiabilité', en: 'Reliability' }, text: { fr: 'Des prestataires choisis avec soin, et un suivi attentif.', en: 'Carefully chosen providers, and attentive follow-up.' } },
];

/** Sujets proposés pour le journal. Aucun article n'est encore rédigé. */
export const journalTopics: { theme: L; title: L; photo: Photo }[] = [
  { theme: { fr: 'Hiver', en: 'Winter' }, title: { fr: 'Choisir sa station selon son style de séjour', en: 'Choosing a resort to suit your style of stay' }, photo: P.skiers },
  { theme: { fr: 'Été', en: 'Summer' }, title: { fr: 'Quatre littoraux français, quatre façons de vivre l’été', en: 'Four French coastlines, four ways to spend the summer' }, photo: P.beach },
  { theme: { fr: 'Conseils', en: 'Tips' }, title: { fr: 'Préparer un transfert sans attente à l’arrivée', en: 'Planning a transfer with no waiting on arrival' }, photo: P.car },
];
