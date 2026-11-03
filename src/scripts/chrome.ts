/**
 * Éléments communs à toutes les pages : saison, mode jour/nuit, menu,
 * en-tête qui s'adapte au fond, barre de progression.
 */
import { gsap } from 'gsap';
import type { Season } from '../data/site';

const root = document.documentElement;

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* navigation privée : le choix vaut pour la page */
  }
}

// Saison
const seasonButtons = document.querySelectorAll<HTMLButtonElement>('[data-season-set]');
function showSeason() {
  seasonButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.seasonSet === root.dataset.season)));
}
seasonButtons.forEach((b) =>
  b.addEventListener('click', () => {
    const s = b.dataset.seasonSet as Season;
    if (s === root.dataset.season) return;
    root.dataset.season = s;
    store('mecking-saison', s);
    showSeason();
    window.dispatchEvent(new CustomEvent('mecking:season', { detail: s }));
  }),
);
showSeason();

// Mode jour / nuit
document.querySelectorAll<HTMLButtonElement>('[data-mode-toggle]').forEach((b) =>
  b.addEventListener('click', () => {
    const m = root.dataset.mode === 'jour' ? 'nuit' : 'jour';
    root.dataset.mode = m;
    store('mecking-mode', m);
    window.dispatchEvent(new CustomEvent('mecking:mode', { detail: m }));
  }),
);

// Langue : le choix est retenu pour les prochaines visites
document.querySelectorAll<HTMLAnchorElement>('[data-lang-set]').forEach((a) =>
  a.addEventListener('click', () => store('mecking-lang', a.dataset.langSet!)),
);

// Menu plein écran : rideau qui descend, liens qui montent, photo de la page survolée
const menu = document.querySelector<HTMLElement>('[data-menu]')!;
const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]')!;
const links = [...menu.querySelectorAll<HTMLAnchorElement>('.menu__link')];
const list = menu.querySelector<HTMLElement>('[data-menu-list]')!;
const shots = [...menu.querySelectorAll<HTMLElement>('.menu__shot')];
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

function showPage(i: number) {
  links.forEach((l, k) => l.classList.toggle('is-on', k === i));
  shots.forEach((s, k) => s.classList.toggle('is-on', k === i));
}
links.forEach((l, i) => {
  l.addEventListener('pointerenter', () => {
    list.classList.add('is-hover');
    showPage(i);
  });
  l.addEventListener('focus', () => showPage(i));
});
list.addEventListener('pointerleave', () => list.classList.remove('is-hover'));

let moving: gsap.core.Timeline | null = null;
function setMenu(open: boolean) {
  const lenis = (window as { __lenis?: { stop(): void; start(): void } }).__lenis;
  if (lenis) open ? lenis.stop() : lenis.start();
  opener.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  moving?.kill();
  if (open) {
    menu.hidden = false;
    // Photos du menu chargées seulement à la première ouverture
    menu.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
    const here = links.findIndex((l) => l.getAttribute('aria-current') === 'page');
    showPage(here < 0 ? 0 : here);
    links[0]?.focus({ preventScroll: true });
    if (calm) return;
    moving = gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
      .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.07 }, 0.35)
      .fromTo('.menu__preview', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1.2 }, 0.45)
      .fromTo('.menu__foot', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6);
  } else {
    const done = () => {
      menu.hidden = true;
      opener.focus({ preventScroll: true });
    };
    if (calm) return done();
    moving = gsap
      .timeline({ onComplete: done })
      .to(links, { yPercent: -110, duration: 0.5, stagger: 0.04, ease: 'power3.in' })
      .to('.menu__preview, .menu__foot', { opacity: 0, duration: 0.4 }, 0)
      .to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.inOut' }, 0.25);
  }
}
opener.addEventListener('click', () => setMenu(true));
menu.querySelector('[data-menu-close]')!.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menu.hidden) setMenu(false);
});

// En-tête : clair sur les photos, opaque ailleurs, masqué quand on descend
const bar = document.querySelector<HTMLElement>('[data-bar]')!;
const bead = document.querySelector<HTMLElement>('[data-progress]');
let lastY = window.scrollY;
let ticking = false;

function onScroll() {
  ticking = false;
  const y = window.scrollY;
  const probe = bar.offsetHeight / 2;
  let overPhoto = false;
  // Relu à chaque fois : l'ouverture devient une photo en cours de défilement
  document.querySelectorAll<HTMLElement>('[data-tone="photo"]').forEach((p) => {
    const r = p.getBoundingClientRect();
    if (r.top <= probe && r.bottom >= probe) overPhoto = true;
  });
  bar.classList.toggle('is-light', overPhoto);
  bar.classList.toggle('is-solid', !overPhoto && y > 10);
  bar.classList.toggle('is-hidden', y > lastY + 4 && y > window.innerHeight * 0.6 && menu.hidden);
  if (y < lastY - 4 || y < 10) bar.classList.remove('is-hidden');
  lastY = y;

  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (bead) bead.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
}

window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
window.addEventListener('resize', onScroll);
onScroll();

// Mots géants : leur taille remplit la largeur de l'écran
const fits = document.querySelectorAll<HTMLElement>('[data-fit]');
function fit() {
  fits.forEach((el) => {
    el.style.setProperty('--fit', '10vw');
    const range = document.createRange();
    range.selectNodeContents(el);
    const w = range.getBoundingClientRect().width || 1;
    el.style.setProperty('--fit', `${((10 * root.clientWidth * 0.96) / w).toFixed(3)}vw`);
  });
}
fit();
document.fonts.ready.then(fit);
window.addEventListener('resize', fit);

// Mot du pied de page : il monte quand on arrive en bas
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.3 },
);
document.querySelectorAll('.foot__word').forEach((el) => io.observe(el));
