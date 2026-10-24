# RevoShop Frontend — Checkpoints 2 & 3

RevoShop is an online store frontend built with Next.js App Router, React, TypeScript, and Tailwind CSS. It integrates with a Flask REST API and PostgreSQL database. This repository continues the work from earlier checkpoints and adds authentication UI, persistent cart, checkout, customer order history, admin management pages, and Playwright E2E tests.

## Technologies

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Flask REST API
- PostgreSQL
- Playwright for end-to-end testing
- `react-hot-toast` for notifications

## Features

### Storefront
- Responsive Home, Product Catalog, Categories, and Product Detail pages
- Reusable Header, Footer, Card, and ProductCard components
- Product search and category filtering synchronized with URL query parameters
- Stock-aware quantity controls
- Loading and error states
- Dynamic metadata for product detail pages

### Authentication
- Customer registration through the Flask API
- Login through the Flask API
- User information persisted in browser localStorage
- Navigation changes according to the current user's role
- Login and registration feedback through toast notifications

### Shopping Cart and Checkout
- Cart state shared across pages and persisted in localStorage
- Add products, update quantities, and remove items
- Cart item count and total price
- Checkout submits order items to `POST /orders`
- Cart is cleared and the customer is redirected to My Orders after a successful checkout

### Customer Orders
- Customer order history filtered by the current user
- Order detail page at `/orders/[id]`
- Order status, date, total, and purchased items

### Admin Dashboard
- Product listing, creation, editing, and deletion
- Category creation, editing, and deletion
- Read-only overview of customer orders
- Feedback for failed requests, including deletion conflicts
- Frontend role guard for admin pages

### Automated Testing
- Playwright tests for registration and login
- Playwright test for browsing, cart, checkout, and order history
- Playwright test for admin product and category CRUD
- Isolated mock API for E2E tests to avoid changing the real PostgreSQL database during automated test runs

## Project Structure

- `html-css/`, `javascript/`, `typescript-tailwind/` — earlier checkpoint materials retained in the same repository
- `app/` — Next.js routes, layouts, loading and error states
- `app/products/[id]/` — dynamic product detail page
- `app/cart/` — shopping cart
- `app/checkout/` — checkout page
- `app/orders/` — customer order history and order details
- `app/dashboard/` — admin product, category, and order management routes
- `components/` — reusable UI components and client-side page components
- `context/AuthContext.tsx` — client-side user state
- `context/CartContext.tsx` — persistent cart state
- `lib/api.ts` — Flask API utilities
- `types/product.ts` — shared product and category types
- `tests/e2e/` — Playwright tests and isolated mock API
- `playwright.config.ts` — browser test configuration
- `docs/screenshots/` — screenshot evidence for the checkpoints

## Prerequisites

- Node.js 20.9 or later
- npm
- PostgreSQL and the Flask API for integration with the real backend
- Chromium installed through Playwright for E2E tests

## Environment Configuration

Create `.env.local` in the frontend project:

    NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000

Use `.env.example` as a reference. Keep `.env.local`, passwords, and real credentials out of Git.

## Running Locally

Start the Flask API in a separate terminal:

    cd D:\revoshop-db
    .\venv\Scripts\Activate.ps1
    python run.py

Start the Next.js frontend in another terminal:

    cd D:\revoshop-checkpoint-2
    npm install
    npm run dev

Open http://localhost:3000 in your browser.

The frontend's real API integration uses `NEXT_PUBLIC_API_BASE_URL` from `.env.local`.

## Main Routes

| Route | Description |
|---|---|
| `/` | Home page |
| `/products` | Product catalog, search, category filter, and cart summary |
| `/products/[id]` | Product details |
| `/categories` | Category listing |
| `/register` | Customer registration |
| `/login` | Login |
| `/cart` | Persistent shopping cart |
| `/checkout` | Submit a customer order |
| `/orders` | Current customer's order history |
| `/orders/[id]` | Order detail |
| `/dashboard` | Admin product CRUD |
| `/dashboard/categories` | Admin category CRUD |
| `/dashboard/orders` | Read-only admin order overview |

## API Endpoints Used

- `GET /api`
- `GET /products`
- `GET /products/<id>`
- `POST /products`
- `PUT /products/<id>`
- `DELETE /products/<id>`
- `GET /categories`
- `GET /categories/<id>`
- `POST /categories`
- `PUT /categories/<id>`
- `DELETE /categories/<id>`
- `POST /users`
- `POST /auth/login`
- `GET /orders?user_id=<id>&limit=20&offset=0`
- `POST /orders`
- `GET /orders/<id>`

The orders list supports pagination using `limit` and `offset`.

## End-to-End Testing

Install dependencies and the Chromium browser:

    npm install
    npx playwright install chromium

In PowerShell, set dummy credentials for the admin account used by the isolated mock API:

    $env:E2E_ADMIN_EMAIL = "admin@e2e.local"
    $env:E2E_ADMIN_PASSWORD = "E2eAdmin123!"

Run the E2E suite:

    npm run test:e2e

Playwright starts the mock API on `http://127.0.0.1:5001` and a separate Next.js development server on `http://127.0.0.1:3100`. The mock API uses in-memory test data and does not modify the real PostgreSQL database. These credentials are for local test use only.

## Validation

Check TypeScript:

    npx tsc --noEmit

Create a production build:

    npm run build

Check dependency advisories:

    npm audit

Run E2E tests:

    npm run test:e2e

## Demo Evidence

Checkpoint 3 screenshots are available in `docs/screenshots/`:

| Screenshot | Evidence |
|---|---|
| [Home page](docs/screenshots/checkpoint3-home.png) | Home page |
| [Product catalog](docs/screenshots/checkpoint3-products.png) | Product catalog |
| [Product detail](docs/screenshots/checkpoint3-product-detail.png) | Product detail page |
| [Categories](docs/screenshots/checkpoint3-categories.png) | Category listing |
| [Register](docs/screenshots/checkpoint3-register.png) | Customer registration |
| [Login](docs/screenshots/checkpoint3-login.png) | Login page |
| [Admin dashboard](docs/screenshots/checkpoint3-admin-dashboard.png) | Admin product management |
| [Admin categories](docs/screenshots/checkpoint3-admin-categories.png) | Admin category management |

Original Checkpoint 2 screenshots are retained:

- [Home and products](docs/screenshots/home-products.png)
- [Product detail](docs/screenshots/product-detail.png)
- [Search and category filter](docs/screenshots/products-search-filter.png)

## Security Notes

The current authentication state and role-based page guard are client-side demonstrations. A production deployment must enforce authentication and authorization on the backend, including ownership checks for order history and order details and admin permissions for product/category management. Client-side localStorage values must not be treated as trusted authorization.

## Scope

This frontend continues the same repository and project structure used in the earlier checkpoints. New routes and tests are added alongside existing materials rather than creating a duplicate repository.

