'use client'
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../utils/supabase';
import Navbar from '@/components/Navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface CartItem {
  id: number;
  preview_url: string;
  product_id: number;
  created_at: string;
}

function CartContent() {
  const searchParams = useSearchParams();
  const designId = searchParams.get('id');

  const [item, setItem] = useState<CartItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  const CUSTOM_PRICE = 59900;
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    if (designId) {
      const fetchCartItem = async () => {
        const { data, error } = await supabase
            .from('saved_designs')
            .select('*')
            .eq('id', designId)
            .maybeSingle();

        if (data) setItem(data);
        if (error) console.error(error);
        setLoading(false);
      };
      fetchCartItem();
    } else {
      setLoading(false);
    }
  }, [designId]);

  const formatPrice = (price: number) => `₹${(price / 100).toLocaleString('en-IN')}`;
  const subtotal = CUSTOM_PRICE * quantity;
  const shipping = subtotal > 99900 ? 0 : 5000;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading cart...</p>
          </div>
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Your Cart is Empty</h1>
            <p className="text-gray-400">Add some products to get started!</p>
            <Link href="/">
              <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition">
                Continue Shopping
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

      <main className="min-h-screen bg-black text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">

          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8">
            <ArrowLeft size={20} />
            <span>Continue Shopping</span>
          </Link>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-12">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
                <div className="flex flex-col md:flex-row gap-6">

                  {/* Product Image */}
                  <div className="w-full md:w-48 aspect-square bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.preview_url}
                      alt="Custom Design"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold mb-1">Custom Designed Tee</h3>
                        <p className="text-gray-400 text-sm">Your unique design</p>
                        <div className="inline-block bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-medium mt-2">
                          In Stock
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Remove this item from cart?')) {
                            setItem(null);
                          }
                        }}
                        className="text-gray-400 hover:text-red-400 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Size Selector */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-400">Size</label>
                      <div className="flex gap-2">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 rounded-lg border transition-all ${
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

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">Quantity</label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-lg border border-white/20 hover:border-white/40 font-bold transition"
                          >
                            -
                          </button>
                          <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 rounded-lg border border-white/20 hover:border-white/40 font-bold transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">Item Price</div>
                        <div className="text-2xl font-bold">{formatPrice(CUSTOM_PRICE)}</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Continue Shopping CTA */}
              <Link href="/shop">
                <button className="w-full py-4 border-2 border-white/20 rounded-xl font-medium hover:bg-white/5 transition">
                  Add More Items
                </button>
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-2xl p-6 border border-white/5 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className="text-white font-medium">
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-500">
                      Add {formatPrice(99900 - subtotal)} more for free shipping
                    </p>
                  )}
                  <div className="border-t border-white/10 pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-brand-yellow">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => alert('Checkout with Razorpay coming soon!')}
                  className="w-full bg-white text-black py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-6 space-y-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>100% Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Easy Returns within 7 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Premium Quality Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </>
    }>
      <CartContent />
    </Suspense>
  );
}
