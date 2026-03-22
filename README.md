# SuprFi - Embedded Consumer Financing Platform

**Status:** 📋 Planning Complete → Ready for Development  
**Timeline:** 12-16 weeks to MVP  
**Pilot Customers:** ProForce Pest Control, Rack Electric

---

## 🎯 What is SuprFi?

SuprFi is an embedded consumer financing platform for home service businesses. We allow technicians to offer "Pay Later" options to homeowners directly from their CRM (starting with FieldRoutes), creating a seamless financing experience without leaving their workflow.

### Key Features (MVP)
- 🔗 **CRM Integration** - Trigger financing offers from FieldRoutes
- 📱 **SMS-Based Application** - Borrowers apply via mobile-friendly link
- 🏦 **Bank Linking** - Plaid integration for instant verification
- ✅ **KYC/AML** - Persona identity verification
- 📊 **Credit Decisioning** - Built-in underwriting engine with manual review queue
- 💰 **Lender Network** - Route approved loans to funding partners
- 📈 **SuprOps Dashboard** - Internal admin tool for operations and analytics

---

## 📚 Documentation

All project documentation is in the `/docs` folder:

| Document | Purpose | Read This If... |
|----------|---------|-----------------|
| [PRD.md](./docs/PRD.md) | Product requirements & features | You want to understand WHAT we're building |
| [TECHNICAL_SPEC.md](./docs/TECHNICAL_SPEC.md) | Implementation plan & timeline | You want to understand HOW we're building it |
| [API_SPEC.md](./docs/API_SPEC.md) | Complete API documentation | You're integrating with our APIs |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design & infrastructure | You're working on backend/DevOps |
| [docs/README.md](./docs/README.md) | Documentation guide | You're new to the project |

**👉 Start here:** [docs/README.md](./docs/README.md)

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** (App Router) - Full-stack React framework
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Deployed to:** Vercel

### Backend
- **Node.js 20+** with TypeScript
- **Prisma** - Type-safe database ORM
- **BullMQ** - Job queue for async operations
- **Deployed to:** Vercel (API routes) + AWS ECS (microservices)

### Database & Storage
- **PostgreSQL** (Supabase) - Primary database
- **Redis** (Railway) - Job queue and caching
- **Supabase Storage** - KYC documents and signed agreements

### Authentication
- **Clerk** - User authentication and session management

### Third-Party Integrations
- **Plaid** - Bank account linking
- **Persona** - KYC/AML verification
- **Experian** - Credit bureau (soft pulls)
- **Twilio** - SMS delivery
- **FieldRoutes** - CRM integration

---

## 🚀 Getting Started

### Prerequisites
```bash
node >= 20.0.0
pnpm >= 8.0.0
docker >= 24.0.0
```

### Initial Setup (Week 1-2)

**Step 1: Clone and Install**
```bash
cd /Users/doug/Desktop/SuprFi
pnpm init
pnpm install next@latest react@latest react-dom@latest
pnpm install -D typescript @types/node @types/react
pnpm install @prisma/client prisma
pnpm install @clerk/nextjs
```

**Step 2: Initialize Next.js**
```bash
npx create-next-app@latest . --typescript --tailwind --app --use-pnpm
```

**Step 3: Set Up Database**
```bash
# Initialize Prisma
npx prisma init

# Copy schema from docs/TECHNICAL_SPEC.md to prisma/schema.prisma
# Update .env with Supabase connection string
# Run migration
npx prisma migrate dev --name init
```

**Step 4: Configure Environment Variables**
```bash
cp .env.example .env.local

# Fill in:
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
```

**Step 5: Start Development Server**
```bash
pnpm dev
# Open http://localhost:3000
```

---

## 📂 Project Structure (Planned)

```
SuprFi/
├── docs/                    # All documentation
│   ├── PRD.md
│   ├── TECHNICAL_SPEC.md
│   ├── API_SPEC.md
│   └── ARCHITECTURE.md
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── apply/[token]/   # Borrower application flow
│   │   ├── admin/           # SuprOps dashboard
│   │   └── api/v1/          # API routes
│   │       ├── crm/
│   │       ├── borrower/
│   │       ├── decision/
│   │       ├── admin/
│   │       └── webhooks/
│   │
│   ├── components/          # React components
│   │   ├── borrower/        # Application flow components
│   │   ├── admin/           # Dashboard components
│   │   └── ui/              # Shared UI (shadcn)
│   │
│   ├── lib/                 # Shared utilities
│   │   ├── prisma.ts        # Prisma client
│   │   ├── clerk.ts         # Auth utilities
│   │   ├── queue.ts         # BullMQ setup
│   │   └── integrations/    # Third-party SDKs
│   │       ├── plaid.ts
│   │       ├── persona.ts
│   │       ├── experian.ts
│   │       └── twilio.ts
│   │
│   └── services/            # Business logic
│       ├── decisioning/     # Scoring & offers
│       ├── crm-sync/        # FieldRoutes integration
│       └── lender/          # Lender adapters
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .github/
│   └── workflows/
│       └── ci.yml           # CI/CD pipeline
│
├── docker-compose.yml       # Local dev environment
├── package.json
└── README.md                # This file
```

---

## 🗓️ Development Roadmap

### Phase 0: Foundation (Week 1-2) ✅ Planning Complete
- [x] Requirements documented
- [x] Technical spec finalized
- [x] Architecture designed
- [ ] Project initialized
- [ ] Database schema created
- [ ] Auth configured
- [ ] CI/CD pipeline set up

### Phase 1: Borrower Flow MVP (Week 3-5)
- [ ] Frontend: Application flow UI
- [ ] Backend: Borrower API endpoints
- [ ] Integrations: Plaid + Persona (sandbox)
- [ ] Mock Experian credit bureau
- [ ] SMS delivery with Twilio

### Phase 2: Decisioning Engine (Week 6-7)
- [ ] Scoring algorithm
- [ ] Rule engine
- [ ] Offer generation
- [ ] Manual review queue

### Phase 3: CRM Integration (Week 8-9)
- [ ] Mock FieldRoutes API
- [ ] CRM Sync Service
- [ ] OAuth 2.0 flow
- [ ] Real FieldRoutes integration

### Phase 4: Lender Integration (Week 10-11)
- [ ] Lender adapter abstraction
- [ ] Mock lender implementation
- [ ] Job queue setup
- [ ] Webhook handlers

### Phase 5: SuprOps Admin (Week 12-13)
- [ ] Applications dashboard
- [ ] Manual review interface
- [ ] Loan management
- [ ] Analytics dashboard

### Phase 6: Security & Hardening (Week 14-15)
- [ ] PII encryption
- [ ] Audit logging
- [ ] Security testing
- [ ] Compliance docs

### Phase 7: Testing & QA (Week 15-16)
- [ ] Unit tests (80% coverage)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Load testing

### Phase 8: Pilot Launch (Week 16+)
- [ ] Production deployment
- [ ] Merchant onboarding
- [ ] Monitoring setup
- [ ] Customer support

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Testing Strategy
- **Unit tests**: Business logic, utilities (80% coverage target)
- **Integration tests**: API endpoints, database operations
- **E2E tests**: Critical user flows (borrower application, manual review)
- **Load tests**: 1000 concurrent users

---

## 🚢 Deployment

### Environments
- **Development**: Local (Docker Compose)
- **Staging**: Vercel Preview (auto-deploy on PR)
- **Production**: Vercel + AWS ECS

### Deploy to Production
```bash
# Automatic via CI/CD on merge to main
git push origin main

# Or manual deploy
vercel --prod
```

---

## 📊 Monitoring

### Dashboards
- **Vercel Analytics**: https://vercel.com/suprfi/analytics
- **Datadog**: https://app.datadoghq.com/dashboard/suprfi
- **Bull Board**: https://app.suprfi.com/admin/queue

### Key Metrics
- Application completion rate
- Approval rate by merchant
- Average time to decision
- Funding success rate
- API error rate
- P95 response time

---

## 🔐 Security

### Reporting Security Issues
**DO NOT** open a public GitHub issue for security vulnerabilities.

Email: security@suprfi.com (to be set up)

### Security Measures
- TLS 1.3 encryption (all traffic)
- AES-256 encryption at rest (PII)
- JWT with 15-min expiry
- Rate limiting (100 req/min)
- Audit logging (all PII access)
- Regular security audits

---

## 🤝 Contributing

### Workflow
1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and commit: `git commit -m "feat: add amazing feature"`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request
5. Wait for CI checks and review
6. Merge after approval

### Commit Convention
We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

---

## 📞 Support

### Internal Team
- **Product**: Doug
- **Engineering**: Doug + AI
- **Operations**: TBD

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Support](https://clerk.com/support)

---

## 📜 License

Proprietary - All Rights Reserved  
© 2025 SuprFi

---

## 🎯 Project Status

**Current Phase:** Planning Complete ✅  
**Next Milestone:** Foundation Phase (Week 1-2)  
**Target Launch:** Week 16+ (Pilot)

**Ready to start building!** 🚀

---

*Last updated: October 29, 2025*

