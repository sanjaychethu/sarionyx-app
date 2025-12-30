'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from './utils/supabase'; // Adjust path if needed
import { ArrowRight, ShoppingCart } from 'lucide-react';

export default function Storefront() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Inventory on Load
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white pt-16">
      
      {/* 1. HERO SECTION (The Vibe) */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-white/10">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black pointer-events-none"></div>
        
        <div className="z-10 max-w-4xl mx-auto space-y-6">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-sm font-medium tracking-wide">
                NEW SEASON DROP
            </span>
            <h1 className="font-display text-6xl md:text-9xl font-black uppercase leading-none">
                Define <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-white">Chaos.</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto">
                Premium streetwear for the digital age. Shop the collection or design your own.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button 
                  onClick={() => document.getElementById('shop-grid')?.scrollIntoView({behavior: 'smooth'})}
                  className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                >
                    Shop Collection
                </button>
                <Link href="/studio">
                    <button className="px-8 py-4 rounded-full border border-white/30 backdrop-blur-sm font-bold text-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                        Open Design Studio <ArrowRight size={20}/>
                    </button>
                </Link>
            </div>
        </div>
      </section>

      {/* 2. PRODUCT GRID */}
      <section id="shop-grid" className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex justify-between items-end mb-12">
            <h2 className="font-display text-4xl font-bold">Latest Drops</h2>
            <Link href="/all" className="text-gray-400 hover:text-white transition">View all -</Link>
        </div>

        {loading ? (
            <div className="text-center py-20 text-gray-500">Loading Drop...</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    <div key={product.id} className="group cursor-pointer">
                        {/* Image Card */}
                        <div className="relative aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden mb-4 border border-white/5">
                            <img 
                                src={product.base_image_url} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            {/* Hover Button */}
                            <button className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300">
                                <ShoppingCart size={20} />
                            </button>
                        </div>

                        {/* Text Info */}
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <div className="flex justify-between items-center mt-1">
                             <p className="text-gray-400">
                                ₹{(product.price / 100).toLocaleString()}
                             </p>
                             <span className="text-xs font-bold text-brand-yellow">PRE-ORDER</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </section>

      {/* 3. CUSTOM PROMO BANNER */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto bg-brand-yellow text-black rounded-3xl p-12 md:p-24 text-center relative overflow-hidden">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10 space-y-6">
                <h2 className="font-display text-5xl md:text-7xl font-black uppercase">
                    Not seeing <br/> what you like?
                </h2>
                <p className="text-xl max-w-2xl mx-auto font-medium opacity-80">
                    Use our fabric.js powered studio to build your own piece from scratch.
                </p>
                <Link href="/studio">
                    <button className="bg-black text-white px-10 py-5 rounded-full font-bold text-xl mt-4 hover:scale-105 transition-transform">
                        Create Your Own
                    </button>
                </Link>
            </div>
        </div>
      </section>

    </main>
  );
}