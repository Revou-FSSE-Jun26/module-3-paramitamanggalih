# RevoShop Frontend — Checkpoint 2

RevoShop is an online store frontend built with Next.js App Router, React, TypeScript, and Tailwind CSS. It fetches product, category, and order data from the Flask API developed in Module 2.

## Technologies

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Flask REST API
- PostgreSQL

## Features

- Reusable Header, Footer, Card, and ProductCard components
- Quantity counter and stock-aware product buttons
- Controlled product search
- Category filtering synchronized with URL query parameters
- Shopping cart summary with item count and total price
- Client-side Add Product form validation
- Server Component data fetching from Flask API
- Dynamic metadata for product detail pages
- Loading skeletons and friendly error states
- Responsive layouts

## Project Structure

- `app/` — pages, layouts, loading and error states
- `app/products/[id]/` — dynamic product detail page
- `components/` — reusable typed React components
- `lib/api.ts` — Flask API fetch utilities
- `types/product.ts` — shared TypeScript data types
- `docs/screenshots/` — local demo evidence

## Prerequisites

- Node.js 20.9 or later
- npm
- PostgreSQL and the Module 2 Flask API

## Environment Configuration

Create a local `.env.local` file with this variable:

`NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000`

The `.env.local` file must remain excluded from Git. Use `.env.example` as a reference for environment configuration. Never commit actual credentials or secret keys.

## Running Locally

Start the Flask API in a separate terminal:

    cd D:\revoshop-db
    .\venv\Scripts\Activate.ps1
    python run.py

Start Next.js in another terminal:

    cd D:\revoshop-checkpoint-2
    npm install
    npm run dev

Open http://localhost:3000 in your browser.

## API Endpoints

- `GET /products`
- `GET /products/<id>`
- `GET /categories`
- `GET /orders?limit=20&offset=0`

The Orders endpoint supports pagination to limit response size.

## Main Routes

| Route | Description |
|---|---|
| `/` | Home page with up to five featured products |
| `/products` | Product catalog, search, category filter, and cart summary |
| `/products/[id]` | Product details with dynamic metadata |
| `/categories` | Category listing and product counts |
| `/orders` | Recent orders and order items |

## Validation

TypeScript check:

    npx tsc --noEmit

Production build:

    npm run build

## Demo Evidence

Store local demo screenshots in `docs/screenshots/`. Include the Home page, product search and category filter, product detail with dynamic title, and loading/error states.

## Scope Note

The Add Product form currently updates local component state. Real POST, PUT, and DELETE operations, authentication, and checkout are reserved for Checkpoint 3.