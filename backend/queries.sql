-- ============================================
-- RevoShop Queries
-- ============================================


-- 1. Products under Rp700,000,
--    sorted from most expensive to cheapest,
--    showing only 5 products.

SELECT
    product_id,
    name,
    price,
    stock
FROM products
WHERE price < 700000
ORDER BY price DESC
LIMIT 5;


-- 2. Show available products with their categories.

SELECT
    p.product_id,
    p.name AS product_name,
    c.name AS category_name,
    p.price,
    p.stock
FROM products p
JOIN categories c
    ON p.category_id = c.category_id
WHERE p.stock > 0
ORDER BY p.name ASC;


-- 3. Show orders with customer names.

SELECT
    o.order_id,
    u.name AS customer_name,
    o.order_date,
    o.status,
    o.total_amount
FROM orders o
JOIN users u
    ON o.user_id = u.user_id
ORDER BY o.order_date DESC;


-- 4. Show products purchased in order #1.

SELECT
    o.order_id,
    p.name AS product_name,
    oi.quantity,
    oi.price
FROM order_items oi
JOIN orders o
    ON oi.order_id = o.order_id
JOIN products p
    ON oi.product_id = p.product_id
WHERE o.order_id = 1;
