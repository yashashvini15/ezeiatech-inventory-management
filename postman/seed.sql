-- Car showroom sample data for the Smart Inventory & Order Management System (PostgreSQL)
-- Run AFTER the backend has started once (Hibernate creates the tables).
-- Safe to run more than once: it never overwrites or duplicates existing rows.
--
-- Demo logins (created only if the email does not exist yet):
--   admin@email.com     / Admin@12345     (ADMIN  = showroom owner)
--   staff@email.com     / Staff@12345     (STAFF  = sales & delivery team)
--   customer@email.com  / Customer@12345  (CUSTOMER = car buyer)

-- 1. Users (passwords are bcrypt hashes, never plain text)
INSERT INTO users (name, email, password, role, status, created_at) VALUES
 ('Showroom Owner', 'admin@email.com',    '$2a$10$90eileXYl6K6odSM/fHEyOX.HSVGgvAf34zfOLBXOubAp2TGipZr2', 'ADMIN',    'ACTIVE', now()),
 ('Sales Staff',    'staff@email.com',    '$2a$10$kykDwBBK2loDhXucIpou..G3sq5sN/d2PdUrfledkFUVKxCj3MyMe', 'STAFF',    'ACTIVE', now()),
 ('Demo Customer',  'customer@email.com', '$2a$10$G7dvuDsmx1zaRJeFunxNfOVOWSToglc9c1NH3ae9dbFBpHxgBNpUG', 'CUSTOMER', 'ACTIVE', now())
ON CONFLICT (email) DO NOTHING;

-- 2. Categories (car types)
INSERT INTO categories (name, description, status, created_at) VALUES
 ('Hatchback', 'Compact city cars',  'ACTIVE', now()),
 ('Sedan',     'Comfortable family sedans', 'ACTIVE', now()),
 ('SUV',       'Sport utility vehicles', 'ACTIVE', now())
ON CONFLICT (name) DO NOTHING;

-- 3. Suppliers (car companies / distributors)
INSERT INTO suppliers (name, email, phone, address, status, created_at) VALUES
 ('Maruti Suzuki Distributor', 'sales@maruti-dist.example',  '9876500001', 'Gurugram, Haryana', 'ACTIVE', now()),
 ('Hyundai Distributor',       'sales@hyundai-dist.example', '9876500002', 'Noida, Uttar Pradesh', 'ACTIVE', now()),
 ('Mahindra Distributor',      'sales@mahindra-dist.example','9876500003', 'Delhi', 'ACTIVE', now())
ON CONFLICT (email) DO NOTHING;

-- 4. Cars (stock shown is the stock AFTER the sample orders in step 5)
--    XUV700: stock 2 <= reorder 2  -> LOW STOCK demo
--    Fortuner: stock 0             -> OUT OF STOCK demo
INSERT INTO products (name, sku, description, category_id, supplier_id, price, cost_price, stock, reorder_level, status, created_at, updated_at)
SELECT v.name, v.sku, v.descr,
       (SELECT id FROM categories WHERE name = v.cat),
       (SELECT id FROM suppliers  WHERE email = v.sup),
       v.price, v.cost, v.stock, v.reorder, 'ACTIVE', now(), now()
FROM (VALUES
  ('Maruti Swift VXi',    'CAR-1001', 'Petrol hatchback, 5 seater',        'Hatchback', 'sales@maruti-dist.example',   750000.00,  650000.00,  8, 2),
  ('Tata Punch Adventure','CAR-1002', 'Compact SUV-style hatchback',       'Hatchback', 'sales@maruti-dist.example',   650000.00,  570000.00, 12, 3),
  ('Honda City ZX',       'CAR-2001', 'Petrol sedan, automatic',           'Sedan',     'sales@maruti-dist.example',  1350000.00, 1180000.00,  7, 2),
  ('Hyundai Creta SX',    'CAR-3001', 'Mid-size SUV',                      'SUV',       'sales@hyundai-dist.example', 1500000.00, 1300000.00,  5, 2),
  ('Mahindra XUV700 AX7', 'CAR-3002', '7 seater SUV (LOW STOCK demo)',     'SUV',       'sales@mahindra-dist.example',2200000.00, 1950000.00,  2, 2),
  ('Toyota Fortuner',     'CAR-3003', 'Premium SUV (OUT OF STOCK demo)',   'SUV',       'sales@maruti-dist.example',  3500000.00, 3150000.00,  0, 1)
) AS v(name, sku, descr, cat, sup, price, cost, stock, reorder)
ON CONFLICT (sku) DO NOTHING;

-- 5. History: one stock-in, two bookings, one open restock request
DO $$
DECLARE
  admin_id bigint := (SELECT id FROM users WHERE role = 'ADMIN'    ORDER BY id LIMIT 1);
  staff_id bigint := (SELECT id FROM users WHERE role = 'STAFF'    ORDER BY id LIMIT 1);
  cust_id  bigint := (SELECT id FROM users WHERE role = 'CUSTOMER' ORDER BY id LIMIT 1);
  swift    bigint := (SELECT id FROM products WHERE sku = 'CAR-1001');
  punch    bigint := (SELECT id FROM products WHERE sku = 'CAR-1002');
  creta    bigint := (SELECT id FROM products WHERE sku = 'CAR-3001');
  xuv      bigint := (SELECT id FROM products WHERE sku = 'CAR-3002');
  o1 bigint;
  o2 bigint;
BEGIN
  IF admin_id IS NULL OR staff_id IS NULL OR cust_id IS NULL OR swift IS NULL OR creta IS NULL THEN
    RAISE NOTICE 'Users or cars missing, skipping history rows';
    RETURN;
  END IF;

  -- Stock-in: owner added 5 Tata Punch (7 -> 12)
  IF NOT EXISTS (SELECT 1 FROM inventory_movements WHERE product_id = punch AND type = 'STOCK_IN') THEN
    INSERT INTO inventory_movements (product_id, type, quantity, previous_stock, new_stock, reference_id, created_by, created_at)
    VALUES (punch, 'STOCK_IN', 5, 7, 12, NULL, admin_id, now() - interval '6 days');
  END IF;

  -- Booking 1: 2 Swift, DELIVERED (stock 10 -> 8). Price 7,50,000 x 2 + 18% tax
  IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20261020-CAR001') THEN
    INSERT INTO orders (order_number, customer_id, subtotal, tax, total, status, payment_status, created_at, updated_at)
    VALUES ('ORD-20261020-CAR001', cust_id, 1500000.00, 270000.00, 1770000.00, 'DELIVERED', 'PAID',
            now() - interval '5 days', now() - interval '4 days')
    RETURNING id INTO o1;
    INSERT INTO order_items (order_id, product_id, product_name, sku, unit_price, quantity, line_total)
    VALUES (o1, swift, 'Maruti Swift VXi', 'CAR-1001', 750000.00, 2, 1500000.00);
    INSERT INTO inventory_movements (product_id, type, quantity, previous_stock, new_stock, reference_id, created_by, created_at)
    VALUES (swift, 'ORDER_PLACED', 2, 10, 8, o1, cust_id, now() - interval '5 days');
    INSERT INTO order_history (order_id, old_status, new_status, changed_by, created_at) VALUES
      (o1, NULL,        'PLACED',    cust_id,  now() - interval '5 days'),
      (o1, 'PLACED',    'CONFIRMED', staff_id, now() - interval '5 days' + interval '10 minutes'),
      (o1, 'CONFIRMED', 'PACKED',    staff_id, now() - interval '5 days' + interval '1 hour'),
      (o1, 'PACKED',    'SHIPPED',   staff_id, now() - interval '5 days' + interval '4 hours'),
      (o1, 'SHIPPED',   'DELIVERED', staff_id, now() - interval '4 days');
  END IF;

  -- Booking 2: 1 Creta, just PLACED (stock 6 -> 5)
  IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20261024-CAR002') THEN
    INSERT INTO orders (order_number, customer_id, subtotal, tax, total, status, payment_status, created_at, updated_at)
    VALUES ('ORD-20261024-CAR002', cust_id, 1500000.00, 270000.00, 1770000.00, 'PLACED', 'PENDING',
            now() - interval '1 day', now() - interval '1 day')
    RETURNING id INTO o2;
    INSERT INTO order_items (order_id, product_id, product_name, sku, unit_price, quantity, line_total)
    VALUES (o2, creta, 'Hyundai Creta SX', 'CAR-3001', 1500000.00, 1, 1500000.00);
    INSERT INTO inventory_movements (product_id, type, quantity, previous_stock, new_stock, reference_id, created_by, created_at)
    VALUES (creta, 'ORDER_PLACED', 1, 6, 5, o2, cust_id, now() - interval '1 day');
    INSERT INTO order_history (order_id, old_status, new_status, changed_by, created_at)
    VALUES (o2, NULL, 'PLACED', cust_id, now() - interval '1 day');
  END IF;

  -- Restock request: staff asks the owner to restock the low XUV700
  IF xuv IS NOT NULL AND NOT EXISTS (SELECT 1 FROM restock_requests WHERE product_id = xuv AND status = 'OPEN') THEN
    INSERT INTO restock_requests (product_id, requested_by, quantity, note, status, created_at)
    VALUES (xuv, staff_id, 5, 'Only 2 left, customers are asking', 'OPEN', now() - interval '2 hours');
  END IF;
END $$;
