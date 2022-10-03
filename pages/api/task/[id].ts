import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import { Prisma, PrismaClient } from '@prisma/client';
import { Task } from '.';
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

interface TaskIDDeleteResponse {
  task: Prisma.tasksGetPayload<{}>;
}
interface TaskIDPutRequest extends NextApiRequest {
  query: {
    id: string;
  };
  body: {
    task: Task;
  };
}
// TODO: #12 Add middleware to handle errors and 405
const handler = nextConnect({
  onError(error, req: NextApiRequest, res: NextApiResponse<errorResponse>) {
    console.error(error);
    res.status(501).json({
      error: `Sorry something Happened! ${error.userMessage}`,
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
    // implemented
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      let task = await prisma.tasks.findUnique({
        where: {
          id: Number(req.query.id),
        },
      });
      await prisma.$disconnect();
      if (!task) {
        throw {
          userMessage: 'Task not found',
          debugMessage: 'Task not found',
          errorResponseCode: 404,
        };
      }
      res.status(200).json({ task: task });
    } catch (error) {
      throw {
        userMessage: 'Error getting task',
        debugMessage: error,
        errorResponseCode: 500,
      };
    }
  })
  .delete(
    async (
      req: TaskIDDeleteRequest,
      res: NextApiResponse<TaskIDDeleteResponse>,
    ) => {
      try {
        const prisma = new PrismaClient();
        await prisma.$connect();
        const id = req.query.id;
        const task = await prisma.tasks.delete({
          where: {
            id: Number(id),
          },
        });
        res.status(200).json({ task: task });
      } catch (error) {
        throw {
          userMessage: 'Error deleting task',
          debugMessage: error,
          errorResponseCode: 500,
        };
      }
    },
  );
export default handler;
