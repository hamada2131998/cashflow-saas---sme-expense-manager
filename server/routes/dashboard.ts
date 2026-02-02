
import { Router, Request, Response } from 'express';
import * as PrismaModule from '@prisma/client';
import { AuthRequest } from '../middleware';

const router = Router();
const prisma = new PrismaModule.PrismaClient();

router.get('/summary', (async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const companyId = authReq.user!.companyId;

  try {
    const [approvedExpenses, pendingCount, custodyAgg] = await Promise.all([
      prisma.expense.findMany({ 
        where: { companyId, status: 'APPROVED' },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.expense.count({ where: { companyId, status: 'PENDING' } }),
      prisma.custody.aggregate({ where: { companyId }, _sum: { currentBalance: true } })
    ]);

    const totalApproved = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Prepare Daily Series for Recharts
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const spendingSeries = last7Days.map(date => {
      const dayTotal = approvedExpenses
        .filter(e => e.createdAt.toISOString().split('T')[0] === date)
        .reduce((sum, e) => sum + e.amount, 0);
      return { date, amount: dayTotal };
    });

    // Top Employees logic
    const topSpend = await prisma.expense.groupBy({
      by: ['employeeId'],
      where: { companyId, status: 'APPROVED' },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    });

    const topEmployees = await Promise.all(topSpend.map(async (item) => {
      const user = await prisma.user.findUnique({ where: { id: item.employeeId }, select: { name: true } });
      return { name: user?.name || 'Unknown', total: item._sum.amount || 0 };
    }));

    // Fix: res.json() recognized correctly
    res.json({
      totalApproved,
      pendingCount,
      totalCompanyCustody: custodyAgg._sum.currentBalance || 0,
      spendingSeries,
      topEmployees
    });
  } catch (error) {
    // Fix: res.status() recognized correctly
    res.status(500).json({ error: 'Dashboard data fetch failed' });
  }
}) as any);

export default router;
