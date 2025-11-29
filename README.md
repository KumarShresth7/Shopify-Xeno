# Xeno Shopify Data Ingestion & Insights Service

A production-ready, multi-tenant analytics platform designed to ingest data from Shopify stores and provide actionable real-time insights. This project was built as part of the Xeno FDE Internship Assignment 2025.

<img width="1901" height="978" alt="image" src="https://github.com/user-attachments/assets/b6a9527b-d9e5-4da5-b1aa-024ef6650594" />


## 🚀 Features

### Core Functionality
- **Multi-Tenancy:** Secure data isolation for multiple merchants using a single database architecture.
- **Shopify Integration:** Seamless ingestion of Products, Customers, and Orders via Shopify Admin API.
- **Insights Dashboard:** Interactive UI showing Total Revenue, Order trends, and Top Customers.
- **Authentication:** Secure Email/Password authentication with JWT for tenant onboarding.

### 🌟 Bonus & Advanced Features
- **Real-Time Updates:** The dashboard updates instantly (via SWR polling) when new data arrives.
- **Async Ingestion Engine:** Uses **Redis & BullMQ** to decouple data fetching from the API response, preventing timeouts and ensuring scalability.
- **Webhook Handling:** Listens for `carts/abandoned` and `checkouts/create` events for immediate data capture.
- **Automated Scheduler:** A cron job runs every 6 hours to keep core data (products/orders) in sync.
- **Dark Mode:** A fully responsive, aesthetic dark mode UI.
- **Advanced Analytics:** Conversion rates, product performance metrics, and customer segmentation (VIP, Regular, New).

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI concepts
- **State/Fetching:** SWR (Stale-While-Revalidate)
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js & Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Queue:** Redis + BullMQ
- **Scheduling:** Node-Cron
- **Validation:** Express-Validator

---

## 🏗️ Architecture

```mermaid
graph TD
    User[Merchant] -->|HTTPS| FE[Next.js Frontend]
    FE -->|REST API| BE[Express Backend]
    
    subgraph "Backend Infrastructure"
        BE -->|Auth & Queries| DB[(PostgreSQL)]
        BE -->|Offload Jobs| Redis[(Redis Queue)]
        Worker[Background Worker] -->|Process Jobs| Redis
        Worker -->|Write Data| DB
    end
    
    subgraph "External Services"
        Shopify[Shopify API]
        Shopify -->|Webhooks| BE
        Worker -->|Fetch Data| Shopify
    end
