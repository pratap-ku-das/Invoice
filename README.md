# Invoice Management System

Production-ready Invoice & Billing system (Vyapar / My BillBook inspired) for Indian GST businesses.

**Stack:** NestJS + MongoDB (Mongoose) API · React + Vite + Tailwind client · npm workspaces monorepo.

## Features

- **Documents** — Invoices, Estimates/Quotations, Delivery Challans, Sales Returns, Purchase Bills/Orders/Returns, with conversion flows (estimate → invoice, PO → bill), duplication, cancellation, locking, and per-type number sequences.
- **GST tax engine** — CGST/SGST vs IGST by GSTIN state code, tax-inclusive pricing, line & document discounts, cess, round-off, amount in words (Indian numbering). Mirrored on the client for live totals preview.
- **Parties** — Customers & suppliers with ledgers, balances, credit limits.
- **Catalog** — Products/services, categories, units (auto-seeded), price list, SKU generation, barcode/SKU scanner lookup.
- **Inventory** — Stock movements, adjustments, low-stock alerts, stock valuation; stock validated and moved transactionally with documents.
- **Payments & Expenses** — Multi-mode payments (cash/UPI/bank/cheque/card), payment allocation against documents, expense tracking with categories.
- **PDF printing** — 8 themes + thermal receipts via Handlebars + Puppeteer, UPI payment QR on invoices, barcode label sheets, bulk PDF export.
- **Reports** — Sales/purchase/profit, sales series, top customers, party ledger, GST summary / HSN / GSTR-1.
- **Dashboard, notifications, audit log, JWT auth (access+refresh), role-based access (admin/manager/staff), Swagger docs.**

## Getting started

Requires **Node.js ≥ 20**. MongoDB must run as a replica set (transactions are used).

```bash
npm install

# 1. Database — pick one:
docker compose up -d          # if you have Docker, or:
npm run dev:db -w server      # no Docker needed (downloads mongod, persists to server/.mongo-data)

# 2. Server env
cp server/.env.example server/.env

# 3. Run both apps
npm run dev
```

- Client: http://localhost:5173 (register your company on first run)
- API: http://localhost:3000/api — Swagger at http://localhost:3000/api/docs

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Server (watch) + client (Vite) concurrently |
| `npm run dev:db -w server` | Local single-node Mongo replica set without Docker |
| `npm run build` | Build server then client |
| `npm test` | Jest (server) + Vitest (client) |
| `npm run lint` | ESLint both workspaces |

## Project layout

```
server/  NestJS API — src/modules/{auth,users,company,parties,catalog,documents,
         payments,expenses,inventory,dashboard,reports,pdf,audit,notifications}
client/  React app — src/pages, src/components, src/hooks/useCrud.ts (generic CRUD),
         src/lib/tax.ts (client mirror of the GST engine)
```
