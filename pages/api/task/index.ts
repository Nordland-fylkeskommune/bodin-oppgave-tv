import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import { Prisma, PrismaClient } from '@prisma/client';
interface errorResponse {
  error: string;
  errorRef: string;
}
interface taskIndexGetResponse {
  tasks: Prisma.tasksGetPayload<{}>[];
}
const handler = nextConnect({
  onError(error, req: NextApiRequest, res: NextApiResponse<errorResponse>) {
    res.status(501).json({
      error: `Sorry something Happened! ${error.message}`,
      errorRef: uuidv4(),
    });
  },
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
})
  // GET /api/task
  // TODO: #2 Get /api/task skal returnere alle "tasks" fra databasen.
  .get((req: NextApiRequest, res: NextApiResponse<taskIndexGetResponse>) => {})
  // POST /api/task
  // TODO: #3 Post /api/task skal oprette en ny "task" i databasen.
  .post((req: NextApiRequest, res: NextApiResponse) => {})
  // DELETE /api/task
  // TODO: #4 DELETE /api/task skal slette en "task" fra databasen.
  .delete((req: NextApiRequest, res: NextApiResponse) => {})
  // PUT /api/task
  // TODO: #5 PUT /api/task skal oppdatere en "task" i databasen.
  .put((req: NextApiRequest, res: NextApiResponse) => {});

export default handler;
