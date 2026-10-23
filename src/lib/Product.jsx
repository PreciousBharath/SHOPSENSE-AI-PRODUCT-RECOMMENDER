import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useShop, CAT_COLOR, inr } from './rec.jsx';
import { useApp } from '../core/context.jsx';

export function Stars({ value = 0, onRate, size = 16 }) {
  return (
    <div className="row" style={{ gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} style={{ cursor: onRate ? 'pointer' : 'default' }} color={s <= value ? '#f59e0b' : 'var(--faint)'} fill={s <= value ? '#f59e0b' : 'none'}
          onClick={(e) => { e.stopPropagation(); onRate?.(s === value ? 0 : s); }} />))}
    </div>
  );
}

export default function Product({ it, score, reason, compact }) {
  const s = useShop(); const { toast } = useApp(); const c = CAT_COLOR[it.cat];
  const mine = s.ratings[it.id] || 0; const wished = s.wish.includes(it.id);
  return (
    <div className="card hover prod pop" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="prod-img" style={{ background: `radial-gradient(circle at 30% 20%, ${c}55, transparent 60%), linear-gradient(135deg, ${c}22, ${c}44)` }}>
        <span className="prod-emoji">{it.emoji}</span>
        {score != null && <span className="badge" style={{ position: 'absolute', left: 10, top: 10, background: '#000a', color: '#fff' }}>{Math.round(((score - 1) / 4) * 100)}% match</span>}
        <button className="icon-btn" style={{ position: 'absolute', right: 10, top: 10, width: 32, height: 32, color: wished ? '#f43f5e' : undefined }}
          onClick={() => { s.setWish(wished ? s.wish.filter((x) => x !== it.id) : [...s.wish, it.id]); toast(wished ? 'Removed from wishlist' : 'Added to wishlist ❤️', 'ok'); }}><Heart size={15} fill={wished ? '#f43f5e' : 'none'} /></button>
      </div>
      <div style={{ padding: compact ? 12 : 14 }}>
        <div className="small" style={{ color: c, fontWeight: 700 }}>{it.cat}</div>
        <b className="small" style={{ display: 'block', minHeight: 36 }}>{it.name}</b>
        <div className="between mt8"><b>{inr(it.price)}</b><span className="small muted row" style={{ gap: 3 }}><Star size={13} fill="#f59e0b" color="#f59e0b" />{it.rating} ({it.n})</span></div>
        {reason && <div className="small faint mt8" style={{ minHeight: 34 }}>{reason}</div>}
        <div className="between mt12"><Stars value={mine} onRate={(r) => { s.rate(it.id, r); toast(r ? `Rated ${r}★ — recommendations updated` : 'Rating removed', 'info'); }} />
          <button className="btn btn-soft btn-sm" onClick={() => { s.addCart(it.id); toast('Added to cart 🛒', 'ok'); }}><ShoppingCart size={14} /></button></div>
      </div>
    </div>
  );
}
