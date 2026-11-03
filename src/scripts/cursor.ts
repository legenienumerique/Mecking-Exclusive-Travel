/**
 * Curseur vivant (ordinateur) : le skieur l'hiver, le voilier l'été suit la souris.
 * Silhouettes pleines de 26 px, pour ne pas doubler le personnage au trait de la ligne.
 * Hiver : deux traces de skis, de la poudreuse en continu et des gerbes dans les virages.
 * Été : un sillage en V, des ronds dans l'eau et de l'écume.
 * Rien n'est dessiné quand la souris est immobile : tout s'efface doucement.
 */

/** Boîte de 26 × 20, point d'appui en bas. */
const SHAPES = {
  hiver: {
    anchor: [12, 18.4],
    draw: `
      <path class="f" d="M0.6 17.4 L24.6 18.9 Q25.6 19 25.2 19.6 L0.5 18.5 Z" />
      <circle class="f" cx="16.2" cy="3.6" r="2.1" />
      <path class="f" d="M9.4 17.5 L11.6 12.6 L8.8 10 L13.4 6.3 L17 7.6 L19.4 10.4 L18.2 11.3 L15.8 9.4 L13.6 11.6 L15 13.2 L12.3 17.7 Z" />
      <path class="s" d="M18.8 10.8 L21.4 17.8 M9.6 10.4 L6.4 17" />`,
  },
  ete: {
    anchor: [13, 17],
    draw: `
      <path class="f" d="M1.5 12.6 L24.5 12.6 L20.8 17 L5 17 Z" />
      <path class="f" d="M13.6 1.2 L22.4 11.6 L13.6 11.6 Z" />
      <path class="f" d="M12.4 3.4 L12.4 11.6 L5.4 11.6 Z" />
      <path class="s" d="M13 0.8 L13 12.6" />`,
  },
} as const;

type Trail = { x: number; y: number; nx: number; ny: number; t: number };
type Dot = { x: number; y: number; vx: number; vy: number; t: number; life: number; r: number };
type Ring = { x: number; y: number; t: number };

export function startCursor() {
  const root = document.documentElement;
  const canvas = document.createElement('canvas');
  canvas.className = 'fx';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d')!;

  const NS = 'http://www.w3.org/2000/svg';
  const rider = document.createElementNS(NS, 'svg');
  rider.setAttribute('class', 'cursor-rider');
  rider.setAttribute('viewBox', '0 0 26 20');
  rider.setAttribute('aria-hidden', 'true');
  const body = document.createElementNS(NS, 'g');
  rider.append(body);
  document.body.append(rider);

  let W = 0;
  let H = 0;
  const size = () => {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * d;
    canvas.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  size();
  window.addEventListener('resize', size);

  let season = root.dataset.season as 'hiver' | 'ete';
  const dress = () => {
    season = root.dataset.season as 'hiver' | 'ete';
    body.innerHTML = SHAPES[season].draw;
  };
  dress();
  window.addEventListener('mecking:season', dress);

  const trail: Trail[] = [];
  const dots: Dot[] = [];
  const rings: Ring[] = [];
  let mx = -100;
  let my = -100;
  let x = -100;
  let y = -100;
  let ang = 0;
  let lastRing = 0;
  let seen = false;

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX;
      my = e.clientY;
      root.classList.add('has-rider');
      if (!seen) {
        x = mx;
        y = my;
        seen = true;
        rider.classList.add('is-on');
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener('mouseleave', () => rider.classList.remove('is-on'));
  // Un vrai clic tactile ou au stylet rend la flèche habituelle
  window.addEventListener('pointerdown', (e) => e.pointerType !== 'mouse' && root.classList.remove('has-rider'));
  document.documentElement.addEventListener('mouseenter', () => seen && rider.classList.add('is-on'));

  const ink = () => (root.dataset.mode === 'jour' ? '9, 24, 55' : '242, 244, 245');
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  function frame(now: number) {
    requestAnimationFrame(frame);
    // Le personnage rejoint la souris avec un peu d'inertie, un peu en dessous de la pointe
    // Le personnage remplace la flèche : ses skis ou sa coque sous la pointe
    const tx = mx;
    const ty = my + 4;
    const dx = tx - x;
    const dy = ty - y;
    x += dx * 0.16;
    y += dy * 0.16;
    const sp = Math.hypot(dx, dy) * 0.16;
    if (sp > 0.6) {
      let da = Math.atan2(dy, dx) - ang;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      ang += da * 0.2;
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      trail.push({ x, y, nx, ny, t: now });
      if (season === 'hiver') {
        // Poudreuse soulevée en continu derrière les skis
        const n = Math.min(4, 1 + Math.floor(sp / 4));
        for (let k = 0; k < n; k++) {
          dots.push({ x: x - Math.cos(ang) * 6, y: y - Math.sin(ang) * 6, vx: -Math.cos(ang) * rnd(0.3, 1.2) + rnd(-0.5, 0.5), vy: rnd(-1.6, -0.3), t: now, life: rnd(900, 1500), r: rnd(1, 2.6) });
        }
        // Gerbe dans un virage serré
        if (Math.abs(da) * sp > 1.6) {
          for (let k = 0; k < 14; k++) {
            dots.push({ x, y, vx: nx * rnd(-3.4, 3.4) - Math.cos(ang) * rnd(0.5, 2), vy: rnd(-3.6, -0.8), t: now, life: rnd(700, 1300), r: rnd(1.2, 3.2) });
          }
        }
      }
      if (season === 'ete') {
        if (now - lastRing > 240) {
          rings.push({ x, y, t: now });
          lastRing = now;
        }
        for (let k = 0; k < 2; k++) {
          dots.push({ x: x + rnd(-8, 8), y: y + rnd(-3, 3), vx: -Math.cos(ang) * rnd(0, 0.6), vy: -Math.sin(ang) * rnd(0, 0.6), t: now, life: rnd(900, 1500), r: rnd(0.8, 1.8) });
        }
      }
    }

    // Silhouette : de profil, tournée dans le sens de la marche
    const dir = Math.cos(ang) < 0 ? -1 : 1;
    const slope = Math.max(-30, Math.min(30, (Math.atan2(Math.sin(ang), Math.abs(Math.cos(ang))) * 180) / Math.PI));
    const tilt = season === 'ete' ? Math.max(-10, Math.min(10, slope)) + Math.sin(now / 600) * 3 : slope;
    const [ax, ay] = SHAPES[season].anchor;
    rider.style.transform = `translate(${x - ax}px, ${y - ay}px) rotate(${dir * tilt}deg) scaleX(${dir})`;
    rider.style.transformOrigin = `${ax}px ${ay}px`;

    // Traces
    ctx.clearRect(0, 0, W, H);
    const c = ink();
    const life = season === 'hiver' ? 2600 : 1800;
    while (trail.length && now - trail[0].t > life) trail.shift();
    if (trail.length > 1) {
      ctx.lineCap = 'round';
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        const age = (now - b.t) / life;
        const k = (1 - age) * (1 - age);
        if (season === 'hiver') {
          // Deux traces de skis parallèles
          ctx.strokeStyle = `rgba(${c}, ${0.85 * k})`;
          ctx.lineWidth = 1.8;
          for (const s of [-2.6, 2.6]) {
            ctx.beginPath();
            ctx.moveTo(a.x + a.nx * s, a.y + a.ny * s);
            ctx.lineTo(b.x + b.nx * s, b.y + b.ny * s);
            ctx.stroke();
          }
        } else {
          // Sillage en V : deux traits qui s'écartent en vieillissant
          const spread = 4 + age * 26;
          ctx.strokeStyle = `rgba(${c}, ${0.75 * k})`;
          ctx.lineWidth = 1.4;
          for (const s of [-1, 1]) {
            const sa = 4 + ((now - a.t) / life) * 26;
            ctx.beginPath();
            ctx.moveTo(a.x + a.nx * sa * s, a.y + a.ny * sa * s);
            ctx.lineTo(b.x + b.nx * spread * s, b.y + b.ny * spread * s);
            ctx.stroke();
          }
        }
      }
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      const k = (now - r.t) / 1500;
      if (k >= 1) {
        rings.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(${c}, ${0.55 * (1 - k)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, 4 + k * 26, 1.5 + k * 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i];
      const k = (now - d.t) / d.life;
      if (k >= 1) {
        dots.splice(i, 1);
        continue;
      }
      d.x += d.vx;
      d.y += d.vy;
      d.vy += season === 'hiver' ? 0.09 : 0;
      d.vx *= 0.97;
      ctx.fillStyle = `rgba(${c}, ${0.9 * (1 - k)})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  requestAnimationFrame(frame);
}
