import { ShoppingBag, Store, Sparkles, Users, Map, Brain, ShoppingCart, Wand2, Star, Layers, Bell, Gift } from 'lucide-react';
import createApp from './core/createApp.jsx';
import { ShopProvider } from './lib/rec.jsx';
import './lib/shop.css';
import Shop from './pages/Shop.jsx';
import ForYou from './pages/ForYou.jsx';
import Personas from './pages/Personas.jsx';
import EmbedMap from './pages/EmbedMap.jsx';
import Lab from './pages/Lab.jsx';
import Cart from './pages/Cart.jsx';

export default createApp({
  name: 'ShopSense',
  storageKey: 'shopsense',
  logo: ShoppingBag,
  accent: ['#ec4899', '#8b5cf6'],
  defaultTheme: 'light',
  github: 'https://github.com/PreciousBharath/SHOPSENSE-AI-PRODUCT-RECOMMENDER',
  stack: 'Matrix factorisation · embeddings',
  Provider: ShopProvider,
  heroTitle: 'A store that learns what you love — one star at a time.',
  heroText: 'A latent-factor recommender trained on 13k ratings turns every rating you give into a 16-dimensional taste vector and re-ranks 120 products instantly.',
  heroFeatures: [
    [Wand2, 'Live personalisation', 'Ratings fold into the model in milliseconds'],
    [Layers, 'Learned embeddings', 'Explore products on a 2-D PCA map'],
    [Star, '5.3× better than popularity', 'Precision@10 vs a popularity baseline'],
  ],
  heroStats: [['120', 'products'], ['16-D', 'embeddings'], ['80%', 'hit rate @10']],
  registerText: 'Create an account to save your taste profile',
  roles: ['Shopper', 'Student', 'Data scientist', 'Merchant', 'Marketer'],
  demo: { name: 'Bharath Kumar', email: 'demo@shopsense.app', password: 'Demo@1234', role: 'Shopper' },
  promo: ['🎁 Festive picks', 'Rate 5 products to unlock a personalised gift list.'],
  notifications: [[Sparkles, 'New picks for you', 'Based on your last ratings'], [Gift, 'Price drop on your wishlist', 'AeroBook 14 Laptop'], [Bell, 'Back in stock', 'BassPro ANC Headphones']],
  nav: [
    { section: 'Shop', items: [
      { to: '/', label: 'Store', icon: Store, page: Shop },
      { to: '/foryou', label: 'For you', icon: Sparkles, page: ForYou, tag: 'AI' },
      { to: '/cart', label: 'Cart & wishlist', icon: ShoppingCart, page: Cart },
    ] },
    { section: 'Model', items: [
      { to: '/personas', label: 'Personas', icon: Users, page: Personas },
      { to: '/map', label: 'Embedding map', icon: Map, page: EmbedMap },
      { to: '/model', label: 'Model lab', icon: Brain, page: Lab },
    ] },
  ],
});
