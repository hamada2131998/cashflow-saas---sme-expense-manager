
import express, { Request, Response } from 'express';
import cors from 'cors';
// Fix: Import PrismaClient from @prisma/client using namespace for better compatibility
import * as PrismaModule from '@prisma/client';
import { authenticate, AuthRequest } from './middleware';
import expenseRoutes from './routes/expenses';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import custodyRoutes from './routes/custody';

// Fix: Initialize PrismaClient using the imported namespace
const prisma = new PrismaModule.PrismaClient();
const app = express();

app.use(cors());
// Fix: Explicitly cast express.json() to any to avoid middleware overload issues in certain TS environments
app.use(express.json() as any);

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'CONNECTED', timestamp: new Date() });
  } catch (e) {
    res.status(500).json({ status: 'ERROR', database: 'DISCONNECTED' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', authenticate, expenseRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/custody', authenticate, custodyRoutes);

// Audit Logs (Scoped)
// Fix: Using standard Request type and casting inside to AuthRequest for type safety and router compatibility
app.get('/api/audit-logs', authenticate, (async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const logs = await prisma.auditLog.findMany({
    where: { companyId: authReq.user!.companyId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, role: true } } }
  });
  // Fix: res.json() property is now accessible by ensuring types don't conflict with DOM
  res.json(logs);
}) as any);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
