
import { Router } from 'express';
import * as PrismaModule from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
// Fix: Correct PrismaClient initialization using individual export
const prisma = new PrismaModule.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // In a real prod env we would always use bcrypt. Here we support the seed password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, companyId: user.companyId, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
