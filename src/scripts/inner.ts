/**
 * Pages intérieures : en-tête (lettres géantes, photo qui s'ouvre en plein écran),
 * animations déclarées dans le HTML, curseur vivant et défilement fluide.
 */
import { declaredReveals, gsap, reduced, splitLetters, splitLines, startSmooth } from './shared';
import { startCursor } from './cursor';

function heroScene() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const letters = splitLetters(hero.querySelector<HTMLElement>('.hero__word')!);
  gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .from(letters, { yPercent: 110, duration: 1.6, stagger: 0.06 }, 0.1)
    .from('[data-hero-window]', { clipPath: 'inset(50% 50% 50% 50%)', duration: 1.8, ease: 'expo.inOut' }, 0)
    .from('.hero__shot img', { scale: 1.4, duration: 2.4 }, 0)
    .from(splitLines(hero.querySelector<HTMLElement>('.hero__title')!), { yPercent: 110, duration: 1.2, stagger: 0.1 }, 0.6)
    .from('.hero__lead', { opacity: 0, y: 16, duration: 1.2 }, 0.9);

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=90%',
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => (self.progress > 0.55 ? hero.setAttribute('data-tone', 'photo') : hero.removeAttribute('data-tone')),
        },
      })
      .fromTo('[data-hero-window]', { clipPath: 'inset(16% 36% 24% 36%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 1, immediateRender: false }, 0)
      .fromTo('.hero__word', { yPercent: 0, opacity: 1 }, { immediateRender: false, yPercent: 45, opacity: 0, ease: 'power2.in', duration: 0.6 }, 0.15)
      .to('.hero__text', { y: -60, opacity: 0, ease: 'power2.in', duration: 0.4 }, 0);
  });
  mm.add('(max-width: 899px)', () => {
    gsap.fromTo(
      '[data-hero-window]',
      { clipPath: 'inset(36% 8% 18% 8%)' },
      { immediateRender: false, clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } },
    );
  });
}

async function start() {
  if (reduced) return;
  await document.fonts.ready;
  startSmooth();
  heroScene();
  declaredReveals();
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) startCursor();
}

start();
