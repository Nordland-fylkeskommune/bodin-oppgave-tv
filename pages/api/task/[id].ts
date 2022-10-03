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
interface TaskIDDeleteRequest extends NextApiRequest {
  query: {
    id: string;
  };
}
// TODO: #12 Add middleware to handle errors and 405
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
  // GET /api/task/[id]
  // TODO: #14 Get /api/task/[id] skal returnere en spesifik "task" fra databasen.\
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    // Not implemented
    res.status(501).json({ error: 'Not implemented' });
  })
  // DELETE /api/task/[id]
  // TODO: #4 DELETE /api/task skal slette en "task" fra databasen. Moved to /api/task/[id].ts
  .delete(async (req: TaskIDDeleteRequest, res: NextApiResponse) => {
    const prisma = new PrismaClient();
    const id = req.query.id;
    try {
      const task = await prisma.tasks.delete({
        where: {
          id: id as unknown as number,
        },
      });
      res.status(200).json(task);
    } catch (error) {
      throw {
        userMessage: 'Error deleting task',
        debugMessage: error,
        errorResponseCode: 500,
      };
    }
  });

// PUT /api/task
// TODO: #5 PUT /api/task skal oppdatere en "task" i databasen. Moved to /api/task/[id].ts
export default handler;
