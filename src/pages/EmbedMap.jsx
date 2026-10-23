import { CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { useShop, M, ITEMS, CAT_COLOR, recommend } from '../lib/rec.jsx';
import { Card, PageHead, Badge } from '../core/ui.jsx';

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null; const d = payload[0].payload;
  return <div className="card" style={{ padding: 10 }}><b className="small">{d.emoji} {d.name}</b><div className="small muted">{d.cat}</div></div>;
}
export default function EmbedMap() {
  const s = useShop();
  // place "you" at the centroid of the products you love + your top recommendations
  const anchors = s.user ? [...Object.entries(s.ratings).filter(([, r]) => r >= 4).map(([i]) => ITEMS[i]), ...recommend(s.user, new Set(Object.keys(s.ratings).map(Number)), 6)] : [];
  const me = anchors.length ? [anchors.reduce((a, i) => a + i.xy[0], 0) / anchors.length, anchors.reduce((a, i) => a + i.xy[1], 0) / anchors.length] : null;
  return (
    <>
      <PageHead title="Embedding map" crumbs="ShopSense / Embeddings" sub={`All ${ITEMS.length} products projected from ${M.K}-D latent space to 2-D with PCA — similar products cluster together`}>
        {me && <Badge kind="acc">⭐ = your taste (centroid of loved + recommended items)</Badge>}
      </PageHead>
      <Card className="fade-up"><div style={{ height: 560 }}><ResponsiveContainer><ScatterChart margin={{ left: -10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="x" type="number" name="PC1" tickLine={false} axisLine={false} domain={['auto', 'auto']} /><YAxis dataKey="y" type="number" name="PC2" tickLine={false} axisLine={false} domain={['auto', 'auto']} />
        <ZAxis dataKey="z" range={[60, 260]} /><Tooltip content={<Tip />} /><Legend />
        {M.cats.map((c) => <Scatter key={c} name={c} fill={CAT_COLOR[c]} fillOpacity={0.75} data={ITEMS.filter((i) => i.cat === c).map((i) => ({ x: i.xy[0], y: i.xy[1], z: i.pop + 5, ...i }))} />)}
        {me && <Scatter name="You" data={[{ x: me[0], y: me[1], z: 400, name: 'Your taste', emoji: '⭐', cat: `${Object.keys(s.ratings).length} ratings` }]} fill="#facc15" shape="star" />}
      </ScatterChart></ResponsiveContainer></div>
        <p className="small faint">Bubble size = popularity. Rate products in the shop and watch the ⭐ move toward the categories you like.</p></Card>
    </>
  );
}
