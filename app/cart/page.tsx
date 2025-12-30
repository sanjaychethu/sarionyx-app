'use client'
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../utils/supabase'; // Fix path if needed

export default function CartPage() {
  const searchParams = useSearchParams();
  const designId = searchParams.get('id'); // Get ID from URL
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (designId) {
      const fetchCartItem = async () => {
        const { data, error } = await supabase
            .from('saved_designs')
            .select('*')
            .eq('id', designId)
            .single();
        
        if (data) setItem(data);
        if (error) console.error(error);
        setLoading(false);
      };
      fetchCartItem();
    }
  }, [designId]);

  if (loading) return <div className="p-10 text-center">Loading Cart...</div>;
  if (!item) return <div className="p-10 text-center">Cart is empty.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <h1 className="text-3xl font-bold p-6 border-b">Your Cart</h1>
        
        <div className="flex flex-col md:flex-row gap-8 p-6">
          {/* Product Image */}
          <div className="w-full md:w-1/3 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
             <img src={item.preview_url} alt="My Design" className="shadow-lg rounded max-h-64" />
          </div>

          {/* Product Details */}
          <div className="flex-1 flex flex-col justify-between">
             <div>
                <h2 className="text-xl font-bold mb-2">Custom Sarionyx Tee</h2>
                <p className="text-gray-500 text-sm mb-4">Size: M (Default)</p>
                <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    In Stock
                </div>
             </div>

             <div className="mt-8 pt-6 border-t flex justify-between items-center">
                <span className="text-2xl font-bold">₹599.00</span>
                <button 
                    onClick={() => alert("Proceed to Razorpay (Coming Soon!)")}
                    className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
                >
                    Checkout Now
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}