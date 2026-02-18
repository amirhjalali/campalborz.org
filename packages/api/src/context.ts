import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import prisma from './lib/prisma';

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

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        role: string;
      };

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
      }
    } catch {
      // Invalid token - continue without user
    }
  }

  return context;
}
