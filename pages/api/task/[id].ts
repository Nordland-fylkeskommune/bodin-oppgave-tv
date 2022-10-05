import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import { guard, keyHandler, Task } from '.';
import { errorHandler } from '../../../middleware/nextConnect';
import databaseWrapper from '../../../lib/db';
// TODO: #20 #19 Move database request to lib/db.ts
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
const handler = nextConnect(errorHandler)
  // GET /api/task/[id]
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    // implemented
    let task;
    try {
      const prisma = await new databaseWrapper().connect();
      task = await prisma.getTask(Number(req.query.id));
      await prisma.disconnect();
      /*task = await prisma.tasks.findUnique({
        where: {
          id: Number(req.query.id),
        },
      });*/
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
      let { errors, allowed } = guard(req.body.task, new keyHandler().put());
      if (!allowed) {
        throw {
          userMessage: 'Missing, wrong or invalid data',
          debugMessage: errors.join(', '),
          errorResponseCode: 400,
        };
      }
      const prisma = await new databaseWrapper().connect();
      let updated = await prisma.updateTaskIfExist(
        Number(req.query.id),
        req.body.task,
      );
      await prisma.disconnect();
      if (updated === null)
        throw {
          userMessage: 'Task not found',
          debugMessage: 'Task not found',
          errorResponseCode: 404,
        };
      console.log(updated);
      return res.status(200).json({ task: updated });
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
        const prisma = await new databaseWrapper().connect();
        let deleted = await prisma.deleteTask(Number(req.query.id));
        res.status(200).json({ task: deleted });
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
