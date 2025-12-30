'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/utils/supabase';
import Navbar from '@/components/Navigation';
import { ShoppingCart, Filter } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  sale_price: number | null;
  base_image_url: string;
  is_customizable: boolean;
  stock_quantity: number;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
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

      if (productsData) setProducts(productsData);
      if (categoriesData) setCategories(categoriesData);

      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  const formatPrice = (price: number) => `₹${(price / 100).toLocaleString('en-IN')}`;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">

          {/* Header */}
          <div className="mb-12">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-4">All Products</h1>
            <p className="text-gray-400 text-lg">Browse our complete collection of premium streetwear</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-12 pb-6 border-b border-white/10">
            <div className="flex items-center gap-2 text-gray-400">
              <Filter size={20} />
              <span className="font-semibold">Filter:</span>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-brand-yellow text-black'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-brand-yellow text-black'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No products found in this category.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-400">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
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
            </>
          )}
        </div>
      </main>
    </>
  );
}
