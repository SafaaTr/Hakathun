# Rafeeq Backend Platform (NestJS + MongoDB) — Version 1.2

High-performance, modular, and enterprise-grade RESTful API backend for **Rafeeq (رفيق)** Pet Care Platform, engineered using **NestJS 10**, **TypeScript**, **Mongoose (MongoDB)**, and **Swagger OpenAPI 3.0** strictly adhering to the **Version 1.2 System Specification (November 2026)**.

---

## 🌟 Version 1.2 Architecture & Changes

- **Strict Single Role Matrix (No Dual Roles)**: Each user account holds exactly one role (`['pet_owner']`, `['veterinarian']`, `['host_caregiver']`, `['store_owner']`, or `['admin']`).
- **Super Admin-Only Creation**: Public registration (`/api/v1/auth/register`) strictly registers `pet_owner` accounts. Providers (`veterinarian`, `host_caregiver`, `store_owner`) are created exclusively by the Super Admin via `/admin/*`.
- **Native Veterinarian Module (`VetModule`)**: Fully integrated into the platform database using `vet_profiles` and `vet_slots` schemas with weekly slot management and Day Strip support.
- **Soft Deactivation (`status: 'unavailable' | 'closed'`)**: In accordance with NFR-06, doctors, hosts, and stores are soft-deactivated without physical deletion, preserving all historical records and bookings.
- **Dynamic Reviews & Mutual Ratings**: Aggregation of `avgRating` and `ratingsCount` calculated via MongoDB aggregations for doctors, hosts, and pet owners.

---

## 🚀 Getting Started

### 1. Requirements
- Node.js >= 18
- MongoDB Server running on `127.0.0.1:27017`

### 2. Configuration (`.env`)
```env
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/rafeeq_db
JWT_SECRET=rafeeq_super_secret_jwt_key_2026
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Start production server
npm run start:prod
```

Interactive Swagger documentation is available at:
👉 **`http://localhost:3001/api/v1/docs`**

---

## 🔐 Seeded Accounts for Testing & Graduation Demo

| Role | Username / Identifier | Password | Details |
|---|---|---|---|
| **Super Admin** | `admin@rafeeq.sy` | `Admin@2026` | Full platform dashboard, manage doctors, hosts, stores, view pet owners |
| **Doctor 1** | `Dr. Zaid Khouri` (`0933112244`) | `VetPass123` | Shaalan Pet Clinic, Damascus (pre-seeded with weekly slots) |
| **Doctor 2** | `Dr. Nour Salem` (`0944887766`) | `VetPass123` | Mezzeh Autostrad Vet, Damascus (pre-seeded with weekly slots) |
| **Host Caregiver 1** | `Nasser Al-Homsi` (`0944000001`) | `HostPass123` | Damascus Mezzeh, Free Home Hosting (Cats & Small Dogs) |
| **Host Caregiver 2** | `Sami Barakat` (`0944000002`) | `HostPass123` | Qudsaya Barn, Paid 25,000 SYP/day (Dogs & Large Pets) |
| **Store Owner** | `maya@happypaws.sy` (`0933557799`) | `StorePass123` | Happy Paws Pet Store, Damascus Malki |
| **Pet Owner** | Registered dynamically via `/auth/register` | User chosen | Pets, shopping, booking vet appointments and caregivers |

---

## 📋 Comprehensive API Catalog (`/api/v1`)

### 1. Authentication & Profile
- `POST /api/v1/auth/register` - Public registration for pet owners only.
- `POST /api/v1/auth/login` - Authenticate all roles and issue JWT Bearer Token.
- `GET /api/v1/me/profile` - Dynamic profile (pet owner, veterinarian, host caregiver, store owner).
- `PATCH /api/v1/me/profile` - Update profile details (FR-13).

### 2. Pets Management
- `POST /api/v1/pets` - Register pet profile (`PET-XXXXXX`).
- `GET /api/v1/pets` - List current user's pets.
- `GET /api/v1/pets/:id` - Get pet details by ID.

### 3. Stores, Products, Cart & Orders
- `GET /api/v1/stores` - List active stores (`status: 'active'`).
- `GET /api/v1/stores/:id/products` - List products in store.
- `POST /api/v1/cart/items` - Add product to cart.
- `GET /api/v1/cart` - View cart items.
- `POST /api/v1/orders/checkout` - Checkout COD (`ORD-XXXXXX`).

### 4. Veterinarians & Appointments
- `GET /api/v1/doctors` - List available doctors with address and rating summary.
- `GET /api/v1/doctors/:doctorId/slots` - Get available weekly slots (`SlotDto[]`).
- `POST /api/v1/slots/vet` - Veterinarian adds weekly available slot.
- `GET /api/v1/appointments/vet` - Veterinarian views incoming appointment bookings.
- `POST /api/v1/bookings-vet` - Pet owner requests clinic appointment (`VET-XXXXXX`).
- `PATCH /api/v1/bookings-vet/:id/status` - Veterinarian approves or rejects appointment.

### 5. Host Caregivers & Bookings
- `GET /api/v1/hosts` - Browse available host caregivers (`status: 'available'`).
- `POST /api/v1/host-bookings` - Pet owner books caregiver (`HST-XXXXXX`).
- `GET /api/v1/host-bookings/incoming` - Host caregiver views incoming booking requests.
- `PATCH /api/v1/host-bookings/:id/confirm` - Host caregiver confirms booking.

### 6. Reviews & Ratings
- `POST /api/v1/reviews` - Submit review (1-5) for completed booking (`RVW-XXXXXX`).
- `GET /api/v1/reviews/:targetType/:targetId` - Get aggregated ratings and reviews.

### 7. Super Admin Console
- `GET /api/v1/admin/stats` - Platform KPIs (users, pets, stores, orders, bookings).
- `GET /api/v1/admin/pet-owners` - Read-only view of registered pet owners and pet counts.
- `GET /api/v1/admin/hosts` - Manage all host caregivers and their status.
- `POST /api/v1/admin/hosts` - Create new host caregiver account.
- `PATCH /api/v1/admin/hosts/:id` - Soft-deactivate host caregiver (`status: 'unavailable'`).
- `GET /api/v1/admin/doctors` - Manage all veterinarians and their status.
- `POST /api/v1/admin/doctors` - Create new veterinarian account.
- `PATCH /api/v1/admin/doctors/:id` - Soft-deactivate veterinarian (`status: 'unavailable'`).
- `GET /api/v1/admin/stores` - List stores.
- `POST /api/v1/admin/stores` - Create store and assign owner.
- `PATCH /api/v1/admin/stores/:id` - Update store status (`closed` / `active`).

---

## 🧪 Automated Testing
Run the comprehensive end-to-end integration test suite:
```bash
python test_e2e.py
```
Validates all endpoints, role restrictions, reference codes, and validation rules against the live server.
