/*
  # Create Complete E-Commerce Database Schema for Sarionyx

  ## Overview
  This migration sets up a complete e-commerce system for selling t-shirts,
  including both regular products and custom-designed products.

  ## 1. New Tables
  
  ### Categories Table
    - `id` (bigserial, primary key)
    - `name` (text, unique) - Category name like "Graphic Tees", "Plain Tees"
    - `slug` (text, unique) - URL-friendly version
    - `description` (text) - Category description
    - `image_url` (text) - Category banner image
    - `created_at` (timestamptz) - When category was created
  
  ### Products Table (Enhanced)
    - `id` (bigserial, primary key)
    - `name` (text) - Product name
    - `slug` (text, unique) - URL-friendly product name
    - `description` (text) - Full product description
    - `category_id` (bigint) - Foreign key to categories
    - `base_price` (integer) - Price in paise (₹599 = 59900)
    - `sale_price` (integer, nullable) - Discounted price if on sale
    - `base_image_url` (text) - Main product image
    - `additional_images` (jsonb) - Array of additional product images
    - `sizes_available` (jsonb) - Available sizes: ["S", "M", "L", "XL"]
    - `colors_available` (jsonb) - Available colors with hex codes
    - `stock_quantity` (integer) - Total stock available
    - `is_featured` (boolean) - Show on homepage
    - `is_customizable` (boolean) - Can be customized in studio
    - `is_active` (boolean) - Is product live
    - `sku` (text, unique) - Stock Keeping Unit
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  ### Customers Table
    - `id` (uuid, primary key)
    - `email` (text, unique)
    - `full_name` (text)
    - `phone` (text)
    - `shipping_address` (jsonb) - JSON with address fields
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  ### Cart Items Table
    - `id` (bigserial, primary key)
    - `customer_id` (uuid) - Foreign key to customers
    - `product_id` (bigint) - Foreign key to products
    - `saved_design_id` (bigint, nullable) - Foreign key to saved_designs (for custom)
    - `quantity` (integer) - Number of items
    - `selected_size` (text) - Chosen size
    - `selected_color` (text) - Chosen color
    - `price_at_addition` (integer) - Price when added to cart
    - `created_at` (timestamptz)
  
  ### Orders Table
    - `id` (bigserial, primary key)
    - `order_number` (text, unique) - Human-readable order ID
    - `customer_id` (uuid) - Foreign key to customers
    - `status` (text) - pending, processing, shipped, delivered, cancelled
    - `subtotal` (integer) - Total before tax/shipping
    - `shipping_cost` (integer) - Shipping charges
    - `tax` (integer) - Tax amount
    - `total` (integer) - Final total
    - `shipping_address` (jsonb) - Delivery address
    - `payment_method` (text) - razorpay, cod, etc.
    - `payment_status` (text) - pending, paid, failed
    - `payment_id` (text) - Razorpay payment ID
    - `tracking_number` (text, nullable) - Shipping tracking
    - `notes` (text) - Order notes
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  ### Order Items Table
    - `id` (bigserial, primary key)
    - `order_id` (bigint) - Foreign key to orders
    - `product_id` (bigint) - Foreign key to products
    - `saved_design_id` (bigint, nullable) - Foreign key to saved_designs
    - `quantity` (integer)
    - `size` (text)
    - `color` (text)
    - `unit_price` (integer) - Price per item at time of order
    - `total_price` (integer) - quantity * unit_price
    - `created_at` (timestamptz)
  
  ### Saved Designs Table (Updated)
    - `id` (bigserial, primary key)
    - `customer_id` (uuid, nullable) - Owner of design
    - `product_id` (bigint) - Base product used
    - `preview_url` (text) - Public URL of design preview
    - `design_data` (jsonb) - Fabric.js JSON for re-editing
    - `created_at` (timestamptz)

  ## 2. Security (Row Level Security)
    - Enable RLS on all tables
    - Public can read active products and categories
    - Authenticated users can manage their cart, orders, and designs
    - Customers can only access their own data

  ## 3. Indexes
    - Product slug for fast lookups
    - Category relationships
    - Order customer lookups
    - Cart customer lookups
*/

-- =====================================================
-- 1. CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id bigserial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- =====================================================
-- 2. PRODUCTS TABLE (Enhanced E-Commerce)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  category_id bigint REFERENCES categories(id) ON DELETE SET NULL,
  base_price integer NOT NULL DEFAULT 59900,
  sale_price integer,
  base_image_url text NOT NULL,
  additional_images jsonb DEFAULT '[]'::jsonb,
  sizes_available jsonb DEFAULT '["S", "M", "L", "XL", "XXL"]'::jsonb,
  colors_available jsonb DEFAULT '[]'::jsonb,
  stock_quantity integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_customizable boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sku text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

-- =====================================================
-- 3. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  shipping_address jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can insert customer data"
  ON customers FOR INSERT
  TO public
  WITH CHECK (true);

-- =====================================================
-- 4. CART ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id bigserial PRIMARY KEY,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  product_id bigint REFERENCES products(id) ON DELETE CASCADE,
  saved_design_id bigint,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  selected_size text DEFAULT 'M',
  selected_color text DEFAULT '',
  price_at_addition integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = customer_id);

-- =====================================================
-- 5. ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id bigserial PRIMARY KEY,
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal integer DEFAULT 0,
  shipping_cost integer DEFAULT 0,
  tax integer DEFAULT 0,
  total integer DEFAULT 0,
  shipping_address jsonb DEFAULT '{}'::jsonb,
  payment_method text DEFAULT 'razorpay',
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_id text,
  tracking_number text,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

-- =====================================================
-- 6. ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
  id bigserial PRIMARY KEY,
  order_id bigint REFERENCES orders(id) ON DELETE CASCADE,
  product_id bigint REFERENCES products(id) ON DELETE SET NULL,
  saved_design_id bigint,
  quantity integer DEFAULT 1,
  size text DEFAULT 'M',
  color text DEFAULT '',
  unit_price integer NOT NULL,
  total_price integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- =====================================================
-- 7. SAVED DESIGNS TABLE (Update if exists)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_designs') THEN
    CREATE TABLE saved_designs (
      id bigserial PRIMARY KEY,
      customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
      product_id bigint REFERENCES products(id) ON DELETE SET NULL,
      preview_url text NOT NULL,
      design_data jsonb NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  ELSE
    -- Add missing columns if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_designs' AND column_name = 'customer_id') THEN
      ALTER TABLE saved_designs ADD COLUMN customer_id uuid REFERENCES customers(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert saved designs"
  ON saved_designs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view saved designs"
  ON saved_designs FOR SELECT
  TO public
  USING (true);

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_cart_customer ON cart_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- =====================================================
-- 9. SEED DATA - Sample Categories & Products
-- =====================================================

-- Insert Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Graphic Tees', 'graphic-tees', 'Bold graphics and statement designs', 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg'),
  ('Plain Essentials', 'plain-essentials', 'Classic solid color tees', 'https://images.pexels.com/photos/8532611/pexels-photo-8532611.jpeg'),
  ('Limited Edition', 'limited-edition', 'Exclusive drops and collaborations', 'https://images.pexels.com/photos/9558574/pexels-photo-9558574.jpeg'),
  ('Oversized', 'oversized', 'Relaxed fit streetwear', 'https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg')
ON CONFLICT (slug) DO NOTHING;

-- Insert Sample Products
INSERT INTO products (name, slug, description, category_id, base_price, base_image_url, sizes_available, colors_available, stock_quantity, is_featured, is_customizable, sku) VALUES
  (
    'CHAOS Typography Tee',
    'chaos-typography-tee',
    'Bold typography design inspired by urban chaos. Premium 100% cotton with screen print graphics.',
    (SELECT id FROM categories WHERE slug = 'graphic-tees'),
    59900,
    'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
    '["S", "M", "L", "XL", "XXL"]'::jsonb,
    '[{"name": "Black", "hex": "#000000"}, {"name": "White", "hex": "#FFFFFF"}]'::jsonb,
    50,
    true,
    false,
    'SRNX-GT-001'
  ),
  (
    'Minimalist Black Tee',
    'minimalist-black-tee',
    'Clean, simple, essential. The perfect wardrobe staple in premium black cotton.',
    (SELECT id FROM categories WHERE slug = 'plain-essentials'),
    49900,
    'https://images.pexels.com/photos/8532611/pexels-photo-8532611.jpeg',
    '["S", "M", "L", "XL", "XXL"]'::jsonb,
    '[{"name": "Black", "hex": "#000000"}]'::jsonb,
    100,
    true,
    true,
    'SRNX-PE-001'
  ),
  (
    'Neon Abstract Drop',
    'neon-abstract-drop',
    'Limited edition collaboration with digital artists. Glow-in-the-dark print elements.',
    (SELECT id FROM categories WHERE slug = 'limited-edition'),
    79900,
    'https://images.pexels.com/photos/9558574/pexels-photo-9558574.jpeg',
    '["M", "L", "XL"]'::jsonb,
    '[{"name": "Black with Neon", "hex": "#000000"}]'::jsonb,
    25,
    true,
    false,
    'SRNX-LE-001'
  ),
  (
    'Oversized White Tee',
    'oversized-white-tee',
    'Relaxed fit premium cotton tee. Perfect for layering or wearing solo.',
    (SELECT id FROM categories WHERE slug = 'oversized'),
    64900,
    'https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg',
    '["L", "XL", "XXL"]'::jsonb,
    '[{"name": "White", "hex": "#FFFFFF"}, {"name": "Cream", "hex": "#FFFDD0"}]'::jsonb,
    75,
    true,
    true,
    'SRNX-OS-001'
  ),
  (
    'Vintage Washed Grey',
    'vintage-washed-grey',
    'Soft vintage wash with distressed finish. Each piece is unique.',
    (SELECT id FROM categories WHERE slug = 'plain-essentials'),
    54900,
    'https://images.pexels.com/photos/8532612/pexels-photo-8532612.jpeg',
    '["S", "M", "L", "XL"]'::jsonb,
    '[{"name": "Grey", "hex": "#808080"}]'::jsonb,
    60,
    false,
    false,
    'SRNX-PE-002'
  ),
  (
    'Street Code Graphic',
    'street-code-graphic',
    'Binary code meets street art. For the tech-savvy style enthusiast.',
    (SELECT id FROM categories WHERE slug = 'graphic-tees'),
    59900,
    'https://images.pexels.com/photos/8532615/pexels-photo-8532615.jpeg',
    '["S", "M", "L", "XL", "XXL"]'::jsonb,
    '[{"name": "Black", "hex": "#000000"}, {"name": "Navy", "hex": "#000080"}]'::jsonb,
    40,
    false,
    false,
    'SRNX-GT-002'
  )
ON CONFLICT (slug) DO NOTHING;
