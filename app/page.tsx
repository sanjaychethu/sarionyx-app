'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from './utils/supabase';
import { ArrowRight, ShoppingCart, Sparkles, TrendingUp, Palette } from 'lucide-react';
import Navbar from '@/components/Navigation';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  sale_price: number | null;
  base_image_url: string;
  is_featured: boolean;
  is_customizable: boolean;
  stock_quantity: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (productsData) {
        setProducts(productsData);
        setFeaturedProducts(productsData.filter(p => p.is_featured));
      }
      if (categoriesData) setCategories(categoriesData);

      setLoading(false);
    }
    fetchData();
  }, []);

  const formatPrice = (price: number) => `₹${(price / 100).toLocaleString('en-IN')}`;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white">

        {/* HERO SECTION */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden border-b border-white/10">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-black"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Sparkles size={16} className="text-brand-yellow" />
              <span className="text-sm font-medium tracking-wide">NEW COLLECTION OUT NOW</span>
            </div>

            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tight">
              Sarionyx
              <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-white to-brand-yellow">
                Streetwear
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
              Premium t-shirts designed for those who dare to stand out.
              <br className="hidden md:block" />
              Shop curated collections or create your own masterpiece.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                onClick={() => document.getElementById('featured')?.scrollIntoView({behavior: 'smooth'})}
                className="group bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-white/20 flex items-center justify-center gap-2"
              >
                Explore Collection
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <Link href="/studio">
                <button className="px-10 py-5 rounded-full border-2 border-white/30 backdrop-blur-sm font-bold text-lg hover:bg-white/10 hover:border-brand-yellow transition-all duration-300 flex items-center justify-center gap-2">
                  <Palette size={20} />
                  Design Your Own
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-brand-yellow">{products.length}+</div>
                <div className="text-sm text-gray-500 mt-1">Designs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-yellow">100%</div>
                <div className="text-sm text-gray-500 mt-1">Premium Cotton</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-yellow">24h</div>
                <div className="text-sm text-gray-500 mt-1">Fast Shipping</div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES SHOWCASE */}
        {categories.length > 0 && (
          <section className="py-24 px-4 bg-gradient-to-b from-black to-gray-950">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">Shop by Style</h2>
                <p className="text-gray-400 text-lg">Find your vibe from our curated collections</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Link href={`/category/${category.slug}`} key={category.id}>
                    <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer">
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="font-bold text-2xl mb-2">{category.name}</h3>
                        <p className="text-gray-300 text-sm">{category.description}</p>
                      </div>
                      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FEATURED PRODUCTS */}
        <section id="featured" className="py-24 px-4 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
              <div>
                <div className="flex items-center gap-2 text-brand-yellow mb-3">
                  <TrendingUp size={24} />
                  <span className="font-semibold text-sm tracking-wider uppercase">Trending Now</span>
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-bold">Featured Collection</h2>
              </div>
              <Link href="/shop" className="text-gray-400 hover:text-white transition-colors hidden md:block">
                View All Products →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="text-gray-500 mt-4">Loading collection...</p>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>No featured products available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <Link href={`/product/${product.slug}`} key={product.id}>
                    <div className="group cursor-pointer">
                      <div className="relative aspect-[4/5] bg-gray-900 rounded-2xl overflow-hidden mb-4 border border-white/5">
                        <img
                          src={product.base_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {product.is_customizable && (
                            <span className="bg-brand-yellow text-black px-3 py-1 rounded-full text-xs font-bold">
                              Customizable
                            </span>
                          )}
                          {product.sale_price && (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              Sale
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            alert('Quick add coming soon!');
                          }}
                          className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
                        >
                          <ShoppingCart size={20} />
                        </button>

                        {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                          <div className="absolute bottom-4 left-4 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                            Only {product.stock_quantity} left
                          </div>
                        )}
                        {product.stock_quantity === 0 && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-white font-bold text-lg">OUT OF STOCK</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-bold text-lg group-hover:text-brand-yellow transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
                        <div className="flex items-center gap-3">
                          {product.sale_price ? (
                            <>
                              <span className="text-lg font-bold text-brand-yellow">
                                {formatPrice(product.sale_price)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.base_price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold">
                              {formatPrice(product.base_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CUSTOM DESIGN CTA */}
        <section className="py-32 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 via-transparent to-brand-yellow/5"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="bg-brand-yellow rounded-3xl p-12 md:p-20 text-black text-center shadow-2xl">
              <Palette size={64} className="mx-auto mb-8 opacity-80" />

              <h2 className="font-display text-5xl md:text-7xl font-black uppercase mb-6 leading-tight">
                Unleash Your
                <br />
                Creativity
              </h2>

              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 font-medium leading-relaxed opacity-90">
                Can't find exactly what you're looking for? Use our powerful design studio
                to create a completely unique t-shirt. Add text, upload graphics, and bring your vision to life.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/studio">
                  <button className="bg-black text-white px-12 py-6 rounded-full font-bold text-xl hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-black/50 flex items-center justify-center gap-3">
                    Start Designing
                    <ArrowRight size={24} />
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t-2 border-black/20 max-w-2xl mx-auto">
                <div>
                  <div className="text-4xl font-black mb-2">∞</div>
                  <div className="text-sm font-semibold opacity-80">Design Options</div>
                </div>
                <div>
                  <div className="text-4xl font-black mb-2">100%</div>
                  <div className="text-sm font-semibold opacity-80">Your Style</div>
                </div>
                <div>
                  <div className="text-4xl font-black mb-2">2min</div>
                  <div className="text-sm font-semibold opacity-80">To Create</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 py-16 px-4 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <h3 className="font-display text-3xl font-bold mb-4">SARIONYX</h3>
                <p className="text-gray-400 max-w-md">
                  Premium streetwear brand bringing you unique designs and unlimited customization options.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Shop</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/shop" className="hover:text-white transition">All Products</Link></li>
                  <li><Link href="/studio" className="hover:text-white transition">Custom Studio</Link></li>
                  <li><Link href="/category/limited-edition" className="hover:text-white transition">Limited Edition</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
                  <li><Link href="/shipping" className="hover:text-white transition">Shipping Info</Link></li>
                  <li><Link href="/returns" className="hover:text-white transition">Returns</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
              <p>&copy; 2024 Sarionyx. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
