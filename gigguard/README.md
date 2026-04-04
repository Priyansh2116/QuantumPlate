# GigGuard — AI-Powered Parametric Income Insurance for Gig Workers

> Guidewire DEVTrails 2026 · Phase 2 Submission

GigGuard is a full-stack parametric insurance platform that automatically pays gig delivery workers (Blinkit, Zepto, Swiggy Instamart) when measurable disruptions — heavy rain, extreme heat, AQI alerts, zone shutdowns, demand collapse — breach predefined thresholds. No claim forms. No human adjudication. Instant UPI payout.

---

## Features

### Core Insurance Engine
- **Parametric triggers** — 5 event types with actuarial thresholds, evaluated every 30 minutes
- **AI premium formula** — `(E_h × L_h × R) + F − D` using XGBoost risk scores and behavioral discounts
- **Auto-payout** — approved claims initiate UPI transfer immediately via Razorpay
- **Two-layer fraud detection** — GPS zone mismatch + activity anomaly (Layer 1), Isolation Forest adverse-selection pattern (Layer 2)

### 5 Parametric Triggers
| Trigger | Threshold |
|---|---|
| Rainfall | >35mm/hr sustained for 90 min |
| AQI | NAQI >300 + official advisory |
| Zone Shutdown | Official curfew for 4+ hours |
| Demand Collapse | >50% order drop for 3 hours |
| Extreme Heat | >44°C between 11AM–4PM |

### Full-Stack Architecture
- **Next.js 16** (App Router) with TypeScript
- **PostgreSQL** via Prisma ORM (Prisma 7 with `@prisma/adapter-pg`)
- **JWT authentication** — stateless, issued on registration and OTP login
- **OpenWeatherMap API** — live weather + AQI with mock fallback when no key configured
- **Razorpay SDK** — order creation, signature verification, simulated UPI payout
- **Zod validation** on all API routes
- **Three.js / React Three Fiber** — 3D zone risk map with extruded risk blocks and rain particles
- **Docker + Docker Compose** — production-ready multi-stage build

### Pages
| Route | Description |
|---|---|
| `/` | Landing page with 3D globe hero |
| `/register` | 2-step worker onboarding |
| `/dashboard` | Earnings chart, zone risk, behavioral score gauge |
| `/policies` | AI-computed weekly premium quote + purchase |
| `/claims` | Parametric trigger evaluation + claim history |
| `/map` | 3D Bengaluru zone risk map |
| `/admin` | Platform overview (worker/policy/claim stats) |

---

## Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL (or Docker)

### 1. Clone and install

```bash
git clone https://github.com/Priyansh2116/QuantumPlate.git
cd QuantumPlate/gigguard
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` — the only required value is `DATABASE_URL`. Everything else has working defaults or falls back to simulation mode:

```env
DATABASE_URL="postgresql://gigguard:gigguard@localhost:5432/gigguard"
JWT_SECRET="your-secret-here"

# Optional — leave empty for mock data
OPENWEATHER_API_KEY=""
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

### 3. Start Postgres

```bash
docker compose up postgres -d
```

### 4. Migrate and seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Run dev server

```bash
npm run dev
```

Open http://localhost:3000

**Demo account (pre-seeded):** Register at `/register` or use phone `9876543210` → OTP is printed in terminal.

---

## Running with Docker (production)

```bash
docker compose up --build
```

Starts Postgres, runs migrations, seeds demo data, and serves the app at http://localhost:3000.

---

## Deploying to GitHub + Vercel

### Push to GitHub

```bash
git add .
git commit -m "feat: GigGuard parametric insurance platform"
git push origin main
```

### Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the repo
2. Set **Root Directory** to `gigguard`
3. Add environment variables in Vercel dashboard (same as `.env.example`)
4. For `DATABASE_URL`, use a hosted Postgres — [Neon](https://neon.tech) (free tier) is recommended:
   ```
   postgresql://user:pass@ep-xxx.neon.tech/gigguard?sslmode=require
   ```
5. Deploy — Vercel auto-detects Next.js

After first deploy, run migrations against your hosted DB:

```bash
DATABASE_URL="your-neon-url" npx prisma migrate deploy
DATABASE_URL="your-neon-url" npx prisma db seed
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/workers` | Register worker, returns JWT |
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP, returns JWT |
| POST | `/api/premium` | Compute AI premium quote |
| GET/POST | `/api/policies` | Get policies / purchase policy |
| POST | `/api/policies/verify-payment` | Verify Razorpay signature, activate policy |
| GET/POST | `/api/claims` | Get claims / evaluate triggers |
| GET | `/api/zone-data` | Live zone weather + risk data |

---

## Project Structure

```
gigguard/
├── app/                    # Next.js App Router pages + API routes
│   ├── api/                # REST API handlers
│   ├── dashboard/          # Worker dashboard
│   ├── policies/           # Policy management
│   ├── claims/             # Claims + trigger simulation
│   └── map/                # 3D zone map
├── components/             # Shared UI components (ZoneMap3D, MetricGauge, etc.)
├── lib/                    # Core business logic
│   ├── auth.ts             # JWT sign/verify
│   ├── db.ts               # Prisma client singleton
│   ├── weather.ts          # OpenWeatherMap + mock zone data
│   ├── premium.ts          # AI premium formula
│   ├── triggers.ts         # Parametric trigger evaluation
│   ├── fraud.ts            # Two-layer fraud detection
│   └── razorpay.ts         # Payment order + payout
├── prisma/
│   ├── schema.prisma       # DB schema (Worker, Policy, Claim, OtpCode)
│   └── seed.ts             # Demo data seed
├── prisma.config.ts        # Prisma 7 config
├── docker-compose.yml      # Postgres + app services
└── Dockerfile              # Multi-stage production build
```

---

## Built for Guidewire DEVTrails 2026

This project addresses the protection gap for India's 15M+ gig delivery workers who have no access to traditional employment benefits. Parametric insurance removes the subjectivity of claims — if the threshold is breached, the payout is automatic. No paperwork, no disputes, no delay.
