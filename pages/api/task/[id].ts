import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import { Prisma, PrismaClient } from '@prisma/client';
import { guard, keyHandler, Task } from '.';
interface errorResponse {
  error: string;
  errorRef: string;
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
    let errorCode = 500;
    if (error.errorResponseCode) {
      errorCode = error.errorResponseCode;
    }
    console.error(error);
    res.status(errorCode).json({
      error: `Sorry something Happened! ${error.userMessage}`,
      errorRef: uuidv4(),
    });
  },
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
})
  // GET /api/task/[id]
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    // implemented
    let task;
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      task = await prisma.tasks.findUnique({
        where: {
          id: Number(req.query.id),
        },
      });
      await prisma.$disconnect();
    } catch (error) {
      throw {
        userMessage: 'Error getting task',
        debugMessage: error,
        errorResponseCode: 500,
      };
    }
    if (!task) {
      throw {
        userMessage: 'Task not found',
        debugMessage: 'Task not found',
        errorResponseCode: 404,
      };
    }
    res.status(200).json({ task });
  })

  .put(async (req: TaskIDPutRequest, res: NextApiResponse) => {
    try {
      const prisma = new PrismaClient();
      let { errors, allowed } = guard(req.body.task, new keyHandler().put());
      if (!allowed) {
        throw {
          userMessage: 'Missing, wrong or invalid data',
          debugMessage: errors.join(', '),
          errorResponseCode: 400,
        };
      }
      await prisma.$connect();
      // Check if task exists
      let task = await prisma.tasks.findUnique({
        where: {
          id: Number(req.query.id),
        },
      });
      if (!task) {
        throw {
          userMessage: 'Task not found',
          debugMessage: 'Task not found',
          errorResponseCode: 404,
        };
      }
      let updated = await prisma.tasks.update({
        where: {
          id: Number(req.query.id),
        },
        data: {
          what: req.body.task.what,
          where: req.body.task.where,
          priority: req.body.task.priority,
          start: req.body.task.start,
          doneby: req.body.task.doneby,
          done: req.body.task.done,
        },
      });
      if (updated) {
        return res.status(200).json({ task: updated });
      }
    } catch (error) {
      throw {
        userMessage: 'Error updating task',
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
