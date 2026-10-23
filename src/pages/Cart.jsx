import { ShoppingBag, Trash2, Heart, Sparkles } from 'lucide-react';
import { useShop, ITEMS, inr, similar } from '../lib/rec.jsx';
import Product from '../lib/Product.jsx';
import { Card, PageHead, Empty } from '../core/ui.jsx';
import { useApp } from '../core/context.jsx';

export default function Cart() {
  const s = useShop(); const { toast } = useApp();
  const lines = s.cart.map((c) => ({ ...ITEMS[c.id], qty: c.qty }));
  const sub = lines.reduce((a, l) => a + l.price * l.qty, 0); const ship = sub > 999 || !sub ? 0 : 79;
  const also = lines.length ? similar(lines[0].id, 4) : [];
  return (
    <>
      <PageHead title="Cart & wishlist" crumbs="ShopSense / Cart" />
      <div className="grid g-2-1 stagger">
        <Card title={`Cart (${lines.length})`} action={<ShoppingBag size={18} color="var(--accent)" />}>
          {!lines.length ? <Empty icon={ShoppingBag} title="Your cart is empty" text="Add products from the shop." /> : lines.map((l) => (
            <div key={l.id} className="list-item"><span style={{ fontSize: 30 }}>{l.emoji}</span><div style={{ flex: 1 }}><b className="small">{l.name}</b><div className="small muted">{l.cat}</div></div>
              <div className="row"><button className="btn btn-ghost btn-sm" onClick={() => s.setCart(s.cart.map((c) => (c.id === l.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c)))}>−</button><b>{l.qty}</b>
                <button className="btn btn-ghost btn-sm" onClick={() => s.setCart(s.cart.map((c) => (c.id === l.id ? { ...c, qty: c.qty + 1 } : c)))}>+</button></div>
              <b className="mono" style={{ width: 90, textAlign: 'right' }}>{inr(l.price * l.qty)}</b>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => s.setCart(s.cart.filter((c) => c.id !== l.id))}><Trash2 size={14} /></button></div>))}
        </Card>
        <Card title="Order summary">
          {[['Subtotal', sub], ['Shipping', ship]].map(([k, v]) => <div key={k} className="between list-item small"><span>{k}</span><b className="mono">{v ? inr(v) : 'FREE'}</b></div>)}
          <div className="between mt12"><b>Total</b><b className="grad-text" style={{ fontSize: 24 }}>{inr(sub + ship)}</b></div>
          <button className="btn btn-primary btn-block mt16" disabled={!lines.length} onClick={() => { s.setCart([]); toast('Order placed (demo) 🎉', 'ok'); }}>Place order (demo)</button>
          <div className="small bold muted mt16 mb12 row"><Heart size={14} color="#f43f5e" /> Wishlist</div>
          {s.wish.map((id) => <div key={id} className="list-item small"><span>{ITEMS[id].emoji}</span><span style={{ flex: 1 }}>{ITEMS[id].name}</span><button className="btn btn-soft btn-sm" onClick={() => { s.addCart(id); s.setWish(s.wish.filter((x) => x !== id)); }}>Move to cart</button></div>)}
          {!s.wish.length && <div className="small faint">No items yet.</div>}
        </Card>
      </div>
      {also.length > 0 && <Card className="mt16 fade-up" title="Frequently explored together" action={<Sparkles size={18} color="var(--accent)" />}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>{also.map((it) => <Product key={it.id} it={it} compact />)}</div></Card>}
    </>
  );
}
