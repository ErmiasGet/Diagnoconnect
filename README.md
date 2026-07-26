# DiagnoConnect

> **Connecting Patients, Hospitals, Doctors and Diagnostic Centers on One Intelligent Platform.**

DiagnoConnect is a production-ready, enterprise-grade Healthcare SaaS platform that digitally connects patients, hospitals, clinics, diagnostic centers, pharmacies, doctors, and insurance companies into one integrated ecosystem.

## Architecture

```
DiagnoConnect
├── packages/
│   ├── backend/          # Node.js + Express + TypeScript + Prisma + PostgreSQL
│   └── shared/           # Shared types, constants, utilities
├── apps/
│   ├── patient-portal/   # React + Vite + TailwindCSS + ShadCN UI
│   ├── admin-dashboard/  # React + Vite + TailwindCSS + Recharts
│   ├── reception-desktop/# Electron + React (Offline-capable)
│   └── mobile-app/       # React Native + Expo + NativeWind
├── nginx/                # Reverse proxy configuration
├── scripts/              # Setup, backup, deployment scripts
├── docker-compose.yml    # Full Docker stack
└── .github/workflows/    # CI/CD pipeline
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Redis, Socket.IO |
| **Patient Portal** | React 18, Vite, TypeScript, TailwindCSS, ShadCN UI, React Query |
| **Admin Dashboard** | React 18, Vite, TypeScript, Recharts, ShadCN UI |
| **Desktop App** | Electron, React, TypeScript, Offline Support |
| **Mobile App** | React Native, Expo, NativeWind, Zustand |
| **DevOps** | Docker, Nginx, GitHub Actions CI/CD |

## Features

### Multi-Tenant SaaS
- Unlimited organizations with complete data isolation
- Subscription plans: Free, Basic, Professional, Enterprise
- Organization-specific branding and configuration

### Patient Workflow
1. **Reception** → Patient Registration, Queue Assignment
2. **Doctor** → Consultation, SOAP Notes, Prescriptions, Lab/Radiology Orders
3. **Laboratory** → Sample Collection, Test Results, Approval
4. **Radiology** → Imaging, Reports, Doctor Review
5. **Pharmacy** → Prescription Processing, Medicine Dispensing
6. **Billing** → Invoice Generation, Payment Processing
7. **Insurance** → Claim Submission, Verification, Settlement

### Core Modules
- **Authentication** → JWT, Refresh Tokens, MFA, OAuth, OTP
- **Patient Management** → Registration, Medical Records, History
- **Appointments** → Online Booking, Walk-in, Calendar, Availability
- **Queue Management** → Real-time Queue, Priority, Display Screens
- **EMR** → SOAP Notes, Vitals, Diagnosis, Treatment Plans
- **Laboratory** → Tests, Results, Sample Tracking, Reports
- **Radiology** → X-Ray, CT, MRI, Image Upload, Reports
- **Pharmacy** → Inventory, Stock, Expiry, Dispensing
- **Billing** → Invoices, Payments, Refunds, Tax
- **Insurance** → Providers, Policies, Claims
- **Notifications** → Email, SMS, Push, In-App
- **Chat** → Real-time Messaging, File Sharing
- **Telemedicine** → Video/Audio Calls, Screen Sharing
- **Reports** → Analytics, Revenue, Patient, Lab Reports
- **Payments** → ArifPay, Chapa, Stripe, PayPal, Cash

### Security
- JWT with Refresh Token Rotation
- Role-Based Access Control (RBAC)
- Multi-tenant Data Isolation
- Rate Limiting
- Audit Logging
- HIPAA-inspired Practices
- XSS/CSRF/SQL Injection Protection
- Encrypted Passwords (bcrypt)

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (recommended)

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/ErmiasGet/diagnosconnect.git
cd diagnosconnect
cp .env.example .env
docker compose up -d
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx tsx src/database/seed.ts
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Setup database
cd packages/backend
cp .env.example .env
# Update DATABASE_URL in .env
npx prisma migrate dev
npx prisma generate
npx tsx src/database/seed.ts

# Start backend
npm run dev

# Start patient portal (new terminal)
cd apps/patient-portal
npm run dev

# Start admin dashboard (new terminal)
cd apps/admin-dashboard
npm run dev
```

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@diagnosconnect.com | Admin@123 |
| Hospital Admin | admin@citygeneral.hospital | Admin@123 |
| Receptionist | reception@citygeneral.hospital | Admin@123 |
| Doctor | abebe@citygeneral.hospital | Admin@123 |
| Lab Technician | labtech@citygeneral.hospital | Admin@123 |
| Pharmacist | pharmacy@citygeneral.hospital | Admin@123 |
| Cashier | cashier@citygeneral.hospital | Admin@123 |

## URLs

| Application | URL |
|-------------|-----|
| Patient Portal | http://localhost:5173 |
| Admin Dashboard | http://localhost:5174 |
| Reception Desktop | http://localhost:5175 |
| Backend API | http://localhost:3000/api/v1 |

## API Documentation

The backend provides RESTful APIs for all modules:

### Authentication
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh Token
- `GET /api/v1/auth/profile` - Get Profile

### Patients
- `GET /api/v1/patients` - List patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients/:id` - Get patient
- `PATCH /api/v1/patients/:id` - Update patient
- `GET /api/v1/patients/:id/medical-history` - Medical history

### Visits
- `GET /api/v1/visits` - List visits
- `POST /api/v1/visits` - Create visit
- `GET /api/v1/visits/:id` - Get visit
- `PATCH /api/v1/visits/:id/status` - Update status

### Appointments
- `GET /api/v1/appointments` - List appointments
- `POST /api/v1/appointments` - Book appointment
- `PATCH /api/v1/appointments/:id/cancel` - Cancel
- `POST /api/v1/appointments/:id/check-in` - Check in

### And many more...

## Project Structure

```
src/
├── config/           # Database, Redis, environment config
├── middleware/        # Auth, RBAC, rate limiting
├── utils/            # Logger, email, tokens, audit, helpers
├── modules/
│   ├── auth/         # Authentication & authorization
│   ├── patients/     # Patient management
│   ├── visits/       # Visit tracking
│   ├── appointments/ # Appointment booking
│   ├── queue/        # Queue management
│   ├── doctors/      # Doctor profiles & schedules
│   ├── departments/  # Department management
│   ├── rooms/        # Room management
│   ├── prescriptions/# Prescription management
│   ├── laboratory/   # Lab tests & results
│   ├── radiology/    # Radiology requests & reports
│   ├── pharmacy/     # Medicine inventory & dispensing
│   ├── billing/      # Invoices & payments
│   ├── insurance/    # Insurance providers & claims
│   ├── emr/          # Electronic medical records
│   ├── notifications/# Multi-channel notifications
│   ├── reports/      # Analytics & reports
│   ├── chat/         # Real-time messaging
│   ├── files/        # File management
│   ├── payments/     # Payment processing
│   └── settings/     # Organization settings
├── socket/           # WebSocket handlers
├── jobs/             # Background tasks (cron)
└── database/         # Seed data
```

## Deployment

### Docker Compose (Recommended)
```bash
docker compose up -d
```

### AWS / Azure / DigitalOcean
See deployment documentation in `/docs`

### CI/CD
GitHub Actions pipeline automatically:
1. Runs linting and type checks
2. Runs unit and integration tests
3. Builds Docker images
4. Deploys to production

## Development

```bash
# Run tests
npm test

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Database studio
npm run db:studio

# Generate Prisma client
npm run db:generate
```

## License

Proprietary - All rights reserved.

---

**Built with care for healthcare.**
