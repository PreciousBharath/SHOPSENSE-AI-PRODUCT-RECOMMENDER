import { createContext, useContext, useMemo } from 'react';
import M from '../model/model.json';
import { usePersist } from '../core/context.jsx';

export { M };
export const ITEMS = M.items;
export const CAT_COLOR = { Electronics: '#6366f1', Fashion: '#ec4899', Books: '#f59e0b', 'Home & Kitchen': '#14b8a6', 'Sports & Fitness': '#10b981', Beauty: '#f43f5e' };
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = (a) => Math.sqrt(dot(a, a)) || 1;
export const cos = (a, b) => dot(a, b) / (norm(a) * norm(b));

// Solve (A) x = b with Gaussian elimination (K×K, K = 16)
function solve(A, b) {
  const n = b.length; const m = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
    [m[c], m[p]] = [m[p], m[c]];
    for (let r = c + 1; r < n; r++) { const f = m[r][c] / m[c][c]; for (let k = c; k <= n; k++) m[r][k] -= f * m[c][k]; }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) { let s = m[r][n]; for (let k = r + 1; k < n; k++) s -= m[r][k] * x[k]; x[r] = s / m[r][r]; }
  return x;
}

// Fold a new user into the trained latent space from their ratings (ridge regression / one ALS step)
export function foldIn(ratings, lambda = 0.6) {
  const ids = Object.keys(ratings).map(Number); if (!ids.length) return null;
  const res = ids.map((i) => ratings[i] - M.mu - ITEMS[i].b); const bu = res.reduce((a, b) => a + b, 0) / ids.length * (ids.length / (ids.length + 2));
  const K = M.K; const A = Array.from({ length: K }, (_, r) => Array.from({ length: K }, (_, c) => (r === c ? lambda : 0))); const b = new Array(K).fill(0);
  ids.forEach((i, j) => { const q = ITEMS[i].q; const y = res[j] - bu; for (let r = 0; r < K; r++) { b[r] += q[r] * y; for (let c = 0; c < K; c++) A[r][c] += q[r] * q[c]; } });
  return { p: solve(A, b), bu };
}
export const predict = (u, i) => Math.max(1, Math.min(5, M.mu + u.bu + ITEMS[i].b + dot(u.p, ITEMS[i].q)));
export function recommend(u, exclude = new Set(), n = 12, diversity = 0) {
  const scored = ITEMS.filter((it) => !exclude.has(it.id)).map((it) => ({ ...it, score: u ? predict(u, it.id) : 3 + it.b + it.pop / 400 }));
  scored.sort((a, b) => b.score - a.score);
  if (!diversity) return scored.slice(0, n);
  const out = []; const pool = scored.slice(0, 60);
  while (out.length < n && pool.length) { // MMR re-ranking
    let best = 0, bv = -1e9;
    pool.forEach((c, k) => { const sim = out.length ? Math.max(...out.map((o) => cos(o.q, c.q))) : 0; const v = (1 - diversity) * c.score - diversity * sim * 2; if (v > bv) { bv = v; best = k; } });
    out.push(pool.splice(best, 1)[0]);
  }
  return out;
}
export const similar = (id, n = 6) => ITEMS.filter((x) => x.id !== id).map((x) => ({ ...x, sim: cos(ITEMS[id].q, x.q) })).sort((a, b) => b.sim - a.sim).slice(0, n);
export const project = (p) => { const c = p.map((v, k) => v - M.Qmean[k]); return [dot(c, M.V[0]), dot(c, M.V[1])]; };
export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

const Ctx = createContext(null);
export const useShop = () => useContext(Ctx);
export function ShopProvider({ children }) {
  const [ratings, setRatings] = usePersist('ratings', { 3: 5, 0: 4, 53: 5, 43: 4 });
  const [cart, setCart] = usePersist('cart', []);
  const [wish, setWish] = usePersist('wish', []);
  const user = useMemo(() => foldIn(ratings), [ratings]);
  const rate = (id, r) => setRatings((x) => { const n = { ...x }; if (r) n[id] = r; else delete n[id]; return n; });
  const addCart = (id) => setCart((c) => { const f = c.find((x) => x.id === id); return f ? c.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)) : [...c, { id, qty: 1 }]; });
  return <Ctx.Provider value={{ ratings, rate, setRatings, user, cart, setCart, addCart, wish, setWish }}>{children}</Ctx.Provider>;
}
