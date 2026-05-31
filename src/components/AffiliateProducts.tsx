import { ShoppingBag, ExternalLink, Star } from 'lucide-react';

// ⚠️ Replace these with YOUR affiliate links from:
// Amazon Associates: affiliate-program.amazon.com
// MyProtein: myprotein.com/affiliates
// Gymshark: gymshark.com/ambassadors
// Dymatize, Optimum Nutrition, etc.
const PRODUCTS = [
  {
    name: 'Adjustable Dumbbells Set',
    emoji: '🏋️',
    desc: '5-52.5 lbs adjustable pair — perfect for home gyms',
    price: '$299',
    badge: 'Best Seller',
    category: 'equipment',
    link: 'https://amzn.to/your-affiliate-link-1',
    rating: 4.8,
  },
  {
    name: 'Resistance Bands (5-Pack)',
    emoji: '🎯',
    desc: 'Light to extra heavy — great for warm-ups & rehab',
    price: '$12',
    badge: 'Budget Pick',
    category: 'equipment',
    link: 'https://amzn.to/your-affiliate-link-2',
    rating: 4.6,
  },
  {
    name: 'Whey Protein Isolate',
    emoji: '🥛',
    desc: '25g protein, <1g sugar, 2.27kg tub — all flavors',
    price: '$54',
    badge: '20% Off',
    category: 'supplement',
    link: 'https://amzn.to/your-affiliate-link-3',
    rating: 4.9,
  },
  {
    name: 'Creatine Monohydrate',
    emoji: '💪',
    desc: 'Micronized pure creatine — 5g/day for strength & size',
    price: '$22',
    badge: 'Must-Have',
    category: 'supplement',
    link: 'https://amzn.to/your-affiliate-link-4',
    rating: 4.9,
  },
  {
    name: 'Pre-Workout Energy',
    emoji: '⚡',
    desc: 'Caffeine + beta-alanine for insane pump & focus',
    price: '$35',
    badge: 'Popular',
    category: 'supplement',
    link: 'https://amzn.to/your-affiliate-link-5',
    rating: 4.5,
  },
  {
    name: 'Fitness Tracker Watch',
    emoji: '⌚',
    desc: 'Heart rate, sleep, steps — pairs with any workout',
    price: '$39',
    badge: 'Deal',
    category: 'equipment',
    link: 'https://amzn.to/your-affiliate-link-6',
    rating: 4.4,
  },
  {
    name: 'Yoga / Exercise Mat',
    emoji: '🧘',
    desc: '6mm thick non-slip — perfect for stretching & core',
    price: '$18',
    badge: null,
    category: 'equipment',
    link: 'https://amzn.to/your-affiliate-link-7',
    rating: 4.7,
  },
  {
    name: 'Protein Bars (30-Pack)',
    emoji: '🍫',
    desc: '20g protein, only 220 cal each — perfect snack on the go',
    price: '$42',
    badge: 'Value Pack',
    category: 'supplement',
    link: 'https://amzn.to/your-affiliate-link-8',
    rating: 4.3,
  },
];

interface Props {
  category?: 'all' | 'equipment' | 'supplement';
  compact?: boolean;
  maxCount?: number;
  title?: string;
}

export default function AffiliateProducts({
  category = 'all',
  compact = false,
  maxCount = 4,
  title = '🏆 Recommended Gear & Supplements',
}: Props) {
  const filtered = PRODUCTS.filter(p => category === 'all' || p.category === category);
  const shown = filtered.slice(0, maxCount);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-xs text-dark-text italic">
          Affiliate links — we may earn a commission at no extra cost to you
        </p>
      </div>

      {compact ? (
        <div className="flex gap-2 flex-wrap">
          {shown.map(product => (
            <a
              key={product.name}
              href={product.link}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark/40 border border-dark-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <span className="text-lg">{product.emoji}</span>
              <div>
                <p className="text-xs font-medium text-dark-text-light leading-tight">{product.name}</p>
                <p className="text-[10px] text-dark-text">{product.price}</p>
              </div>
              <ExternalLink className="w-3 h-3 text-dark-text group-hover:text-primary-light shrink-0" />
            </a>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {shown.map(product => (
            <a
              key={product.name}
              href={product.link}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="block p-3 rounded-xl bg-dark/40 border border-dark-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{product.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-dark-text-light group-hover:text-primary-light transition-colors">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2.5 h-2.5 ${
                            i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-dark-border'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-dark-text ml-1">{product.rating}</span>
                    </div>
                  </div>
                </div>
                {product.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary-light font-medium whitespace-nowrap">
                    {product.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-dark-text mb-2">{product.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-success">{product.price}</span>
                <span className="text-xs text-accent flex items-center gap-1 group-hover:gap-2 transition-all">
                  Shop Now <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
