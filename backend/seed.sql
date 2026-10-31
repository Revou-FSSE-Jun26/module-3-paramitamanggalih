-- ============================================
-- RevoShop Sample Data
-- ============================================


-- USERS
INSERT INTO users (name, email, password)
VALUES
('Andi Pratama', 'andi@example.com', 'password123'),
('Siti Rahma', 'siti@example.com', 'password456'),
('Budi Santoso', 'budi@example.com', 'password789'),
('Dewi Lestari', 'dewi@example.com', 'password321'),
('Rizky Maulana', 'rizky@example.com', 'password654');


-- CATEGORIES
INSERT INTO categories (name, description)
VALUES
('Electronics', 'Electronic devices and accessories'),
('Fashion', 'Clothing and fashion products'),
('Home & Living', 'Products for home and everyday living'),
('Books', 'Books and reading materials');


-- PRODUCTS
INSERT INTO products
(category_id, name, description, price, stock)
VALUES
(1, 'Wireless Mouse',
 'Ergonomic wireless mouse with USB receiver',
 150000.00, 50),

(1, 'Mechanical Keyboard',
 'RGB mechanical keyboard with blue switches',
 650000.00, 25),

(1, 'USB-C Hub',
 'Multi-port USB-C hub for laptops',
 300000.00, 40),

(1, 'Bluetooth Headphones',
 'Wireless headphones with noise cancellation',
 850000.00, 20),

(2, 'Basic T-Shirt',
 'Comfortable cotton t-shirt',
 120000.00, 100),

(2, 'Denim Jacket',
 'Classic blue denim jacket',
 450000.00, 30),

(3, 'Desk Lamp',
 'LED desk lamp with adjustable brightness',
 200000.00, 35),

(3, 'Office Chair',
 'Ergonomic office chair with adjustable height',
 1200000.00, 15),

(4, 'Clean Code',
 'A handbook of agile software craftsmanship',
 400000.00, 20),

(4, 'Design Patterns',
 'Elements of reusable object-oriented software',
 500000.00, 15);


-- ORDERS
INSERT INTO orders
(user_id, order_date, status, total_amount)
VALUES
(1, '2026-08-25 10:30:00', 'completed', 800000.00),

(2, '2026-08-26 14:15:00', 'completed', 970000.00),

(3, '2026-08-27 09:45:00', 'pending', 1400000.00),

(1, '2026-08-28 16:20:00', 'shipped', 600000.00),

(4, '2026-08-29 11:10:00', 'completed', 570000.00);


-- ORDER ITEMS
INSERT INTO order_items
(order_id, product_id, quantity, price)
VALUES
-- Order 1
(1, 2, 1, 650000.00),
(1, 1, 1, 150000.00),

-- Order 2
(2, 4, 1, 850000.00),
(2, 1, 1, 120000.00),

-- Order 3
(3, 8, 1, 1200000.00),
(3, 7, 1, 200000.00),

-- Order 4
(4, 3, 2, 300000.00),

-- Order 5
(5, 6, 1, 450000.00),
(5, 5, 1, 120000.00);
