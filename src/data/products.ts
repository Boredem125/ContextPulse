/**
 * ContextPulse — Electronics Product Catalog
 * Realistic product data for the e-commerce demo site.
 * Products span multiple categories to enable intent signal diversity.
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  specs: Record<string, string>;
  description: string;
  inStock: boolean;
  stockCount?: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
}

export const products: Product[] = [
  {
    id: 'mbp-16-m4',
    name: 'MacBook Pro 16" M4 Max',
    brand: 'Apple',
    category: 'Laptops',
    price: 3499,
    originalPrice: 3799,
    rating: 4.9,
    reviewCount: 2847,
    image: '💻',
    badge: 'Best Seller',
    specs: { Chip: 'M4 Max', RAM: '48GB Unified', Storage: '1TB SSD', Display: '16.2" Liquid Retina XDR', Battery: '22 hours' },
    description: 'The most advanced Mac laptop for demanding professional workflows.',
    inStock: true,
    stockCount: 12,
  },
  {
    id: 'sony-wh1000xm6',
    name: 'Sony WH-1000XM6',
    brand: 'Sony',
    category: 'Audio',
    price: 399,
    originalPrice: 449,
    rating: 4.8,
    reviewCount: 5621,
    image: '🎧',
    badge: 'Editor\'s Choice',
    specs: { Driver: '40mm', ANC: 'Adaptive', Battery: '40 hours', Codec: 'LDAC/aptX HD', Weight: '250g' },
    description: 'Industry-leading noise cancellation with premium audio quality.',
    inStock: true,
    stockCount: 34,
  },
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    category: 'Phones',
    price: 1199,
    rating: 4.7,
    reviewCount: 12453,
    image: '📱',
    specs: { Chip: 'A18 Pro', Camera: '48MP Quad', Display: '6.9" OLED', Storage: '256GB', Battery: 'All-day' },
    description: 'The ultimate iPhone with the most advanced camera system ever.',
    inStock: true,
    stockCount: 89,
  },
  {
    id: 'samsung-s25-ultra',
    name: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    category: 'Phones',
    price: 1299,
    originalPrice: 1399,
    rating: 4.6,
    reviewCount: 8934,
    image: '📱',
    badge: 'New',
    specs: { Chip: 'Snapdragon 8 Elite', Camera: '200MP', Display: '6.8" Dynamic AMOLED', RAM: '12GB', 'S Pen': 'Included' },
    description: 'Galaxy AI meets the most powerful Galaxy smartphone ever.',
    inStock: true,
    stockCount: 45,
  },
  {
    id: 'ipad-pro-m4',
    name: 'iPad Pro 13" M4',
    brand: 'Apple',
    category: 'Tablets',
    price: 1299,
    rating: 4.8,
    reviewCount: 3421,
    image: '📟',
    specs: { Chip: 'M4', Display: '13" Ultra Retina XDR', Storage: '256GB', 'Apple Pencil': 'Pro Support', Weight: '579g' },
    description: 'The thinnest, most powerful iPad ever. Outrageously fast.',
    inStock: true,
    stockCount: 22,
  },
  {
    id: 'dell-xps-16',
    name: 'Dell XPS 16 (2025)',
    brand: 'Dell',
    category: 'Laptops',
    price: 2199,
    originalPrice: 2499,
    rating: 4.5,
    reviewCount: 1876,
    image: '💻',
    badge: '12% Off',
    specs: { CPU: 'Intel Core Ultra 9', GPU: 'RTX 4070', RAM: '32GB', Display: '16" 4K OLED', Storage: '1TB SSD' },
    description: 'Stunning 4K OLED in a premium, near-borderless design.',
    inStock: true,
    stockCount: 8,
  },
  {
    id: 'apple-watch-ultra3',
    name: 'Apple Watch Ultra 3',
    brand: 'Apple',
    category: 'Wearables',
    price: 849,
    rating: 4.7,
    reviewCount: 4532,
    image: '⌚',
    specs: { Display: '52mm', Chip: 'S10', Battery: '72 hours', Water: '100m certified', Satellite: 'SOS & Messaging' },
    description: 'The most rugged and capable Apple Watch for extreme adventures.',
    inStock: true,
    stockCount: 19,
  },
  {
    id: 'sony-a7rv',
    name: 'Sony Alpha A7R V',
    brand: 'Sony',
    category: 'Cameras',
    price: 3899,
    rating: 4.9,
    reviewCount: 982,
    image: '📷',
    badge: 'Pro',
    specs: { Sensor: '61MP Full-Frame', AF: '693 Phase Detection', Video: '8K 24fps', ISO: '100-32000', Stabilization: '8-stop IBIS' },
    description: 'Redefining resolution with AI-powered autofocus precision.',
    inStock: true,
    stockCount: 5,
  },
  {
    id: 'lg-oled-c4',
    name: 'LG OLED evo C4 65"',
    brand: 'LG',
    category: 'Displays',
    price: 1799,
    originalPrice: 2299,
    rating: 4.8,
    reviewCount: 6712,
    image: '🖥️',
    badge: 'Save $500',
    specs: { Panel: 'OLED evo', Size: '65"', Resolution: '4K', 'Refresh Rate': '144Hz', HDR: 'Dolby Vision IQ' },
    description: 'Perfect blacks, infinite contrast, and stunning color accuracy.',
    inStock: true,
    stockCount: 14,
  },
  {
    id: 'bose-qc-earbuds3',
    name: 'Bose QuietComfort Ultra Earbuds',
    brand: 'Bose',
    category: 'Audio',
    price: 299,
    rating: 4.6,
    reviewCount: 7823,
    image: '🎵',
    specs: { ANC: 'CustomTune', Audio: 'Immersive Spatial', Battery: '6 hours', Fit: 'Stability Band', Codec: 'aptX Adaptive' },
    description: 'World-class noise cancellation with immersive spatial audio.',
    inStock: true,
    stockCount: 67,
  },
  {
    id: 'ps5-pro',
    name: 'PlayStation 5 Pro',
    brand: 'Sony',
    category: 'Gaming',
    price: 699,
    rating: 4.7,
    reviewCount: 15678,
    image: '🎮',
    badge: 'Hot',
    specs: { GPU: '16.7 TFLOPS', Storage: '2TB SSD', 'Ray Tracing': 'Enhanced', Output: '8K Support', 'PSSR': 'AI Upscaling' },
    description: 'The most powerful PlayStation ever. Enhanced ray tracing and AI upscaling.',
    inStock: true,
    stockCount: 3,
  },
  {
    id: 'dyson-zone-2',
    name: 'Dyson Zone 2',
    brand: 'Dyson',
    category: 'Audio',
    price: 549,
    originalPrice: 699,
    rating: 4.3,
    reviewCount: 1234,
    image: '🎧',
    badge: '21% Off',
    specs: { ANC: 'Advanced', Audio: 'Hi-Fi', Battery: '50 hours', Purification: 'Zone Air Purification', Weight: '325g' },
    description: 'Premium audio with integrated air purification technology.',
    inStock: true,
    stockCount: 28,
  },
];

export const reviews: Review[] = [
  {
    id: 'r1', productId: 'mbp-16-m4', author: 'Sarah K.', avatar: '👩‍💼',
    rating: 5, date: '2025-12-15', title: 'Absolute powerhouse for video editing',
    body: 'The M4 Max handles 8K ProRes without breaking a sweat. Battery life is insane — I get through a full work day without charging. The display is the best I\'ve ever used on a laptop.',
    verified: true, helpful: 342,
  },
  {
    id: 'r2', productId: 'sony-wh1000xm6', author: 'Marcus T.', avatar: '👨‍🎤',
    rating: 5, date: '2025-11-28', title: 'Best noise cancellation on the market',
    body: 'Upgraded from the XM5s and the difference is noticeable. The adaptive ANC is smarter, the sound is warmer, and they\'re even more comfortable for long sessions.',
    verified: true, helpful: 891,
  },
  {
    id: 'r3', productId: 'iphone-16-pro', author: 'Priya M.', avatar: '👩‍🔬',
    rating: 4, date: '2026-01-03', title: 'Great camera, incremental upgrade',
    body: 'The camera system is genuinely impressive. Night mode and spatial video are standout features. Coming from a 15 Pro Max though, the overall experience feels similar.',
    verified: true, helpful: 1204,
  },
  {
    id: 'r4', productId: 'dell-xps-16', author: 'James L.', avatar: '👨‍💻',
    rating: 5, date: '2025-10-20', title: 'The OLED display is breathtaking',
    body: 'Finally a Windows laptop that rivals the MacBook in build quality. The 4K OLED is stunning for photo editing. RTX 4070 handles everything I throw at it.',
    verified: true, helpful: 456,
  },
  {
    id: 'r5', productId: 'lg-oled-c4', author: 'Alex R.', avatar: '👨‍🎨',
    rating: 5, date: '2026-02-14', title: 'Cinema experience at home',
    body: 'The perfect blacks and infinite contrast make everything look incredible. Gaming at 144Hz is butter smooth. Best TV purchase I\'ve ever made at this price point.',
    verified: true, helpful: 2103,
  },
  {
    id: 'r6', productId: 'ps5-pro', author: 'Kim N.', avatar: '🧑‍🎮',
    rating: 4, date: '2026-01-22', title: 'Noticeable upgrade for 4K gaming',
    body: 'Ray tracing performance is significantly better. PSSR AI upscaling makes 60fps modes look almost as good as native 4K. Worth it if you have a 4K 120Hz display.',
    verified: true, helpful: 3456,
  },
  {
    id: 'r7', productId: 'sony-a7rv', author: 'Chen W.', avatar: '📸',
    rating: 5, date: '2025-09-15', title: 'The resolution king',
    body: '61 megapixels of pure detail. The AI autofocus tracks subjects like magic — even birds in flight at 10fps. IBIS is incredibly effective. Worth every penny for serious photographers.',
    verified: true, helpful: 178,
  },
  {
    id: 'r8', productId: 'apple-watch-ultra3', author: 'David M.', avatar: '🏔️',
    rating: 5, date: '2026-03-01', title: 'Essential for outdoor adventures',
    body: '72-hour battery life is a game changer for multi-day hikes. The satellite SOS gave me peace of mind on a remote trail. The brightest display I\'ve ever seen on a watch.',
    verified: true, helpful: 892,
  },
];

/** Get products by category */
export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}

/** Get product by ID */
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

/** Get reviews for a product */
export function getReviewsForProduct(productId: string): Review[] {
  return reviews.filter(r => r.productId === productId);
}

/** Get unique categories */
export function getCategories(): string[] {
  return [...new Set(products.map(p => p.category))];
}
