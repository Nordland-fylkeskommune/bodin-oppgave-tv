import { IncomingMessage, ServerResponse } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler, Options } from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import databaseWrapper from '../lib/db';

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
    let message = `${error.debugMessage}` || 'No debug message';
    let user_message = `${error.userMessage}` || 'No user message';
    let headers = JSON.stringify(req.headers) || 'No headers';
    let url = `${req.url}` || 'No url';
    let method = `${req.method}` || 'No method';
    const prisma = new databaseWrapper();
    prisma.createError({
      message,
      user_message,
      headers,
      url,
      method,
    });
  },
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
};
