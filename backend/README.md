# RevoShop API

RevoShop API adalah RESTful backend untuk aplikasi online store yang mengelola users, products, categories, orders, dan order items.

Project ini dibangun menggunakan Flask dan PostgreSQL dengan SQLAlchemy sebagai ORM serta Flask-Migrate untuk mengelola database migrations.

---

## Project Overview

RevoShop menyediakan backend API untuk kebutuhan toko online, termasuk:

- User registration
- User login
- Product management
- Category management
- Order management
- Order item management
- Product stock management
- Input validation
- Error handling
- Database migrations
- Automated testing
- Load testing

Data aplikasi disimpan di PostgreSQL dan diakses melalui REST API.

---

## Features

### User

- Create/register a new user
- Get all users
- Get user by ID
- Login using email and password
- Password stored using hashing

### Product

- Create product
- Get all products
- Get product by ID
- Update product
- Delete product
- Product validation
- Stock management
- Prevent deletion when product is still linked to active orders

### Category

- Create category
- Get all categories
- Get category by ID
- Update category
- Delete category
- Category validation
- Prevent deletion when category still contains products

### Order

- Create order
- Get all orders
- Get order by ID
- Update order status
- Delete order
- Order linked to a user
- Order linked to products through order_items
- Product stock automatically decreases when an order is created
- Product stock is restored when an order is deleted

### Database

The database contains:

- `users`
- `products`
- `categories`
- `orders`
- `order_items`

The `order_items` table connects orders and products and stores:

- quantity
- price

---

# Technology Stack

- Python
- Flask
- Flask-SQLAlchemy
- SQLAlchemy
- Flask-Migrate
- Alembic
- PostgreSQL
- psycopg2-binary
- python-dotenv
- pytest
- Locust
- pgAdmin
- Supabase PostgreSQL
- Vercel

---

# Project Structure

```text
revoshop-db/
│
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models.py
│   └── routes.py
│
├── api/
│   └── index.py
│
├── migrations/
│   ├── versions/
│   │   ├── 0001_initial_schema.py
│   │   └── 1cdd4502dff8_add_role_to_users.py
│   ├── README
│   ├── alembic.ini
│   ├── env.py
│   └── script.py.mako
│
├── tests/
│   ├── test_category.py
│   ├── test_order.py
│   └── test_product.py
│
├── .env
├── .env.example
├── .gitignore
├── create_tables.py
├── locustfile.py
├── pytest.ini
├── queries.sql
├── README.md
├── requirements.txt
├── run.py
├── schema.sql
└── seed.sql