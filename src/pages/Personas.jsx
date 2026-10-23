import { useState } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { M, ITEMS, recommend, predict, CAT_COLOR } from '../lib/rec.jsx';
import { Stars } from '../lib/Product.jsx';
import { Card, PageHead, Badge } from '../core/ui.jsx';
import { inr } from '../lib/rec.jsx';

export default function Personas() {
  const [uid, setUid] = useState(0); const u = M.users[uid];
  const seen = new Set(u.hist.map(([i]) => i));
  const recs = recommend(u, seen, 10); const popular = recommend(null, seen, 10);
  const Row = ({ it, right }) => (<div className="list-item"><span style={{ fontSize: 24, width: 32 }}>{it.emoji}</span><div style={{ flex: 1, minWidth: 0 }}><b className="small">{it.name}</b><div className="small" style={{ color: CAT_COLOR[it.cat] }}>{it.cat} · {inr(it.price)}</div></div>{right}</div>);
  return (
    <>
      <PageHead title="Customer personas" crumbs="ShopSense / Personas" sub="Inspect learned users from the training set — history vs model recommendations vs a popularity baseline">
        <select className="input" style={{ width: 280 }} value={uid} onChange={(e) => setUid(Number(e.target.value))}>{M.users.map((x) => <option key={x.id} value={x.id}>User #{x.id} · {x.persona}</option>)}</select>
      </PageHead>
      <div className="row wrap mb16 fade-up">{M.users.slice(0, 10).map((x) => <button key={x.id} className={`chip ${uid === x.id ? 'on' : ''}`} onClick={() => setUid(x.id)}>{x.persona}</button>)}</div>
      <div className="grid g3 stagger">
        <Card title="Purchase & rating history" sub={`${u.hist.length} rated items · user bias ${u.bu.toFixed(2)}`} action={<Users size={18} color="var(--accent)" />}>
          {u.hist.slice(0, 10).map(([i, r]) => <Row key={i} it={ITEMS[i]} right={<Stars value={r} size={13} />} />)}
        </Card>
        <Card title="Matrix factorisation picks" sub="Personalised top-10" action={<Badge kind="ok">Ours</Badge>}>
          {recs.map((it) => <Row key={it.id} it={it} right={<Badge kind="acc">{predict(u, it.id).toFixed(1)}★</Badge>} />)}
        </Card>
        <Card title="Popularity baseline" sub="Same top-10 for everyone" action={<TrendingUp size={18} className="muted" />}>
          {popular.map((it) => <Row key={it.id} it={it} right={<Badge kind="mute">{it.pop} likes</Badge>} />)}
        </Card>
      </div>
    </>
  );
}
