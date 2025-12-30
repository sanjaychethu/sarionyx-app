'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/utils/supabase';
import Navbar from '@/components/Navigation';
import { ShoppingCart, ArrowLeft, Palette, Check } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  sale_price: number | null;
  base_image_url: string;
  additional_images: string[];
  sizes_available: string[];
  colors_available: Array<{ name: string; hex: string }>;
  stock_quantity: number;
  is_customizable: boolean;
  sku: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        setProduct(data);
        if (data.sizes_available?.length > 0) {
          setSelectedSize(data.sizes_available[0]);
        }
        if (data.colors_available?.length > 0) {
          setSelectedColor(data.colors_available[0].name);
        }
      }

      setLoading(false);
    }

    fetchProduct();
  }, [slug]);

  const formatPrice = (price: number) => `₹${(price / 100).toLocaleString('en-IN')}`;

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);

    setTimeout(() => {
      setAddingToCart(false);
      alert(`Added ${product.name} to cart!\n\nSize: ${selectedSize}\nQuantity: ${quantity}\n\nFull cart functionality coming soon.`);
    }, 500);
  };

  const handleCustomize = () => {
    router.push('/studio');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Product Not Found</h1>
            <p className="text-gray-400">The product you're looking for doesn't exist.</p>
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

  const currentPrice = product.sale_price || product.base_price;
  const savings = product.sale_price ? product.base_price - product.sale_price : 0;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">

          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8">
            <ArrowLeft size={20} />
            <span>Back to Shop</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-white/5">
                <img
                  src={product.base_image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Gallery (if additional images exist) */}
              {product.additional_images && product.additional_images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="aspect-square bg-gray-900 rounded-xl overflow-hidden border-2 border-brand-yellow">
                    <img src={product.base_image_url} alt="Main" className="w-full h-full object-cover" />
                  </div>
                  {product.additional_images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-gray-900 rounded-xl overflow-hidden border border-white/5 cursor-pointer hover:border-white/30 transition">
                      <img src={img} alt={`View ${idx + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-8">

              {/* Title & SKU */}
              <div>
                {product.is_customizable && (
                  <div className="inline-flex items-center gap-2 bg-brand-yellow/10 text-brand-yellow px-3 py-1 rounded-full text-sm font-bold mb-4">
                    <Palette size={16} />
                    Customizable Design
                  </div>
                )}
                <h1 className="font-display text-4xl md:text-6xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-500 text-sm">SKU: {product.sku}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold">
                  {formatPrice(currentPrice)}
                </span>
                {product.sale_price && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
                      {formatPrice(product.base_price)}
                    </span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Save {formatPrice(savings)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-300 text-lg leading-relaxed">{product.description}</p>

              {/* Stock Status */}
              <div>
                {product.stock_quantity > 0 ? (
                  <div className="inline-flex items-center gap-2 text-green-400">
                    <Check size={20} />
                    <span className="font-medium">
                      {product.stock_quantity < 10 ? `Only ${product.stock_quantity} left in stock` : 'In Stock'}
                    </span>
                  </div>
                ) : (
                  <div className="text-red-400 font-medium">Out of Stock</div>
                )}
              </div>

              {/* Size Selector */}
              {product.sizes_available && product.sizes_available.length > 0 && (
                <div>
                  <label className="block text-sm font-bold mb-3 uppercase tracking-wider">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes_available.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-lg font-bold border-2 transition-all ${
                          selectedSize === size
                            ? 'border-brand-yellow bg-brand-yellow/10 text-brand-yellow'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors_available && product.colors_available.length > 0 && (
                <div>
                  <label className="block text-sm font-bold mb-3 uppercase tracking-wider">
                    Select Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.colors_available.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedColor === color.name
                            ? 'border-brand-yellow bg-brand-yellow/10'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white/30"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <span className="font-medium">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold mb-3 uppercase tracking-wider">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-lg border-2 border-white/20 hover:border-white/40 font-bold text-xl transition"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="w-12 h-12 rounded-lg border-2 border-white/20 hover:border-white/40 font-bold text-xl transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 || addingToCart}
                  className="w-full bg-white text-black py-5 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  {addingToCart ? (
                    'Adding...'
                  ) : (
                    <>
                      <ShoppingCart size={24} />
                      Add to Cart
                    </>
                  )}
                </button>

                {product.is_customizable && (
                  <button
                    onClick={handleCustomize}
                    className="w-full border-2 border-brand-yellow text-brand-yellow py-5 rounded-full font-bold text-lg hover:bg-brand-yellow hover:text-black transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <Palette size={24} />
                    Customize This Design
                  </button>
                )}
              </div>

              {/* Product Features */}
              <div className="border-t border-white/10 pt-8 space-y-4">
                <h3 className="font-bold text-lg uppercase tracking-wider">Product Details</h3>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-3">
                    <Check size={20} className="text-brand-yellow flex-shrink-0 mt-0.5" />
                    <span>100% Premium Cotton</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={20} className="text-brand-yellow flex-shrink-0 mt-0.5" />
                    <span>Screen Printed Graphics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={20} className="text-brand-yellow flex-shrink-0 mt-0.5" />
                    <span>Machine Washable</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={20} className="text-brand-yellow flex-shrink-0 mt-0.5" />
                    <span>Free Shipping on orders above ₹999</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
