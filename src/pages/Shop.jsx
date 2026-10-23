import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { useShop, recommend, similar, ITEMS, M, CAT_COLOR } from '../lib/rec.jsx';
import Product from '../lib/Product.jsx';
import { Card, PageHead, Tabs } from '../core/ui.jsx';

export default function Shop() {
  const s = useShop(); const nav = useNavigate();
  const [cat, setCat] = useState('All'); const [q, setQ] = useState(''); const [sort, setSort] = useState('pop');
  const rated = new Set(Object.keys(s.ratings).map(Number));
  const recs = recommend(s.user, rated, 6);
  const fav = Object.entries(s.ratings).sort((a, b) => b[1] - a[1])[0];
  const sims = fav ? similar(Number(fav[0]), 6) : [];
  let list = ITEMS.filter((i) => (cat === 'All' || i.cat === cat) && i.name.toLowerCase().includes(q.toLowerCase()));
  list = [...list].sort((a, b) => (sort === 'pop' ? b.pop - a.pop : sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : b.rating - a.rating));
  return (
    <>
      <div className="hero-banner fade-up mb16">
        <div className="between wrap"><div><h2>Shopping that learns your taste ✨</h2><p>Rate a few products with ⭐ — our matrix-factorisation model re-computes your {M.K}-dimensional taste vector instantly.</p></div>
          <button className="btn btn-ghost" onClick={() => nav('/foryou')}>See all picks <ArrowRight size={16} /></button></div>
      </div>
      <Card className="fade-up" title="Recommended for you" sub={s.user ? `Based on ${rated.size} ratings` : 'Rate products to personalise'} action={<Sparkles size={18} color="var(--accent)" />}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 14 }}>{recs.map((it) => <Product key={it.id} it={it} score={it.score} compact />)}</div>
      </Card>
      {fav && (<Card className="mt16 fade-up" title={`Because you loved ${ITEMS[fav[0]].emoji} ${ITEMS[fav[0]].name}`} sub="Nearest neighbours in the learned embedding space">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 14 }}>{sims.map((it) => <Product key={it.id} it={it} reason={`${Math.round(it.sim * 100)}% similar embedding`} compact />)}</div>
      </Card>)}
      <PageHead title="All products" sub={`${list.length} of ${ITEMS.length} products`}>
        <Tabs value={sort} onChange={setSort} options={[{ id: 'pop', label: 'Popular' }, { id: 'rating', label: 'Top rated' }, { id: 'low', label: 'Price ↑' }, { id: 'high', label: 'Price ↓' }]} />
      </PageHead>
      <div className="row wrap mb16">
        <div className="search" style={{ maxWidth: 280 }}><Search size={16} /><input placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {['All', ...M.cats].map((c) => <button key={c} className={`chip ${cat === c ? 'on' : ''}`} style={cat === c && c !== 'All' ? { background: CAT_COLOR[c], borderColor: CAT_COLOR[c] } : {}} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="grid stagger" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>{list.map((it) => <Product key={it.id} it={it} />)}</div>
    </>
  );
}
