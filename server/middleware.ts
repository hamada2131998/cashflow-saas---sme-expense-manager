
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Fix: Use express.Request explicitly to avoid collision with global Request type
export interface AuthRequest extends ExpressRequest {
  user?: {
    id: string;
    companyId: string;
    role: string;
  };
}

// Fix: Using standard Request/Response types in signature for Express compatibility
// and casting to AuthRequest internally to safely access added properties.
export const authenticate = (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  const authReq = req as AuthRequest;
  // Fix: Property 'headers' now exists as we use ExpressRequest
  const token = authReq.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    authReq.user = decoded;
    next();
  } catch (err) {
    // Fix: res.status() and res.json() are now recognized correctly
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !roles.includes(authReq.user.role)) {
      // Fix: res.status() recognized correctly
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// Ensure all DB queries are scoped to the company
export const tenantGuard = (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (!authReq.user?.companyId) return res.status(403).json({ error: 'No company context' });
  next();
};
