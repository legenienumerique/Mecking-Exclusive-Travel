/**
 * Animations communes à toutes les pages : défilement fluide, titres ligne par ligne,
 * photos qui montent à travers un sommet (hiver) ou une vague (été).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
// Développement : accès aux animations pour les vérifier panneau masqué
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

export { gsap, ScrollTrigger, SplitText };

const root = document.documentElement;
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function splitLines(el: HTMLElement) {
  return SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' }).lines;
}

/** Contour de la photo qui monte : deux sommets l'hiver, une vague l'été. p de 0 (cachée) à 1. */
export function shapeClip(p: number) {
  const winter = root.dataset.season === 'hiver';
  const h = winter ? 0.42 : 0.07;
  const base = 1 + h - p * (1 + 2 * h);
  const tri = (x: number, c: number, w: number) => Math.max(0, 1 - Math.abs(x - c) / w);
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = i / 40;
    const y = winter
      ? base - h * Math.max(tri(x, 0.36, 0.42), 0.82 * tri(x, 0.7, 0.34))
      : base + h * Math.sin(x * Math.PI * 3 + p * 5);
    pts.push(`${(x * 100).toFixed(1)}% ${(y * 100).toFixed(2)}%`);
  }
  return `polygon(${pts.join(',')}, 100% 100%, 0% 100%)`;
}

const shapes: { el: HTMLElement; state: { p: number } }[] = [];
export function revealShape(el: Element, trigger: Element, start = 'top 95%', end = 'top 20%') {
  const state = { p: 0 };
  const target = el as HTMLElement;
  shapes.push({ el: target, state });
  const paint = () => (target.style.clipPath = shapeClip(state.p));
  paint();
  gsap.to(state, { p: 1, ease: 'none', onUpdate: paint, scrollTrigger: { trigger, start, end, scrub: true } });
}
window.addEventListener('mecking:season', () => shapes.forEach(({ el, state }) => (el.style.clipPath = shapeClip(state.p))));

/** Défilement fluide, synchronisé avec les animations. */
export function startSmooth() {
  const lenis = new Lenis({ lerp: 0.09 });
  Object.assign(window, { __lenis: lenis });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = document.querySelector<HTMLElement>(a.getAttribute('href')!);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -20 });
    }),
  );
  return lenis;
}

/** Lettres d'un mot géant, chacune dans un masque pour monter. */
export function splitLetters(el: HTMLElement) {
  el.innerHTML = [...el.textContent!.trim()].map((c) => `<span class="ch"><span>${c === ' ' ? '&nbsp;' : c}</span></span>`).join('');
  return el.querySelectorAll('.ch > span');
}

/**
 * Animations déclarées dans le HTML :
 * [data-lines] titre ligne par ligne, [data-shape] photo en sommet/vague,
 * [data-rise] enfants qui montent l'un après l'autre, [data-par] photo en parallaxe.
 */
export function declaredReveals() {
  gsap.utils.toArray<HTMLElement>('[data-lines]').forEach((h) =>
    gsap.from(splitLines(h), { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } }),
  );
  gsap.utils.toArray<HTMLElement>('[data-shape]').forEach((el) => {
    revealShape(el, el);
    const imgs = el.querySelectorAll('img');
    if (imgs.length)
      gsap.fromTo(imgs, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.utils.toArray<HTMLElement>('[data-rise]').forEach((el) =>
    gsap.from(el.children, { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } }),
  );
  gsap.utils.toArray<HTMLElement>('[data-par]').forEach((el) =>
    gsap.fromTo(el, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }),
  );
}
