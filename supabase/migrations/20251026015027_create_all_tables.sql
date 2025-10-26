/*
  # Coffee ERP Pro - Complete Database Schema

  ## Overview
  This migration creates a comprehensive database schema for a professional coffee ERP system
  with complete data persistence, authentication, and business logic support.

  ## New Tables Created

  ### 1. users (extends auth.users)
    - `id` (uuid, references auth.users)
    - `username` (text, unique)
    - `role` (text) - Admin, Roaster, QC, Sales, User
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 2. suppliers
    - `id` (text, primary key) - Format: SP0724-0001
    - `name` (text)
    - `contact_person` (text)
    - `phone` (text)
    - `email` (text)
    - `origin` (text) - Coffee origin location
    - `specialties` (text[]) - Array of bean varieties
    - `created_at` (timestamptz)

  ### 3. purchase_orders
    - `id` (text, primary key) - Format: PO0724-0001
    - `supplier_id` (text, references suppliers)
    - `order_date` (date)
    - `expected_delivery_date` (date)
    - `items` (jsonb) - Array of order items
    - `status` (text) - Pending, Approved, Rejected, Completed
    - `created_at` (timestamptz)

  ### 4. green_bean_grades
    - `id` (text, primary key) - Format: GR0724-0001
    - `po_id` (text, references purchase_orders)
    - `batch_id` (text)
    - `variety` (text)
    - `grading_date` (date)
    - `status` (text) - Accepted, Returned
    - `physical_analysis` (jsonb) - Detailed quality metrics
    - `notes` (text)
    - `created_at` (timestamptz)

  ### 5. stock_items
    - `id` (text, primary key) - Format: ST0724-0001
    - `type` (text) - Green Bean, Roasted Bean
    - `variety` (text) - Arabica, Robusta, Liberica, Blend
    - `quantity_kg` (numeric)
    - `location` (text) - Warehouse location
    - `last_updated` (timestamptz)
    - `created_at` (timestamptz)

  ### 6. roast_profiles
    - `id` (text, primary key) - Format: RT0724-0001
    - `batch_id` (text, unique)
    - `roast_date` (date)
    - `green_bean_variety` (text)
    - `green_bean_stock_id` (text, references stock_items)
    - `roaster_name` (text)
    - `ambient_temp` (numeric)
    - `green_bean_weight_kg` (numeric)
    - `charge_temp` (numeric)
    - `turnaround_time` (integer) - seconds
    - `turnaround_temp` (numeric)
    - `drying_phase_end_time` (integer) - seconds
    - `first_crack_time` (integer) - seconds
    - `total_roast_time` (integer) - seconds
    - `drop_temp` (numeric)
    - `development_time` (integer) - seconds
    - `roasted_weight_kg` (numeric)
    - `color_score` (text)
    - `internal_roasting_cost_per_kg` (numeric)
    - `notes` (text)
    - `created_at` (timestamptz)

  ### 7. external_roast_logs
    - `id` (text, primary key) - Format: ER0724-0001
    - `roastery_name` (text)
    - `date_sent` (date)
    - `date_received` (date)
    - `green_bean_stock_id` (text, references stock_items)
    - `green_bean_variety` (text)
    - `green_bean_weight_sent_kg` (numeric)
    - `roasted_bean_weight_received_kg` (numeric)
    - `roasting_cost_per_kg` (numeric)
    - `notes` (text)
    - `created_at` (timestamptz)

  ### 8. cupping_sessions
    - `id` (text, primary key) - Format: CP0724-0001
    - `roast_profile_id` (text, references roast_profiles)
    - `session_date` (date)
    - `roast_level` (text)
    - SCA scoring attributes (fragrance_dry, flavor, acidity, body, etc.)
    - `defects` (jsonb)
    - `final_score` (numeric)
    - `notes` (text)
    - `created_at` (timestamptz)

  ### 9. blends
    - `id` (text, primary key) - Format: BL0724-0001
    - `name` (text)
    - `components` (jsonb) - Array of blend components
    - `total_cost_per_kg` (numeric)
    - `creation_date` (date)
    - `notes` (text)
    - `created_at` (timestamptz)

  ### 10. warehouse_logs
    - `id` (text, primary key) - Format: LG0724-0001
    - `date` (date)
    - `item_id` (text, references stock_items)
    - `change` (numeric) - positive for IN, negative for OUT
    - `notes` (text)
    - `created_at` (timestamptz)

  ### 11. sales_records
    - `id` (text, primary key) - Format: SL0724-0001
    - `invoice_number` (text, unique)
    - `sale_date` (date)
    - `items` (jsonb) - Array of sale items
    - `customer_name` (text)
    - `total_amount` (numeric)
    - `payment_status` (text) - Paid, Unpaid, Partially Paid, Refunded
    - `shipping_address` (text)
    - `notes` (text)
    - `created_at` (timestamptz)

  ### 12. alert_settings
    - `id` (text, primary key) - Format: AL0724-0001
    - `variety` (text)
    - `type` (text)
    - `threshold` (numeric)
    - `created_at` (timestamptz)

  ### 13. packaging
    - `id` (text, primary key) - Format: PK0724-0001
    - `name` (text)
    - `size_kg` (numeric)
    - `cost` (numeric)
    - `created_at` (timestamptz)

  ### 14. expenses
    - `id` (text, primary key) - Format: EX0724-0001
    - `date` (date)
    - `description` (text)
    - `category` (text) - Utilities, Salary, Rent, Marketing, Maintenance, Other
    - `amount` (numeric)
    - `created_at` (timestamptz)

  ### 15. todos
    - `id` (text, primary key) - Format: TD0724-0001
    - `text` (text)
    - `status` (text) - To Do, In Progress, Done
    - `created_at` (timestamptz)
    - `due_date` (date)
    - `priority` (text) - Low, Medium, High
    - `assigned_to` (uuid, references users)
    - `updated_at` (timestamptz)

  ### 16. comments
    - `id` (text, primary key) - Format: CM0724-0001
    - `task_id` (text, references todos)
    - `user_id` (uuid, references users)
    - `text` (text)
    - `created_at` (timestamptz)

  ## Security
  
  All tables have Row Level Security (RLS) enabled with policies that:
  - Allow authenticated users to read data
  - Restrict write operations based on user roles
  - Admins have full access
  - Users can only modify their own data where applicable

  ## Indexes

  Strategic indexes added for:
  - Foreign key relationships
  - Frequently queried columns (dates, status, variety)
  - Unique constraints where needed
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'User',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('Admin', 'Roaster', 'QC', 'Sales', 'User'))
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON public.users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- 2. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
  id text PRIMARY KEY,
  name text NOT NULL,
  contact_person text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  origin text NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read suppliers"
  ON public.suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and QC can manage suppliers"
  ON public.suppliers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'QC')
    )
  );

-- 3. PURCHASE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id text PRIMARY KEY,
  supplier_id text NOT NULL REFERENCES public.suppliers(id),
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date date NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_po_status CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed'))
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON public.purchase_orders(order_date);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read purchase orders"
  ON public.purchase_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and QC can manage purchase orders"
  ON public.purchase_orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'QC')
    )
  );

-- 4. GREEN BEAN GRADES TABLE
CREATE TABLE IF NOT EXISTS public.green_bean_grades (
  id text PRIMARY KEY,
  po_id text NOT NULL REFERENCES public.purchase_orders(id),
  batch_id text NOT NULL,
  variety text NOT NULL,
  grading_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL,
  physical_analysis jsonb NOT NULL DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_grade_status CHECK (status IN ('Accepted', 'Returned'))
);

CREATE INDEX IF NOT EXISTS idx_green_bean_grades_po ON public.green_bean_grades(po_id);
CREATE INDEX IF NOT EXISTS idx_green_bean_grades_variety ON public.green_bean_grades(variety);

ALTER TABLE public.green_bean_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read grades"
  ON public.green_bean_grades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and QC can manage grades"
  ON public.green_bean_grades FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'QC')
    )
  );

-- 5. STOCK ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.stock_items (
  id text PRIMARY KEY,
  type text NOT NULL,
  variety text NOT NULL,
  quantity_kg numeric NOT NULL DEFAULT 0,
  location text NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_stock_type CHECK (type IN ('Green Bean', 'Roasted Bean')),
  CONSTRAINT valid_variety CHECK (variety IN ('Arabica', 'Robusta', 'Liberica', 'Blend')),
  CONSTRAINT positive_quantity CHECK (quantity_kg >= 0)
);

CREATE INDEX IF NOT EXISTS idx_stock_items_type ON public.stock_items(type);
CREATE INDEX IF NOT EXISTS idx_stock_items_variety ON public.stock_items(variety);

ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read stock"
  ON public.stock_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and relevant roles can manage stock"
  ON public.stock_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'QC', 'Roaster')
    )
  );

-- 6. ROAST PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.roast_profiles (
  id text PRIMARY KEY,
  batch_id text UNIQUE NOT NULL,
  roast_date date NOT NULL DEFAULT CURRENT_DATE,
  green_bean_variety text NOT NULL,
  green_bean_stock_id text NOT NULL REFERENCES public.stock_items(id),
  roaster_name text NOT NULL,
  ambient_temp numeric NOT NULL,
  green_bean_weight_kg numeric NOT NULL,
  charge_temp numeric NOT NULL,
  turnaround_time integer NOT NULL,
  turnaround_temp numeric NOT NULL,
  drying_phase_end_time integer NOT NULL,
  first_crack_time integer NOT NULL,
  total_roast_time integer NOT NULL,
  drop_temp numeric NOT NULL,
  development_time integer NOT NULL,
  roasted_weight_kg numeric NOT NULL,
  color_score text NOT NULL,
  internal_roasting_cost_per_kg numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roast_profiles_variety ON public.roast_profiles(green_bean_variety);
CREATE INDEX IF NOT EXISTS idx_roast_profiles_date ON public.roast_profiles(roast_date);

ALTER TABLE public.roast_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read roast profiles"
  ON public.roast_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and Roasters can manage roast profiles"
  ON public.roast_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Roaster')
    )
  );

-- 7. EXTERNAL ROAST LOGS TABLE
CREATE TABLE IF NOT EXISTS public.external_roast_logs (
  id text PRIMARY KEY,
  roastery_name text NOT NULL,
  date_sent date NOT NULL,
  date_received date NOT NULL,
  green_bean_stock_id text NOT NULL REFERENCES public.stock_items(id),
  green_bean_variety text NOT NULL,
  green_bean_weight_sent_kg numeric NOT NULL,
  roasted_bean_weight_received_kg numeric NOT NULL,
  roasting_cost_per_kg numeric NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_external_roast_logs_variety ON public.external_roast_logs(green_bean_variety);

ALTER TABLE public.external_roast_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read external roast logs"
  ON public.external_roast_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage external roast logs"
  ON public.external_roast_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- 8. CUPPING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.cupping_sessions (
  id text PRIMARY KEY,
  roast_profile_id text NOT NULL REFERENCES public.roast_profiles(id),
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  roast_level text NOT NULL,
  fragrance_dry numeric NOT NULL,
  fragrance_break numeric NOT NULL,
  flavor numeric NOT NULL,
  aftertaste numeric NOT NULL,
  acidity numeric NOT NULL,
  body numeric NOT NULL,
  balance numeric NOT NULL,
  sweetness numeric NOT NULL,
  cleanliness numeric NOT NULL,
  uniformity numeric NOT NULL,
  defects jsonb NOT NULL DEFAULT '{"numberOfCups": 5, "taints": 0, "faults": 0}',
  final_score numeric NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_roast_level CHECK (roast_level IN ('Cinnamon', 'Light', 'City', 'Full City', 'Dark'))
);

CREATE INDEX IF NOT EXISTS idx_cupping_sessions_roast ON public.cupping_sessions(roast_profile_id);

ALTER TABLE public.cupping_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cupping sessions"
  ON public.cupping_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and QC can manage cupping sessions"
  ON public.cupping_sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'QC')
    )
  );

-- 9. BLENDS TABLE
CREATE TABLE IF NOT EXISTS public.blends (
  id text PRIMARY KEY,
  name text NOT NULL,
  components jsonb NOT NULL DEFAULT '[]',
  total_cost_per_kg numeric NOT NULL DEFAULT 0,
  creation_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.blends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read blends"
  ON public.blends FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and Roasters can manage blends"
  ON public.blends FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Roaster')
    )
  );

-- 10. WAREHOUSE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.warehouse_logs (
  id text PRIMARY KEY,
  date date NOT NULL DEFAULT CURRENT_DATE,
  item_id text NOT NULL REFERENCES public.stock_items(id),
  change numeric NOT NULL,
  notes text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warehouse_logs_item ON public.warehouse_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_logs_date ON public.warehouse_logs(date);

ALTER TABLE public.warehouse_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read warehouse logs"
  ON public.warehouse_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and relevant roles can manage warehouse logs"
  ON public.warehouse_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'QC', 'Roaster')
    )
  );

-- 11. SALES RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.sales_records (
  id text PRIMARY KEY,
  invoice_number text UNIQUE NOT NULL,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  items jsonb NOT NULL DEFAULT '[]',
  customer_name text NOT NULL,
  total_amount numeric NOT NULL,
  payment_status text NOT NULL DEFAULT 'Unpaid',
  shipping_address text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('Paid', 'Unpaid', 'Partially Paid', 'Refunded'))
);

CREATE INDEX IF NOT EXISTS idx_sales_records_date ON public.sales_records(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_records_status ON public.sales_records(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_records_invoice ON public.sales_records(invoice_number);

ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sales records"
  ON public.sales_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and Sales can manage sales records"
  ON public.sales_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Sales')
    )
  );

-- 12. ALERT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.alert_settings (
  id text PRIMARY KEY,
  variety text NOT NULL,
  type text NOT NULL,
  threshold numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_alert_type CHECK (type IN ('Green Bean', 'Roasted Bean'))
);

ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read alert settings"
  ON public.alert_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage alert settings"
  ON public.alert_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- 13. PACKAGING TABLE
CREATE TABLE IF NOT EXISTS public.packaging (
  id text PRIMARY KEY,
  name text NOT NULL,
  size_kg numeric NOT NULL,
  cost numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.packaging ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read packaging"
  ON public.packaging FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage packaging"
  ON public.packaging FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- 14. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id text PRIMARY KEY,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_expense_category CHECK (category IN ('Utilities', 'Salary', 'Rent', 'Marketing', 'Maintenance', 'Other'))
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage expenses"
  ON public.expenses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- 15. TODOS TABLE
CREATE TABLE IF NOT EXISTS public.todos (
  id text PRIMARY KEY,
  text text NOT NULL,
  status text NOT NULL DEFAULT 'To Do',
  created_at timestamptz DEFAULT now(),
  due_date date,
  priority text NOT NULL DEFAULT 'Medium',
  assigned_to uuid REFERENCES public.users(id),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_todo_status CHECK (status IN ('To Do', 'In Progress', 'Done')),
  CONSTRAINT valid_priority CHECK (priority IN ('Low', 'Medium', 'High'))
);

CREATE INDEX IF NOT EXISTS idx_todos_status ON public.todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_assigned ON public.todos(assigned_to);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all todos"
  ON public.todos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage assigned todos"
  ON public.todos FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Admins can manage all todos"
  ON public.todos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- 16. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id text PRIMARY KEY,
  task_id text NOT NULL REFERENCES public.todos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id),
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_task ON public.comments(task_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_todos_updated_at') THEN
    CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON public.todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
