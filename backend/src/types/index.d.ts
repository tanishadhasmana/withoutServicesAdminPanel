// src/types/express/index.d.ts
import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
        email?: string;
        firstName?: string;
        lastName?: string;
      };
    }
  }
}

export {};
