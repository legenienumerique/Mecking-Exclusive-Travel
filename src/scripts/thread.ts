/**
 * La ligne de crête qui traverse l'accueil et relie les sections.
 * Hiver : une crête, puis la trace d'un skieur qui descend en godille.
 * Été : l'horizon de la mer, puis le sillage d'un voilier.
 * Elle se termine en dessinant les deux sommets du logo.
 * Le tracé est calculé en coordonnées de page, à chaque recalcul de ScrollTrigger.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type P = { x: number; y: number };
const NS = 'http://www.w3.org/2000/svg';

/** Silhouettes au trait, dessinées dans une boîte de 64 × 48, point d'appui en bas. */
export const RIDERS = {
  hiver: {
    anchor: [30, 42],
    tilt: 32,
    draw: `
      <path d="M2 41.5 L58 45" />
      <path d="M26 42 L30 32 L23 25 L34 15.5" />
      <circle cx="37.5" cy="11.5" r="3.2" />
      <path d="M31 19 L40 24 L46 43" />
      <path d="M28 21 L21 28 L16 43" />`,
  },
  ete: {
    anchor: [32, 42],
    tilt: 9,
    draw: `
      <path d="M5 34 L60 34 L51 42 L13 42 Z" />
      <path d="M32 34 L32 3" />
      <path d="M33 5 L52 31 L33 31" />
      <path d="M31 8 L15 31 L31 31" />`,
  },
} as const;

/** Courbe lisse passant par les points (Catmull-Rom), échantillonnée. */
function spline(ctrl: P[], per = 28): P[] {
  const out: P[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[i - 1] ?? ctrl[i];
    const p1 = ctrl[i];
    const p2 = ctrl[i + 1];
    const p3 = ctrl[i + 2] ?? p2;
    for (let k = i ? 1 : 0; k <= per; k++) {
      const t = k / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  return out;
}

function line(a: P, b: P, n = 24): P[] {
  return Array.from({ length: n }, (_, k) => ({ x: a.x + ((b.x - a.x) * (k + 1)) / n, y: a.y + ((b.y - a.y) * (k + 1)) / n }));
}

export function startThread(svg: SVGSVGElement) {
  const root = document.documentElement;
  const main = svg.parentElement as HTMLElement;
  const ghost = document.createElementNS(NS, 'path');
  const trace = document.createElementNS(NS, 'path');
  const rider = document.createElementNS(NS, 'g');
  ghost.classList.add('thread__ghost');
  trace.classList.add('thread__trace');
  rider.classList.add('thread__rider');
  svg.append(ghost, trace, rider);

  let pts: P[] = [];
  let cl: number[] = [];
  let iStart = 0;
  let iJoin = 0;
  let iM = 0;
  let total = 0;
  let current = -1;
  let season = root.dataset.season as 'hiver' | 'ete';
  const RIDE = 0.6; // hauteur du skieur ou du voilier dans l'écran

  function build() {
    season = root.dataset.season as 'hiver' | 'ete';
    const W = root.clientWidth;
    const vh = window.innerHeight;
    const mobile = W < 700;
    const top = main.getBoundingClientRect().top + window.scrollY;
    const box = (sel: string) => {
      const r = document.querySelector(sel)!.getBoundingClientRect();
      return { t: r.top + window.scrollY - top, h: r.height };
    };
    // L'ouverture reste fixée un moment : la crête commence en bas de sa photo
    const m = box('.manifest');
    const hero = { t: m.t - vh * 0.6, h: vh * 0.9 };
    const end = box('.end');
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(main.offsetHeight));

    // Premier écran
    let head: P[];
    if (season === 'hiver') {
      // Crête déjà dessinée jusqu'au sommet, d'où part le skieur
      // Sur téléphone, la crête reste dans le haut, au-dessus du titre
      const ridge: [number, number][] = mobile
        ? [[0.3, 0.36], [0.44, 0.24], [0.52, 0.3], [0.66, 0.16], [0.72, 0.21], [0.84, 0.12]]
        : [[0.34, 0.66], [0.46, 0.5], [0.54, 0.58], [0.66, 0.36], [0.72, 0.44], [0.82, 0.2]];
      head = ridge.flatMap(([x, y], i) => {
        const p = { x: x * W, y: hero.t + y * hero.h };
        if (!i) return [p];
        const [px, py] = ridge[i - 1];
        return line({ x: px * W, y: hero.t + py * hero.h }, p, 30);
      });
      iStart = head.length - 1;
    } else {
      // Horizon : une houle douce, le voilier part de la gauche
      const y0 = hero.t + 0.7 * hero.h;
      head = Array.from({ length: 120 }, (_, k) => {
        const u = k / 119;
        return { x: (0.4 + u * 0.46) * W, y: y0 + Math.sin(u * Math.PI * 5) * 6 };
      });
      iStart = Math.round(head.length * 0.1);
    }

    // Godille ou sillage, d'un bord à l'autre, jusqu'à la dernière section
    const last = head[head.length - 1];
    const left = mobile ? 0.12 : 0.1;
    const right = 1 - left;
    const step = vh * (mobile ? 0.7 : 0.9);
    const ctrl: P[] = [last, { x: 0.9 * W, y: hero.t + hero.h * (season === 'hiver' ? 0.75 : 0.95) }];
    let y = hero.t + hero.h + vh * 0.35;
    let side = 0;
    const mStart = { x: (mobile ? 0.5 : 0.66) * W, y: end.t + end.h * 0.62 };
    while (y < mStart.y - step * 0.6) {
      ctrl.push({ x: (side ? right : left) * W, y });
      side ^= 1;
      y += step;
    }
    ctrl.push(mStart);
    const body = spline(ctrl);
    iJoin = head.length + 28 * 2; // après le premier virage
    iM = head.length + body.length - 2;

    // Les deux sommets du logo pour finir
    const mw = Math.min(W * (mobile ? 0.36 : 0.2), 300);
    const mh = mw * 0.4;
    const M: [number, number][] = [[0.29, 0], [0.48, 0.65], [0.71, 0], [1, 1]];
    let prev = { x: mStart.x, y: mStart.y };
    const base = { x: mStart.x, y: mStart.y - mh };
    const tail = M.flatMap(([u, v]) => {
      const p = { x: base.x + u * mw, y: base.y + v * mh };
      const seg = line(prev, p, 20);
      prev = p;
      return seg;
    });

    pts = [...head, ...body.slice(1), ...tail];
    cl = [0];
    for (let i = 1; i < pts.length; i++) cl.push(cl[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    total = cl[cl.length - 1];
    const d = 'M' + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('L');
    ghost.setAttribute('d', d);
    trace.setAttribute('d', d);
    trace.style.strokeDasharray = `${total} ${total}`;

    const r = RIDERS[season];
    rider.innerHTML = r.draw;
    current = -1;
    tick();
  }

  /** Longueur de trait visée pour la position de défilement. */
  function target(s: number) {
    const vh = window.innerHeight;
    const maxS = root.scrollHeight - vh;
    const sJoin = Math.max(1, pts[iJoin].y - RIDE * vh);
    // Le skieur attend au sommet que la crête entre dans l'écran
    const sStart = Math.min(sJoin - 1, Math.max(0, pts[iStart].y - 0.35 * vh));
    if (s <= sStart) return cl[iStart];
    if (s <= sJoin) return cl[iStart] + (cl[iJoin] - cl[iStart]) * ((s - sStart) / (sJoin - sStart));
    const sM = pts[iM].y - RIDE * vh;
    if (s >= sM) {
      const span = Math.max(1, maxS - sM - vh * 0.15);
      return cl[iM] + (total - cl[iM]) * Math.min(1, (s - sM) / span);
    }
    const ty = s + RIDE * vh;
    let lo = iJoin;
    let hi = iM;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid].y < ty) lo = mid;
      else hi = mid;
    }
    const k = (ty - pts[lo].y) / Math.max(0.001, pts[hi].y - pts[lo].y);
    return cl[lo] + (cl[hi] - cl[lo]) * Math.min(1, Math.max(0, k));
  }

  function at(L: number) {
    let lo = 0;
    let hi = cl.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cl[mid] < L) lo = mid;
      else hi = mid;
    }
    const k = (L - cl[lo]) / Math.max(0.001, cl[hi] - cl[lo]);
    const a = pts[Math.max(0, lo - 2)];
    const b = pts[Math.min(pts.length - 1, hi + 2)];
    return { x: pts[lo].x + (pts[hi].x - pts[lo].x) * k, y: pts[lo].y + (pts[hi].y - pts[lo].y) * k, dx: b.x - a.x, dy: b.y - a.y };
  }

  function tick() {
    if (!pts.length) return;
    const goal = target(window.scrollY);
    current = current < 0 ? goal : current + (goal - current) * 0.2;
    trace.style.strokeDashoffset = String(total - current);
    const p = at(current);
    const r = RIDERS[season];
    const dir = p.dx < -0.5 ? -1 : 1;
    const slope = (Math.atan2(p.dy, Math.abs(p.dx)) * 180) / Math.PI;
    const t = performance.now() / 1000;
    const bob = season === 'ete' ? Math.sin(t * 1.6) * 2.5 : 0;
    const tilt = Math.max(-r.tilt, Math.min(r.tilt, slope)) + (season === 'ete' ? Math.sin(t * 1.1) * 3 : 0);
    const scale = root.clientWidth < 700 ? 1.05 : 1.7;
    rider.setAttribute(
      'transform',
      `translate(${p.x.toFixed(1)} ${(p.y + bob).toFixed(1)}) rotate(${(dir * tilt).toFixed(2)}) scale(${dir * scale} ${scale}) translate(${-r.anchor[0]} ${-r.anchor[1]})`,
    );
    // Il s'efface en arrivant sur le logo
    rider.style.opacity = String(Math.max(0, Math.min(1, (cl[iM] + (total - cl[iM]) * 0.3 - current) / 120)));
  }

  ScrollTrigger.addEventListener('refresh', build);
  window.addEventListener('mecking:season', () => ScrollTrigger.refresh());
  gsap.ticker.add(tick);
  build();
}

/** Mouvement réduit : la ligne entière, fixe, sans personnage. */
export function staticThread(svg: SVGSVGElement) {
  svg.classList.add('thread--static');
  startThread(svg);
}
