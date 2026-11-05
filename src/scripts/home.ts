/**
 * Accueil : entrée où le logo se dessine, choix de la langue, zoom dans le symbole, puis mise en scène au défilement
 * (mot géant et photos flottantes, fenêtre qui s'ouvre en plein écran, manifeste
 * mot à mot, méthode en cartes 3D, prestations révélées, mur des destinations).
 */
import { gsap, openWindow, ScrollTrigger, SplitText, reduced, revealShape, splitLetters, splitLines, startSmooth } from './shared';
import { startThread, staticThread } from './thread';
import { startCursor } from './cursor';

const root = document.documentElement;
const intro = document.querySelector<HTMLElement>('[data-intro]')!;

/* Entrée : le logo se dessine en CSS (global.css), ici le choix de langue puis le zoom */
const introMode = root.dataset.entry; // play | carry | skip

function remember(key: string, value: string, store: Storage | null) {
  try {
    store?.setItem(key, value);
  } catch {
    /* navigation privée */
  }
}

function chooseLang(): Promise<string> {
  // L'autre version est préchargée pendant que le logo se dessine
  const pre = document.createElement('link');
  pre.rel = 'prefetch';
  pre.href = intro.dataset.there!;
  document.head.append(pre);
  return new Promise((resolve) =>
    intro.querySelectorAll<HTMLButtonElement>('[data-choose]').forEach((b) => b.addEventListener('click', () => resolve(b.dataset.choose!), { once: true })),
  );
}

/** On entre par le creux du premier sommet : il grandit jusqu'à sortir de l'écran. */
function zoomIn(keepVeil: boolean, onReveal?: () => void): Promise<void> {
  const logo = intro.querySelector<HTMLElement>('[data-intro-logo]')!;
  intro.classList.add('is-leaving');
  const box = logo.getBoundingClientRect();
  const ox = 0.442; // sous la pointe du premier sommet, repère du fichier (343 / 777, 62 / 284)
  const oy = 0.218;
  const dx = innerWidth / 2 - (box.left + ox * box.width);
  const dy = innerHeight / 2 - (box.top + oy * box.height);
  // Le creux du sommet (75 px du fichier) doit dépasser largement l'écran
  const gap = (75 / 777) * box.width;
  const scale = gsap.utils.clamp(14, 60, (Math.max(innerWidth, innerHeight) * 1.3) / gap);
  gsap.set(logo, { transformOrigin: `${ox * 100}% ${oy * 100}%`, willChange: 'transform' });
  return new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });
    tl.to('.intro__line, .intro__lang', { opacity: 0, y: 14, duration: 0.5, ease: 'power2.in', stagger: 0.06 }, 0)
      .to(logo, { scale: 1.08, x: dx * 0.15, y: dy * 0.15, duration: 0.7, ease: 'sine.inOut' }, 0)
      .to(logo, { scale, x: dx, y: dy, duration: 1.5, ease: 'expo.in' }, 0.6)
      .to(logo, { opacity: 0, duration: 0.3, ease: 'none' }, 1.85);
    if (!keepVeil) tl.to('.intro__veil', { opacity: 0, duration: 0.9, ease: 'power1.in' }, 1.3);
    if (onReveal) tl.call(onReveal, [], 1.35);
  });
}

function closeIntro() {
  intro.classList.add('is-done');
  document.body.style.overflow = '';
  (window as unknown as { __lenis?: { start(): void } }).__lenis?.start();
}

/* Ouverture : les lettres géantes montent, les photos tombent en place */
const word = document.querySelector<HTMLElement>('.hero__word')!;
splitLetters(word);

function revealHero(paused: boolean) {
  const lines = splitLines(document.querySelector<HTMLElement>('.hero__title')!);
  const tl = openWindow(gsap.timeline({ paused, defaults: { ease: 'expo.out' } }));
  tl.from('.hero__word .ch > span', { yPercent: 110, duration: 1.6, stagger: 0.07 }, 0.1)
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
  return tl;
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
    // Un seul état : la prestation sous la souris. Recalculé au mouvement et au défilement
    // (une page qui défile sous une souris immobile ne déclenche aucun pointerleave).
    const links = Array.from(list.querySelectorAll<HTMLAnchorElement>('a'));
    const shots = preview.querySelectorAll('.preview__shot');
    let active = -1;
    let mx = -1;
    let my = -1;
    let lx = 0;
    let queued = false;
    const setActive = (i: number) => {
      if (i === active) return;
      active = i;
      list.classList.toggle('is-hover', i >= 0);
      links.forEach((a, k) => a.classList.toggle('is-active', k === i));
      if (i >= 0) {
        shots.forEach((s, k) => s.classList.toggle('is-on', k === i));
        gsap.to(preview, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
      } else gsap.to(preview, { opacity: 0, scale: 0.7, duration: 0.5, ease: 'power3.in', overwrite: 'auto' });
    };
    const check = () => {
      queued = false;
      const a = mx < 0 ? null : document.elementFromPoint(mx, my)?.closest('a');
      setActive(a ? links.indexOf(a as HTMLAnchorElement) : -1);
    };
    const queue = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(check);
    };
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse') return;
        mx = e.clientX;
        my = e.clientY;
        px(mx + 30);
        py(my - preview.offsetHeight / 2);
        rot(gsap.utils.clamp(-10, 10, (mx - lx) * 0.25));
        lx = mx;
        queue();
      },
      { passive: true },
    );
    window.addEventListener('scroll', queue, { passive: true });
    const off = () => {
      mx = -1;
      setActive(-1);
    };
    document.documentElement.addEventListener('mouseleave', off);
    window.addEventListener('blur', off);
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
  const thread = document.querySelector<SVGSVGElement>('[data-thread]')!;
  const there = intro.dataset.there!;
  if (introMode === 'skip') intro.classList.add('is-done');
  else document.body.style.overflow = 'hidden';
  if (introMode === 'carry') remember('mecking-intro', '1', sessionStorage);

  if (introMode === 'play') {
    const lang = await chooseLang();
    remember('mecking-lang', lang, localStorage);
    remember('mecking-intro', '1', sessionStorage);
    if (lang !== intro.dataset.lang) {
      // L'autre langue : le zoom part d'ici, l'accueil apparaît sur l'autre page
      remember('mecking-intro', 'carry', sessionStorage);
      if (!reduced) await zoomIn(true);
      location.href = there;
      return;
    }
  }

  if (reduced) {
    root.classList.add('is-ready');
    staticThread(thread);
    if (introMode !== 'skip') await gsap.to(intro, { opacity: 0, duration: 0.4 });
    return closeIntro();
  }
  // Les lignes des titres se calculent avec les vraies polices
  await document.fonts.ready;
  const lenis = startSmooth();
  if (introMode !== 'skip') lenis.stop();
  window.dispatchEvent(new Event('mecking:fit'));
  const hero = revealHero(introMode !== 'skip');
  // Les éléments sont à leur point de départ : la page peut apparaître
  root.classList.add('is-ready');
  scrollScenes();
  startThread(thread);
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) startCursor();
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  if (introMode === 'play') await zoomIn(false, () => hero.play());
  else if (introMode === 'carry') {
    hero.play();
    await gsap.to('.intro__veil', { opacity: 0, duration: 1.1, ease: 'power2.inOut' });
  }
  closeIntro();
}

start();
