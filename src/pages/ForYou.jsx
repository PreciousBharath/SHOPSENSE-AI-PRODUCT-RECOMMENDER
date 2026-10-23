import { useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { RotateCcw, Shuffle, UserCheck } from 'lucide-react';
import { useShop, recommend, ITEMS, M, cos, predict } from '../lib/rec.jsx';
import Product, { Stars } from '../lib/Product.jsx';
import { Card, PageHead, Slider, Badge, Empty } from '../core/ui.jsx';
import { useApp } from '../core/context.jsx';

export default function ForYou() {
  const s = useShop(); const { toast } = useApp(); const [div, setDiv] = useState(0.25);
  const rated = new Set(Object.keys(s.ratings).map(Number));
  const recs = recommend(s.user, rated, 16, div);
  const liked = Object.entries(s.ratings).filter(([, r]) => r >= 4).map(([i]) => ITEMS[i]);
  const why = (it) => { if (!liked.length) return ''; const b = liked.map((l) => ({ l, s: cos(l.q, it.q) })).sort((a, c) => c.s - a.s)[0]; return `Because you liked ${b.l.emoji} ${b.l.name}`; };
  const radar = M.cats.map((c) => { const its = ITEMS.filter((i) => i.cat === c); return { c: c.split(' ')[0], v: s.user ? +(its.reduce((a, i) => a + predict(s.user, i.id), 0) / its.length).toFixed(2) : 3 }; });
  const sample = [3, 23, 45, 66, 85, 104, 12, 30];
  return (
    <>
      <PageHead title="Your personalised picks" crumbs="ShopSense / For you" sub="Ranked by predicted rating, re-ranked for diversity (MMR)">
        <button className="btn btn-ghost btn-sm" onClick={() => { s.setRatings({}); toast('Taste profile reset', 'warn'); }}><RotateCcw size={15} /> Reset taste</button>
      </PageHead>
      <div className="grid g-1-2 stagger">
        <div className="grid" style={{ gap: 18, alignContent: 'start' }}>
          <Card title="Your taste profile" sub={s.user ? `Learned from ${rated.size} ratings · bias ${s.user.bu >= 0 ? '+' : ''}${s.user.bu.toFixed(2)}` : 'Cold start — rate a few items'} action={<UserCheck size={18} color="var(--accent)" />}>
            <div style={{ height: 230 }}><ResponsiveContainer><RadarChart data={radar}><PolarGrid stroke="var(--border)" /><PolarAngleAxis dataKey="c" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
              <Radar dataKey="v" name="Predicted rating" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} /><Tooltip /></RadarChart></ResponsiveContainer></div>
          </Card>
          <Card title="Diversity" sub="0 = pure relevance · 1 = maximum variety" action={<Shuffle size={18} color="var(--accent)" />}><Slider label="MMR λ" value={div} min={0} max={0.8} step={0.05} onChange={setDiv} /></Card>
          <Card title="Quick rate to train" sub="Each rating re-solves your latent vector">
            {sample.map((i) => <div key={i} className="list-item"><span style={{ fontSize: 22 }}>{ITEMS[i].emoji}</span><span className="small" style={{ flex: 1 }}>{ITEMS[i].name}</span><Stars value={s.ratings[i] || 0} onRate={(r) => s.rate(i, r)} /></div>)}
          </Card>
        </div>
        <div>
          {!recs.length ? <Card><Empty title="Nothing to recommend" /></Card> : (
            <div className="grid stagger" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>{recs.map((it) => <Product key={it.id} it={it} score={it.score} reason={why(it)} compact />)}</div>)}
          <div className="row wrap mt16">{M.cats.map((c) => <Badge key={c} kind="mute">{c}: {recs.filter((r) => r.cat === c).length}</Badge>)}</div>
        </div>
      </div>
    </>
  );
}
