'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/utils/supabase';
import Navbar from '@/components/Navigation';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

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
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (categoryData) {
        setCategory(categoryData);

        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (productsData) setProducts(productsData);
      }

      setLoading(false);
    }

    fetchData();
  }, [slug]);

  const formatPrice = (price: number) => `₹${(price / 100).toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading category...</p>
          </div>
        </div>
      </>
    );
  }

  if (!category) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Category Not Found</h1>
            <p className="text-gray-400">This category doesn't exist.</p>
            <Link href="/">
              <button className="bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white">

        {/* Category Hero */}
        <section className="relative h-[50vh] flex items-end overflow-hidden border-b border-white/10">
          <img
            src={category.image_url}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12 w-full">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition mb-6">
              <ArrowLeft size={20} />
              <span>Back to Shop</span>
            </Link>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-4">{category.name}</h1>
            <p className="text-gray-300 text-xl max-w-2xl">{category.description}</p>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">

            {products.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>No products available in this category yet.</p>
              </div>
            ) : (
              <>
                <div className="mb-8 text-gray-400">
                  {products.length} {products.length === 1 ? 'product' : 'products'} in this collection
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products.map((product) => (
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
        </section>

      </main>
    </>
  );
}
