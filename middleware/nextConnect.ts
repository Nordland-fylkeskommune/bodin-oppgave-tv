import { IncomingMessage, ServerResponse } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler, Options } from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import { Prisma, PrismaClient } from '@prisma/client';
// nextConnect onError and onNoMatch middleware
export const errorHandler = {
  onError(
    error: any,
    req: NextApiRequest,
    res: NextApiResponse,
    next: NextHandler,
  ) {
    let errorCode = 500;
    if (error.errorResponseCode) {
      errorCode = error.errorResponseCode;
    }
    console.error(error);
    const uid = uuidv4();
    res.status(errorCode).json({
      error: `Sorry something Happened! ${error.userMessage}`,
      errorRef: uid,
    });
    const prisma = new PrismaClient();
    prisma.$connect();
    prisma.errors.create({
      data: {
        message: error.debugMessage,
        user_message: error.userMessage,
        error_ref: uid,
        url: req.url || '',
        method: req.method || '',
        headers: JSON.stringify(req.headers) || '',
      },
    });
    prisma.$disconnect();
  },
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
};
