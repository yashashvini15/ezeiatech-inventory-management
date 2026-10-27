# Smart Inventory & Order Management System

A full-stack system for a small business. Admin manages products and stock, customers
place orders, staff/admin process them, and stock updates automatically at every step.

**Main flow:** Add Product -> Add Stock -> Customer Cart -> Place Order -> Stock Reduced
-> Confirmed -> Packed -> Shipped -> Delivered (cancel before shipping restores stock).

## Tech stack
| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 4.1, Spring Security, Spring Data JPA (Hibernate), JWT, bcrypt |
| Database | PostgreSQL 16 |
| Frontend | React, Vite, React Router, Axios, Redux Toolkit, MUI |
| DevOps | Docker, Docker Compose, nginx |
| Tools | IntelliJ, Git/GitHub, Postman |

## Architecture
```
Browser --> nginx (port 3000) --+--> serves React build (static files)
                                +--> /api/*  --> Spring Boot (8080, internal only) --> PostgreSQL
```
Backend layers: `controller` (HTTP) -> `service` (business rules, transactions) ->
`repository` (database). DTOs are used for every request/response; entities are never exposed.

## Roles
| Role | Can do |
|---|---|
| ADMIN | Everything: products, categories, suppliers, add stock, orders, customers, reports |
| STAFF | View products/inventory/customers, process orders, raise restock requests |
| CUSTOMER | Register/login, browse, cart, place orders, view/cancel own orders |

## Quick start with Docker
1. Install Docker Desktop.
2. `cp .env.example .env` and edit values (set `DB_PASSWORD`, and a `JWT_SECRET`:
   `openssl rand -base64 32`).
3. Start everything:
   ```
   docker compose --profile app up -d --build
   ```
4. Load sample data (after backend has started once):
   ```
   docker exec -i inventory-postgres psql -U <DB_USER> -d <DB_NAME> < sample-data/seed.sql
   ```
5. Open http://localhost:3000

Demo logins (from seed.sql; change before any real use):
`admin@email.com / Admin@12345`, `staff@email.com / Staff@12345`, `customer@email.com / Customer@12345`

Stop: `docker compose --profile app down` (data is kept in the `pgdata` volume).

## Run locally for development
1. `docker compose up -d` (starts only PostgreSQL).
2. Backend: open `backend/backend` in IntelliJ, set the env variables from `.env`
   (or put a `.env` file in `backend/backend`), run `BackendApplication` (port 8080).
3. Frontend: `cd frontend && npm install && npm run dev` (port 5173).
   Set `VITE_API_URL=http://localhost:8080/api` in `frontend/.env.local` if needed.

## Environment variables
| Variable | Purpose | Default |
|---|---|---|
| DB_HOST / DB_NAME / DB_USER / DB_PASSWORD | PostgreSQL connection | localhost / - / - / - |
| JWT_SECRET | Base64 secret, min 32 bytes | required |
| JWT_EXPIRATION_MS | Token lifetime | 7200000 (2 h) |
| CORS_ALLOWED_ORIGINS | Allowed frontend origin(s) | http://localhost:5173 |
| ORDER_TAX_RATE | Tax rate on orders | 0.18 |
| REPORT_ZONE | Time zone for reports | Asia/Kolkata |
| LOGIN_MAX_ATTEMPTS / LOGIN_MAX_ATTEMPTS_PER_IP / LOGIN_WINDOW_SECONDS | Login rate limit | 5 / 20 / 900 |
| FORWARD_HEADERS_STRATEGY | Trust proxy IP header (`native` in Docker) | none |
| FRONTEND_PORT, DOCKERHUB_USER, IMAGE_TAG | Docker only | 3000 / local / latest |

Never commit `.env`. Only `.env.example` is committed.

## Docker Hub images
`yashu15/inventory-backend` and `yashu15/inventory-frontend` (tags `1.0.0`, `latest`).
```
docker compose --profile app pull
docker compose --profile app up -d
```

## Database
Tables are created automatically by Hibernate on first start (`ddl-auto=update`).
Main tables: `users`, `categories`, `suppliers`, `products`, `orders`, `order_items`,
`inventory_movements`, `order_history`, `restock_requests`.
Relations: customer 1-N orders, category 1-N products, supplier 1-N products,
order 1-N items, product 1-N inventory movements, order 1-N order history.

## API summary (base path `/api`)
| Area | Endpoint | Access |
|---|---|---|
| Auth | POST `/auth/register`, POST `/auth/login` | Public |
| Auth | GET `/auth/me` | Any logged-in user |
| Catalog | GET `/catalog/products`, `/catalog/products/{id}` | Any logged-in user |
| Categories | GET `/categories` / POST `/categories` | Any / Admin |
| Suppliers | GET, POST, PUT `/suppliers` | Admin |
| Products | GET `/products`, `/products/{id}` | Admin, Staff |
| Products | POST, PUT `/products/{id}`, PATCH `/products/{id}/activate`, DELETE `/products/{id}` (deactivates) | Admin |
| Inventory | POST `/inventory/add` | Admin |
| Inventory | GET `/inventory/movements`, `/inventory/low-stock` | Admin, Staff |
| Orders | POST `/orders` | Customer |
| Orders | GET `/orders`, `/orders/{id}` | Role-based (customer sees only own) |
| Orders | PATCH `/orders/{id}/status` | Admin, Staff |
| Orders | POST `/orders/{id}/cancel` | Owner customer, or Admin/Staff (only while PLACED) |
| Customers | GET `/customers` / PATCH `/customers/{id}/status` | Admin, Staff / Admin |
| Dashboard | GET `/dashboard/stats` | Admin, Staff (revenue hidden for Staff) |
| Reports | GET `/reports/sales` | Admin |
| Restock | POST `/restock-requests` / GET / PATCH `/{id}/dismiss` | Staff / Admin+Staff / Admin |

Lists support server-side pagination (`page`, `limit`, max 100), search and filters.
Errors always return `{ "success": false, "message": "...", "data": null }`.

## Business rules
- Order is rejected if quantity is more than available stock or product is inactive.
- Stock decreases when the order is created and every change is saved in `inventory_movements`.
- Order flow: PLACED -> CONFIRMED -> PACKED -> SHIPPED -> DELIVERED. Cancel only from PLACED
  (stock is restored and a movement is recorded). Every status change is saved in `order_history`.
- LOW STOCK when `stock <= reorderLevel`. Stock changes only through Inventory (never via product update).
- Only Admin adds stock. A customer can see only their own orders.
- Products are deactivated, never hard-deleted. SKU and category/supplier names are unique.
- Order items store a snapshot of name, SKU and price at order time.

## Security
bcrypt password hashing, JWT (2 h) with role loaded from DB on every request, role-based access,
login rate limit (429), input validation + sanitising, security headers (CSP, X-Frame-Options,
Referrer-Policy, nosniff), CORS allow-list, no password in any response, containers run as non-root,
backend port not published (only nginx can reach it), secrets only via environment variables.

## Testing
- Unit tests (17): `cd backend/backend && ./mvnw test` (no database needed).
- API tests: import `postman/Ezeiatech-FINAL.postman_collection.json` and an environment
  (`local` = backend on 8080, `docker` = through nginx on 3000). Run folders 00 to 23 in order
  with the Collection Runner. Folder 23 triggers the rate limit: run it once per 15 minutes.

## Project structure
```
inventory-management/
  backend/backend/   Spring Boot app (controller, service, repository, entity, dto, security, config)
  frontend/          React app + Dockerfile + nginx.conf
  postman/           Collection + environments
  sample-data/       seed.sql
  docker-compose.yml, .env.example, README.md
```

## Git branches
`main`, `develop`, `feature/authentication`, `feature/products`, `feature/inventory`,
`feature/orders`, `feature/dashboard`, `feature/restock-requests`, `feature/security-hardening`.

## Known limitations / future scope
Redis cache (stale-stock trade-off), shared rate-limit store for multiple instances, refresh tokens,
HttpOnly cookie, Flyway migrations instead of `ddl-auto=update`, Testcontainers integration tests,
HTTPS termination, online payments, RabbitMQ/Kafka for order events.
