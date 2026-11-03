/**
 * Accueil : entrée avec le symbole en relief, puis mise en scène au défilement
 * (mot géant et photos flottantes, fenêtre qui s'ouvre en plein écran, manifeste
 * mot à mot, méthode en cartes 3D, prestations révélées, mur des destinations).
 */
import { gsap, ScrollTrigger, SplitText, reduced, revealShape, splitLetters, splitLines, startSmooth } from './shared';
import { startThread, staticThread } from './thread';
import { startCursor } from './cursor';

const root = document.documentElement;
const intro = document.querySelector<HTMLElement>('[data-intro]')!;

/* Entrée */
function endIntro(instant = false) {
  try {
    sessionStorage.setItem('mecking-intro', '1');
  } catch {
    /* rien */
  }
  document.body.style.overflow = '';
  if (instant) {
    intro.classList.add('is-done');
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    gsap.to(intro, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 1.2,
      ease: 'expo.inOut',
      onComplete() {
        intro.classList.add('is-done');
        resolve();
      },
    });
  });
}

async function playIntro(): Promise<void> {
  let seen = false;
  try {
    seen = sessionStorage.getItem('mecking-intro') === '1';
  } catch {
    /* rien */
  }
  if (reduced || seen) return endIntro(true);

  document.body.style.overflow = 'hidden';
  intro.style.clipPath = 'inset(0 0 0% 0)';
  const line = intro.querySelector<HTMLElement>('.intro__line')!;
  let stop = () => {};
  const skip = new Promise<void>((resolve) => {
    const go = () => resolve();
    const events = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const;
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    stop = () => events.forEach((e) => window.removeEventListener(e, go));
  });

  let show: Promise<void>;
  try {
    const { playEmblem } = await import('./emblem');
    show = playEmblem(intro.querySelector('canvas')!, root.dataset.mode === 'jour');
  } catch {
    intro.classList.add('intro--flat');
    show = new Promise((r) => {
      gsap.fromTo('.intro__flat', { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out', onComplete: () => r() });
    });
  }
  gsap.to(line, { opacity: 1, duration: 1.2, delay: 1.6, ease: 'power2.out' });
  await Promise.race([show.then(() => new Promise<void>((r) => setTimeout(r, 900))), skip]);
  stop();
  await endIntro();
}

/* Ouverture : les lettres géantes montent, les photos tombent en place */
const word = document.querySelector<HTMLElement>('.hero__word')!;
splitLetters(word);

function revealHero() {
  const lines = splitLines(document.querySelector<HTMLElement>('.hero__title')!);
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero__word .ch > span', { yPercent: 110, duration: 1.6, stagger: 0.07 }, 0.1)
    .from('[data-hero-window]', { clipPath: 'inset(50% 50% 50% 50%)', duration: 1.8, ease: 'expo.inOut' }, 0)
    .from('.hero__shot img', { scale: 1.4, duration: 2.4 }, 0)
    .from('.tile__in', { scale: 0, rotation: () => gsap.utils.random(-25, 25), opacity: 0, duration: 1.4, stagger: 0.1, ease: 'back.out(1.4)' }, 0.6)
    .from(lines, { yPercent: 110, duration: 1.2, stagger: 0.1 }, 0.8)
    .from('.hero__lead', { opacity: 0, y: 16, duration: 1.2 }, 1.1);

  // Les photos flottent doucement et suivent la souris
  gsap.utils.toArray<HTMLElement>('.tile__in').forEach((el, i) => {
    gsap.to(el, { y: gsap.utils.random(8, 16) * (i % 2 ? 1 : -1), duration: gsap.utils.random(3, 5), repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });
  if (matchMedia('(hover: hover)').matches) {
    const follow = gsap.utils.toArray<HTMLElement>('.tile__shot').map((el, i) => ({
      x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3' }),
      d: ((i % 3) + 1) * 14,
    }));
    window.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      follow.forEach((f) => {
        f.x(nx * f.d * 2);
        f.y(ny * f.d * 2);
      });
    });
  }
}

function scrollScenes() {
  // Les sections fixées d'abord : les déclencheurs placés après en tiennent compte
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    // Ouverture : la fenêtre s'ouvre en plein écran, les photos s'envolent
    const hero = document.querySelector<HTMLElement>('[data-hero]')!;
    gsap
      .timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => (self.progress > 0.55 ? hero.setAttribute('data-tone', 'photo') : hero.removeAttribute('data-tone')),
        },
      })
      .fromTo('[data-hero-window]', { clipPath: 'inset(16% 36% 24% 36%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 1, immediateRender: false }, 0)
      .fromTo('.tile', { x: 0, y: 0, rotation: 0, opacity: 1 }, { immediateRender: false, x: (i) => (i % 2 ? 1 : -1) * window.innerWidth * 0.5, y: (i) => (i < 2 ? -1 : 1) * window.innerHeight * 0.3, rotation: (i) => (i % 2 ? 25 : -25), opacity: 0, ease: 'power2.in', duration: 0.7 }, 0)
      .fromTo('.hero__word', { yPercent: 0, opacity: 1 }, { immediateRender: false, yPercent: 45, opacity: 0, ease: 'power2.in', duration: 0.6 }, 0.15)
      .to('.hero__text', { y: -60, opacity: 0, ease: 'power2.in', duration: 0.4 }, 0);

    // Méthode : l'écran reste fixe, les photos arrivent en cascade, inclinées en 3D
    const steps = gsap.utils.toArray<HTMLElement>('.method__step');
    const cards = gsap.utils.toArray<HTMLElement>('.method__photo');
    const count = document.querySelector<HTMLElement>('[data-count]')!;
    let current = 0;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.method',
        start: 'top top',
        end: () => `+=${window.innerHeight * steps.length * 0.85}`,
        pin: true,
        scrub: 0.8,
        onUpdate(self) {
          const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
          if (i === current) return;
          current = i;
          steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
          count.textContent = String(i + 1).padStart(2, '0');
        },
      },
    });
    gsap.set(cards[0], { rotationZ: -4, rotationY: -6 });
    cards.slice(1).forEach((c, k) => {
      const i = k + 1;
      tl.fromTo(
        c,
        { x: '60vw', y: '70vh', rotationZ: 30, rotationY: -40, rotationX: 22, scale: 0.7, opacity: 0 },
        {
          x: () => i * window.innerWidth * 0.025,
          y: () => -i * window.innerHeight * 0.02,
          rotationZ: -4 + i * 4,
          rotationY: -6,
          rotationX: 2,
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
        },
        (i - 0.75) * 1.1,
      );
    });
    tl.to({}, { duration: 0.6 });

    // Destinations : le mur couché se redresse
    gsap
      .timeline({ scrollTrigger: { trigger: '.dest', start: 'top top', end: '+=160%', pin: true, scrub: 0.8 } })
      .fromTo(
        '[data-wall]',
        { scale: 2.5, rotationX: 58, rotationZ: -24, yPercent: 14 },
        { scale: 0.86, rotationX: 14, rotationZ: -5, yPercent: -8, ease: 'none', duration: 1 },
        0,
      )
      .from('.dest__head > *', { y: 60, opacity: 0, stagger: 0.15, duration: 0.3 }, 0.6);
  });

  mm.add('(max-width: 899px)', () => {
    gsap.fromTo('[data-hero-window]', { clipPath: 'inset(30% 8% 22% 8%)' }, {
      immediateRender: false,
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.fromTo(
      '[data-wall]',
      { scale: 1.5, rotationZ: -10 },
      { scale: 1, rotationZ: 0, ease: 'none', scrollTrigger: { trigger: '.dest', start: 'top bottom', end: 'center center', scrub: true } },
    );
  });

  // Manifeste : les mots s'allument au fil de la lecture
  const words = SplitText.create('[data-words]', { type: 'words' }).words;
  gsap.fromTo(
    words,
    { opacity: 0.14 },
    {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: '.manifest', start: 'top 70%', end: 'bottom 70%', scrub: true },
    },
  );

  // Prestations : la photo s'ouvre, le texte suit
  gsap.utils.toArray<HTMLElement>('.service').forEach((s) => {
    const shot = s.querySelector('.service__shot')!;
    revealShape(shot, s);
    gsap.fromTo(
      shot.querySelectorAll('img'),
      { scale: 1.25 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
    const title = s.querySelector<HTMLElement>('.service__title')!;
    gsap.from(splitLines(title), {
      yPercent: 110,
      duration: 1.2,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: s, start: 'top 55%' },
    });
    gsap.from(s.querySelectorAll('.service__text p, .service__text .btn'), {
      opacity: 0,
      y: 20,
      duration: 1,
      stagger: 0.12,
      delay: 0.3,
      ease: 'power2.out',
      scrollTrigger: { trigger: s, start: 'top 55%' },
    });
  });

  // Titres de section
  gsap.utils.toArray<HTMLElement>('.services__head h2, .end__title').forEach((h) => {
    gsap.from(splitLines(h), {
      yPercent: 110,
      duration: 1.2,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: h, start: 'top 80%' },
    });
  });

  // Liste des prestations : la photo suit la souris
  const list = document.querySelector<HTMLElement>('[data-plist]')!;
  const preview = document.querySelector<HTMLElement>('[data-preview]')!;
  if (matchMedia('(hover: hover) and (min-width: 900px)').matches) {
    const px = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3' });
    const py = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3' });
    const rot = gsap.quickTo(preview, 'rotation', { duration: 0.6, ease: 'power3' });
    let lx = 0;
    window.addEventListener('pointermove', (e) => {
      px(e.clientX + 30);
      py(e.clientY - preview.offsetHeight / 2);
      rot(gsap.utils.clamp(-10, 10, (e.clientX - lx) * 0.25));
      lx = e.clientX;
    });
    const shots = preview.querySelectorAll('.preview__shot');
    list.querySelectorAll('a').forEach((a, i) =>
      a.addEventListener('pointerenter', () => {
        list.classList.add('is-hover');
        shots.forEach((s, k) => s.classList.toggle('is-on', k === i));
        gsap.to(preview, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
      }),
    );
    list.addEventListener('pointerleave', () => {
      list.classList.remove('is-hover');
      gsap.to(preview, { opacity: 0, scale: 0.7, duration: 0.5, ease: 'power3.in' });
    });
  }
  gsap.from(list.querySelectorAll('li'), {
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: 'expo.out',
    scrollTrigger: { trigger: list, start: 'top 85%' },
  });

  revealShape(document.querySelector('.end__shot')!, document.querySelector('.end')!, 'top bottom', 'top 30%');
  gsap.fromTo(
    '.end__shot img',
    { scale: 1.2 },
    { scale: 1, ease: 'none', scrollTrigger: { trigger: '.end', start: 'top bottom', end: 'bottom bottom', scrub: true } },
  );

}

async function start() {
  await playIntro();
  const thread = document.querySelector<SVGSVGElement>('[data-thread]')!;
  if (reduced) return staticThread(thread);
  // Les lignes des titres se calculent avec les vraies polices
  await document.fonts.ready;
  startSmooth();

  revealHero();
  scrollScenes();
  startThread(thread);
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) startCursor();
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

start();
