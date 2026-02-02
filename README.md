
# CashFlow SaaS Pro 🚀

## Quick Start
1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Database Setup**
   - Create a Postgres DB.
   - Update `DATABASE_URL` in `.env`.
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

3. **Run Services**
   - Terminal 1 (Backend): `npm run dev:server`
   - Terminal 2 (Frontend): `npm run dev:client`

## Security Principles
- **Multi-tenancy**: Every Prisma call includes `where: { companyId }`.
- **Transactions**: Atomic updates for custody balances.
- **Audit**: Immutable JSON logs for every financial event.

## Smoke Tests
```bash
# Ping Auth
curl -X POST http://localhost:3000/api/auth/login -d '{"email":"owner@tech.com"}'

# Create Expense (Needs Token)
curl -X POST http://localhost:3000/api/expenses -H "Authorization: Bearer <TOKEN>"
```
