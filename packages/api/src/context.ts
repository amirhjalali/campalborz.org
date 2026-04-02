import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import prisma from './lib/prisma';
import logger from './lib/logger';

export interface UserContext {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Context {
  req: Request;
  res: Response;
  prisma: PrismaClient;
  user?: UserContext;
}

/** Validated JWT payload structure */
interface JwtPayload {
  userId: string;
  role: string;
}

function isValidJwtPayload(decoded: unknown): decoded is JwtPayload {
  return (
    typeof decoded === 'object' &&
    decoded !== null &&
    typeof (decoded as JwtPayload).userId === 'string' &&
    typeof (decoded as JwtPayload).role === 'string'
  );
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return secret;
}

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<Context> {
  const context: Context = {
    req,
    res,
    prisma,
  };

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token) {
      try {
        const decoded = jwt.verify(token, getJwtSecret());

        if (!isValidJwtPayload(decoded)) {
          logger.security('Invalid JWT payload structure', { ip: req.ip });
          return context;
        }

        const member = await prisma.member.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, name: true, role: true, isActive: true },
        });

        if (member && member.isActive) {
          context.user = {
            id: member.id,
            email: member.email,
            name: member.name,
            role: member.role,
          };
        } else if (member && !member.isActive) {
          logger.security(`Deactivated account attempted access: ${member.email}`, { ip: req.ip });
        }
      } catch (err) {
        // Log token verification failures (could indicate attack attempts)
        if (err instanceof jwt.TokenExpiredError) {
          // Expired tokens are normal, only debug-log
          logger.debug('Expired JWT token presented', { ip: req.ip });
        } else {
          logger.security('Invalid JWT token presented', { ip: req.ip });
        }
      }
    }
  }

  return context;
}
