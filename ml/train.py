"""
ShopSense — recommender training
--------------------------------
Generates a product catalogue + user–item rating matrix with hidden tastes, trains a
latent-factor (matrix factorisation with biases) model by SGD, evaluates RMSE and top-K
ranking metrics against popularity & random baselines, and exports item/user embeddings
to ../src/model/model.json.

    pip install -r requirements.txt && python train.py
"""
import json
import numpy as np

rng = np.random.default_rng(7)
CATS = {
    'Electronics': ['📱', '🎧', '⌚', '💻', '📷', '🔊', '🖱️', '🎮', '🔋', '📺'],
    'Fashion': ['👟', '👕', '👗', '🧥', '👜', '🕶️', '🧢', '👖', '🥿', '⌚'],
    'Books': ['📘', '📗', '📕', '📙', '📓', '📚', '📔', '📒', '📖', '🗞️'],
    'Home & Kitchen': ['☕', '🍳', '🛋️', '🪴', '🕯️', '🧺', '🍽️', '🫖', '🧹', '🛏️'],
    'Sports & Fitness': ['🏏', '⚽', '🏸', '🧘', '🏋️', '🚴', '🥾', '🏓', '🎽', '🥊'],
    'Beauty': ['💄', '🧴', '🪮', '💅', '🧼', '🌸', '🪒', '🧖', '💆', '🫧'],
}
NAMES = {
    'Electronics': ['Nova X5 Smartphone', 'BassPro ANC Headphones', 'Pulse Fit Smartwatch', 'AeroBook 14 Laptop', 'SnapLite Mirrorless Camera', 'BoomCube Bluetooth Speaker', 'GlideX Wireless Mouse', 'Arcade Pro Gamepad', 'PowerVault 20000mAh', 'Vista 43" 4K TV',
                    'Buds Air TWS Earbuds', 'StreamStick 4K', 'TypeFlow Mech Keyboard', 'HomeHub Smart Display', 'ChargeDock 3-in-1', 'SkyDrone Mini', 'SoundBar 2.1', 'WebCam HD Pro', 'E-Reader Paper 7', 'SmartBulb Pack of 4'],
    'Fashion': ['CloudStride Running Shoes', 'Organic Cotton Tee', 'Floral Maxi Dress', 'Puffer Winter Jacket', 'Vegan Leather Tote', 'Polarised Aviators', 'Classic Baseball Cap', 'Slim Fit Denim', 'Kolhapuri Flats', 'Minimalist Analog Watch',
                'Linen Kurta', 'Silk Saree', 'Chino Shorts', 'Hoodie Oversized', 'Canvas Sneakers', 'Formal Oxford Shoes', 'Handloom Dupatta', 'Track Pants', 'Leather Belt', 'Wool Scarf'],
    'Books': ['Atomic Habits-style Guide', 'Python Crash Course', 'The Monsoon Mysteries', 'Deep Learning Illustrated', 'Ponniyin Selvan Retold', 'Startup Playbook India', 'Mindful Mornings', 'Data Science from Scratch', 'Chennai Noir', 'History of the Chola Empire',
              'Clean Code Handbook', 'The Art of Investing', 'Poems of the Western Ghats', 'System Design Interview', 'Cooking with Grandma', 'Thinking in Bets-style', 'Kids Science Encyclopedia', 'Sapiens-style History', 'Marketing in the AI Era', 'Yoga Sutras Explained'],
    'Home & Kitchen': ['Filter Coffee Maker', 'Cast Iron Dosa Tawa', '3-Seater Fabric Sofa', 'Snake Plant in Ceramic Pot', 'Aroma Soy Candles', 'Bamboo Laundry Basket', 'Stoneware Dinner Set', 'Brass Tea Kettle', 'Cordless Stick Vacuum', 'Cotton Bedsheet King',
                       'Air Fryer 4L', 'Mixer Grinder 750W', 'Wall Clock Teak', 'Storage Jar Set', 'Blackout Curtains', 'Induction Cooktop', 'Memory Foam Pillow', 'Copper Water Bottle', 'Spice Box Masala Dabba', 'LED Desk Lamp'],
    'Sports & Fitness': ['English Willow Cricket Bat', 'Pro Football Size 5', 'Carbon Badminton Racket', 'Anti-slip Yoga Mat', 'Adjustable Dumbbells', 'Hybrid Cycle 21-Speed', 'Trekking Boots', 'Table Tennis Set', 'Dri-Fit Running Vest', 'Boxing Gloves 12oz',
                         'Resistance Band Set', 'Skipping Rope Speed', 'Foam Roller', 'Sports Water Bottle', 'Cricket Helmet', 'Swimming Goggles', 'Fitness Tracker Band', 'Gym Duffel Bag', 'Kettlebell 12kg', 'Pull-up Bar'],
    'Beauty': ['Matte Lipstick Set', 'Vitamin C Serum', 'Wooden Neem Comb', 'Gel Nail Kit', 'Ayurvedic Soap Trio', 'Rose Water Toner', 'Precision Trimmer', 'Sheet Mask Pack', 'Kumkumadi Face Oil', 'Hyaluronic Moisturiser',
               'Sunscreen SPF 50', 'Charcoal Face Wash', 'Hair Growth Oil', 'Kajal Smudge-proof', 'Beard Grooming Kit', 'Perfume Oud 50ml', 'Lip Balm Trio', 'Hair Dryer Ionic', 'Body Lotion Shea', 'Makeup Brush Set'],
}
PRICE = {'Electronics': (899, 64999), 'Fashion': (299, 7999), 'Books': (199, 1499), 'Home & Kitchen': (249, 34999), 'Sports & Fitness': (199, 18999), 'Beauty': (149, 3999)}
items = []
for c, names in NAMES.items():
    lo, hi = PRICE[c]
    for j, n in enumerate(names):
        price = float(np.exp(rng.uniform(np.log(lo), np.log(hi))))
        items.append(dict(id=len(items), name=n, cat=c, emoji=CATS[c][j % 10], price=int(round(price, -1) - 1), quality=float(rng.normal(0, 1)), style=float(rng.normal(0, 1))))
I = len(items); C = list(CATS)
cat_idx = np.array([C.index(it['cat']) for it in items]); logp = np.log([it['price'] for it in items]); qual = np.array([it['quality'] for it in items]); sty = np.array([it['style'] for it in items])

PERSONAS = ['Tech enthusiast', 'Fashionista', 'Bookworm', 'Home chef', 'Fitness freak', 'Beauty guru', 'Budget student', 'Premium buyer', 'New parent', 'Gamer']
U = 500
aff = rng.dirichlet(np.ones(len(C)) * 0.35, U)                        # category affinities
for u in range(U):                                                    # persona archetypes for the first users
    k = u % len(PERSONAS)
    if k < 6: aff[u] = 0.08 * aff[u] + np.eye(len(C))[k] * 0.92
budget = rng.normal(0, 1, U); budget[[u for u in range(U) if u % 10 == 6]] = -2; budget[[u for u in range(U) if u % 10 == 7]] = 2
taste_style = rng.normal(0, 1, U)
true = (3.1 + 2.6 * (aff[:, cat_idx] * len(C) - 1).clip(-1, 2.2) / 2.2 + 0.45 * qual[None, :]
        - 0.35 * (logp[None, :] - logp.mean()) * (-budget[:, None]).clip(-1, 2) * 0.6 + 0.3 * taste_style[:, None] * sty[None, :])
obs = []
for u in range(U):
    p = np.exp(1.6 * aff[u, cat_idx]); p /= p.sum()
    n = rng.integers(14, 40)
    for i in rng.choice(I, n, replace=False, p=p):
        obs.append((u, int(i), float(np.clip(np.round(true[u, i] + rng.normal(0, 0.45)), 1, 5))))
obs = np.array(obs); rng.shuffle(obs)
nte = int(len(obs) * 0.15); te, tr = obs[:nte], obs[nte:]
print('ratings', len(obs), 'density', round(len(obs) / (U * I), 3))

# ---------------- matrix factorisation with biases (SGD)
K, lr, reg, EPOCHS = 16, 0.012, 0.045, 60
mu = tr[:, 2].mean(); P = rng.normal(0, 0.1, (U, K)); Q = rng.normal(0, 0.1, (I, K)); bu = np.zeros(U); bi = np.zeros(I)
def rmse(data): u, i, r = data[:, 0].astype(int), data[:, 1].astype(int), data[:, 2]; return float(np.sqrt(np.mean((mu + bu[u] + bi[i] + (P[u] * Q[i]).sum(1) - r) ** 2)))
curve = []
for ep in range(EPOCHS):
    for u, i, r in tr[rng.permutation(len(tr))]:
        u, i = int(u), int(i); e = r - (mu + bu[u] + bi[i] + P[u] @ Q[i])
        bu[u] += lr * (e - reg * bu[u]); bi[i] += lr * (e - reg * bi[i])
        pu = P[u].copy(); P[u] += lr * (e * Q[i] - reg * P[u]); Q[i] += lr * (e * pu - reg * Q[i])
    curve.append([ep + 1, round(rmse(tr), 4), round(rmse(te), 4)])
print('final rmse train/test', curve[-1])

# ---------------- ranking evaluation: hide test items rated >= 4, rank all unseen items
seen = {}
for u, i, r in tr: seen.setdefault(int(u), set()).add(int(i))
rel = {}
for u, i, r in te:
    if r >= 4: rel.setdefault(int(u), set()).add(int(i))
pop = np.bincount(tr[:, 1].astype(int), weights=(tr[:, 2] >= 4), minlength=I)
def evaluate(score_fn, k=10):
    precs, recs, hits, rec_items = [], [], [], set()
    for u, R in rel.items():
        s = score_fn(u).copy(); s[list(seen.get(u, []))] = -1e9; top = np.argsort(-s)[:k]; rec_items.update(top.tolist())
        h = len(set(top.tolist()) & R); precs.append(h / k); recs.append(h / len(R)); hits.append(h > 0)
    return dict(precision=float(np.mean(precs)), recall=float(np.mean(recs)), hit_rate=float(np.mean(hits)), coverage=len(rec_items) / I)
res = {'Matrix factorisation (ours)': evaluate(lambda u: mu + bu[u] + bi + Q @ P[u]),
       'Popularity': evaluate(lambda u: pop.astype(float)),
       'Random': evaluate(lambda u: rng.random(I))}
for k, v in res.items(): print(k, {a: round(b, 3) for a, b in v.items()})

# PCA of item embeddings for the map
Qc = Q - Q.mean(0); _, _, Vt = np.linalg.svd(Qc, full_matrices=False); xy = Qc @ Vt[:2].T
r = lambda a, n=4: [r(v, n) for v in a] if isinstance(a, (list, np.ndarray)) else round(float(a), n)
users = []
for u in range(60):
    hist = sorted([(int(i), float(rt)) for uu, i, rt in obs if int(uu) == u], key=lambda x: -x[1])
    users.append(dict(id=u, persona=PERSONAS[u % 10], p=r(P[u]), bu=round(float(bu[u]), 4), hist=hist[:25]))
out = dict(K=K, mu=round(float(mu), 4), lambda_=reg, cats=C, items=[dict(id=it['id'], name=it['name'], cat=it['cat'], emoji=it['emoji'], price=it['price'],
            q=r(Q[it['id']]), b=round(float(bi[it['id']]), 4), xy=r(xy[it['id']], 3), pop=int(pop[it['id']]),
            rating=round(float(np.mean([x[2] for x in obs if int(x[1]) == it['id']] or [3.5])), 2), n=int(sum(1 for x in obs if int(x[1]) == it['id']))) for it in items],
           users=users, curve=curve, ranking=res, stats=dict(users=U, items=I, ratings=int(len(obs)), density=round(len(obs) / (U * I), 4), test=int(nte)), V=r(Vt[:2]), Qmean=r(Q.mean(0)))
json.dump(out, open('../src/model/model.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print('exported', round(len(json.dumps(out, ensure_ascii=False)) / 1024, 1), 'KB')
