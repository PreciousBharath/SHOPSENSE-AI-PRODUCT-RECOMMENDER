import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Database, Target, Layers, Gauge } from 'lucide-react';
import { M } from '../lib/rec.jsx';
import { Card, PageHead, Stat, Badge } from '../core/ui.jsx';

export default function Lab() {
  const R = M.ranking; const ours = R['Matrix factorisation (ours)'];
  const bars = ['precision', 'recall', 'hit_rate', 'coverage'].map((k) => ({ k: k.replace('_', ' ') + (k === 'coverage' ? '' : '@10'), ...Object.fromEntries(Object.entries(R).map(([m, v]) => [m.split(' (')[0], +(v[k] * 100).toFixed(1)])) }));
  const last = M.curve[M.curve.length - 1];
  return (
    <>
      <PageHead title="Model lab" crumbs="ShopSense / Model lab" sub={`Matrix factorisation with biases · K = ${M.K} latent factors · L2 λ = ${M.lambda_} · SGD ${M.curve.length} epochs`}>
        <Badge kind="acc">{(M.stats.items * (M.K + 1) + M.stats.users * (M.K + 1)).toLocaleString()} parameters</Badge>
      </PageHead>
      <div className="grid g4 stagger">
        <Stat icon={Database} label="Ratings (users × items)" value={M.stats.ratings} />
        <Stat icon={Target} label="Test RMSE (stars)" value={last[2]} decimals={3} color="#10b981" />
        <Stat icon={Layers} label="Hit rate @10" value={ours.hit_rate * 100} decimals={1} suffix="%" color="#f59e0b" />
        <Stat icon={Gauge} label="Recall @10" value={ours.recall * 100} decimals={1} suffix="%" color="#ec4899" />
      </div>
      <div className="grid g2 mt16 stagger">
        <Card title="Learning curve" sub="RMSE on observed ratings"><div style={{ height: 280 }}><ResponsiveContainer><LineChart data={M.curve.map(([e, a, b]) => ({ e, train: a, test: b }))} margin={{ left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="e" tickLine={false} axisLine={false} /><YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} /><Tooltip /><Legend />
          <Line dataKey="train" name="Train RMSE" stroke="var(--accent)" strokeWidth={2.5} dot={false} /><Line dataKey="test" name="Test RMSE" stroke="#10b981" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></div></Card>
        <Card title="Top-10 ranking quality vs baselines" sub="Held-out items the user rated ≥ 4★"><div style={{ height: 280 }}><ResponsiveContainer><BarChart data={bars} margin={{ left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="k" tickLine={false} axisLine={false} /><YAxis unit="%" tickLine={false} axisLine={false} /><Tooltip /><Legend />
          <Bar dataKey="Matrix factorisation" fill="var(--accent)" radius={[6, 6, 0, 0]} /><Bar dataKey="Popularity" fill="#f59e0b" radius={[6, 6, 0, 0]} /><Bar dataKey="Random" fill="var(--faint)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
      </div>
      <Card className="mt16 fade-up" title="How the model works">
        <div className="grid g3" style={{ gap: 12 }}>
          {[['r̂(u,i) = μ + bᵤ + bᵢ + pᵤ·qᵢ', 'Each user and item gets a bias and a 16-dimensional embedding learned by stochastic gradient descent on observed ratings.'],
            ['Fold-in for new users', 'Your ratings are turned into a taste vector instantly by solving a 16×16 ridge-regression system in the browser — no retraining needed.'],
            ['MMR diversity & similarity', 'Cosine similarity between item embeddings powers "because you liked…", and Maximal Marginal Relevance balances relevance with variety.']].map(([t, d]) => (
            <div key={t} className="tile"><b className="small mono">{t}</b><p className="small muted mt8">{d}</p></div>))}
        </div>
      </Card>
    </>
  );
}
