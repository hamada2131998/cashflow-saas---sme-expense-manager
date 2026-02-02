
import { Router, Request, Response } from 'express';
// Fix: Import PrismaClient from @prisma/client using namespace for compatibility
import * as PrismaModule from '@prisma/client';
import { AuthRequest, authorize } from '../middleware';

const router = Router();
// Fix: Correct PrismaClient initialization
const prisma = new PrismaModule.PrismaClient();

// Create Expense
// Fix: Explicitly casting handler to any to resolve RequestHandler overload mismatch
router.post('/', (async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  // Fix: body property now recognized via proper Express typing in AuthRequest
  const { amount, description, branchId } = authReq.body;
  const { companyId, id: userId } = authReq.user!;

  try {
    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        branchId,
        companyId,
        employeeId: userId,
        status: 'PENDING'
      }
    });
    // Fix: status() and json() recognized correctly
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create expense' });
  }
}) as any);

// List Expenses with Multi-tenancy
// Fix: Use internal casting to AuthRequest to access authenticated user context
router.get('/', (async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { companyId, role, id: userId } = authReq.user!;
  
  const expenses = await prisma.expense.findMany({
    where: { 
      companyId,
      ...(role === 'EMPLOYEE' ? { employeeId: userId } : {})
    },
    include: { employee: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
  // Fix: res.json() recognized correctly
  res.json(expenses);
}) as any);

// Update Status (Atomic Transaction)
// Fix: Use internal casting and properly handle the audit log details JSON
router.patch('/:id/status', authorize(['OWNER', 'ACCOUNTANT']), (async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  // Fix: params and body property recognition
  const { id } = authReq.params;
  const { status } = authReq.body;
  const companyId = authReq.user!.companyId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findFirst({
        where: { id, companyId }
      });

      if (!expense || expense.status !== 'PENDING') {
        throw new Error('Expense not found or already processed');
      }

      const updated = await tx.expense.update({
        where: { id },
        data: { 
          status, 
          reviewedBy: authReq.user!.id, 
          reviewedAt: new Date() 
        }
      });

      if (status === 'APPROVED') {
        const custody = await tx.custody.findUnique({
          where: { userId: expense.employeeId }
        });

        if (!custody || custody.currentBalance < expense.amount) {
          throw new Error('Insufficient custody balance');
        }

        await tx.custody.update({
          where: { userId: expense.employeeId },
          data: { currentBalance: { decrement: expense.amount } }
        });
      }

      await tx.auditLog.create({
        data: {
          companyId,
          userId: authReq.user!.id,
          action: `EXPENSE_${status}`,
          entity: 'Expense',
          details: { expenseId: id, amount: expense.amount } as any
        }
      });

      return updated;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}) as any);

export default router;
