
import { Router, Request, Response } from 'express';
import * as PrismaModule from '@prisma/client';
import { AuthRequest, authorize } from '../middleware';

const router = Router();
const prisma = new PrismaModule.PrismaClient();

router.get('/', (async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { companyId, role, id } = authReq.user!;
  
  const custody = await prisma.custody.findMany({
    where: {
      companyId,
      ...(role === 'EMPLOYEE' ? { userId: id } : {})
    },
    include: { user: { select: { name: true, email: true } } }
  });
  
  // Fix: res.json() recognized correctly
  res.json(custody);
}) as any);

// Adjust custody (Top up or manual adjust)
router.patch('/:userId/adjust', authorize(['OWNER', 'ACCOUNTANT']), (async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  // Fix: params and body recognition
  const { userId } = authReq.params;
  const { amount } = authReq.body;
  const companyId = authReq.user!.companyId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.custody.update({
        where: { userId },
        data: { 
          currentBalance: { increment: parseFloat(amount) }
        }
      });

      await tx.auditLog.create({
        data: {
          companyId,
          userId: authReq.user!.id,
          action: 'CUSTODY_ADJUST',
          entity: 'Custody',
          details: { targetUserId: userId, adjustment: amount, newBalance: updated.currentBalance } as any
        }
      });

      return updated;
    });

    // Fix: res.json() recognized correctly
    res.json(result);
  } catch (error) {
    // Fix: res.status() recognized correctly
    res.status(400).json({ error: 'Failed to adjust custody' });
  }
}) as any);

export default router;
