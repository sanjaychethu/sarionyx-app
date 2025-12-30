'use client'
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <Link href="/" className="font-display font-bold text-2xl tracking-tighter">
            SARIONYX
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-brand-yellow transition">Shop</Link>
            <Link href="/studio" className="hover:text-brand-yellow transition">Custom Studio</Link>
            <Link href="/about" className="hover:text-brand-yellow transition">About</Link>
            <div className="h-6 w-px bg-white/20"></div>
            <Link href="/cart" className="flex items-center gap-2 hover:text-brand-yellow transition">
              <ShoppingBag size={20} />
              <span>Cart</span>
            </Link>
          </div>

          {/* MOBILE MENU BTN */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-black border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md hover:bg-white/10">Shop</Link>
            <Link href="/studio" className="block px-3 py-2 rounded-md hover:bg-white/10">Custom Studio</Link>
            <Link href="/cart" className="block px-3 py-2 rounded-md hover:bg-white/10">Cart</Link>
          </div>
        </div>
      )}
    </nav>
  );
}