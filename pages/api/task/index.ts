import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import { Prisma, PrismaClient } from '@prisma/client';
import { errorHandler } from '../../../middleware/nextConnect';
interface errorResponse {
  error: string;
  errorRef: string;
}
export interface taskIndexGetResponse {
  tasks: Prisma.tasksGetPayload<{}>[];
}
// TODO: #12 Add middleware to handle errors and 405
export type Task = {
  what?: string;
  where?: string;
  priority?: number;
  start?: string;
  doneby?: string;
  done?: string;
};
export interface taskIndexPostRequest extends NextApiRequest {
  body: {
    task: Task;
  };
}
export interface taskIndexPostResponse {
  task: Task;
}
export class keyHandler {
  keys: keyGuard[];
  constructor() {
    this.keys = [
      {
        key: 'what',
        type: 'string',
        required: true,
      },
      {
        key: 'where',
        type: 'string',
        required: true,
      },
      {
        key: 'priority',
        type: 'number',
        required: false,
      },
      {
        key: 'start',
        type: 'date',
        required: false,
      },
      {
        key: 'doneby',
        type: 'date',
        required: false,
      },
      {
        key: 'done',
        type: 'date',
        required: false,
      },
    ];
  }
  post() {
    return this.keys;
  }
  put() {
    return this.keys.map((key) => {
      key.required = false;
      return key;
    });
  }
}
/**
 *
 * @param dateToValidate
 * @returns {boolean} given a date string, returns true if it is a valid date
 */
export let validateDateString = (dateToValidate: any): boolean => {
  console.log(dateToValidate);
  if (typeof dateToValidate !== 'string') return false;
  if (dateToValidate.length === 0) return false;
  if (isNaN(Date.parse(dateToValidate))) return false;
  return true;
};
type keyGuard = {
  key: keyof Task;
  type: 'string' | 'number' | 'date';
  required: boolean;
};

/**
 *
 * @param task {Task} the task to validate
 * @param keys {keyGuard[]} the keys to validate
 * @returns { errors: string[], allowed: boolean } returns an object with an array of errors and a boolean indicating if the task is allowed
 */
export const guard = (
  task: Task,
  keys: keyGuard[],
): { errors: string[]; allowed: boolean } => {
  const errors: string[] = [];
  if (!task) {
    errors.push('task is missing');
  }
  if (task) {
    keys.forEach((key) => {
      if (key.required && !task[key.key]) {
        errors.push(`${key.key} is missing`);
      }
      if (
        typeof task[key.key] !== 'undefined' &&
        typeof task[key.key] !== key.type &&
        key.type !== 'date'
      ) {
        errors.push(`${key.key} is not a ${key.type}`);
      }

      if (
        key.type === 'date' &&
        typeof task[key.key] !== 'undefined' &&
        !validateDateString(task[key.key])
      ) {
        errors.push(`${key.key} is not a valid date`);
      }
    });
  }
  return { errors, allowed: errors.length === 0 };
};
const handler = nextConnect(errorHandler)
  // GET /api/task
  // TODO: #9 #10 add possibility to filter by any field
  .get(
    async (req: NextApiRequest, res: NextApiResponse<taskIndexGetResponse>) => {
      // prisma
      const prisma = new PrismaClient();
      await prisma.$connect();
      let tasks = await prisma.tasks.findMany();
      await prisma.$disconnect();
      res.status(200).json({ tasks: tasks });
    },
  )
  // POST /api/task
  .post(async (req: taskIndexPostRequest, res: NextApiResponse) => {
    let { errors, allowed } = guard(req.body.task, new keyHandler().post());
    if (!allowed) {
      throw {
        userMessage: 'Missing, wrong or invalid data',
        debugMessage: errors.join(', '),
        errorResponseCode: 400,
      };
      //return res.status(400).json({ error: errors.join(', ') });
    }
    const task = req.body.task;
    const prisma = new PrismaClient();
    await prisma.$connect();
    try {
      let created = await prisma.tasks.create({
        data: {
          what: task.what,
          where: task.where,
          priority: task.priority,
          start: task.start,
          doneby: task.doneby,
          done: task.done,
        },
      });
      if (created) {
        return res.status(200).json({ task: created });
      }
    } catch (error) {
      throw {
        userMessage: 'Error creating task',
        debugMessage: error,
        errorResponseCode: 500,
      };
    }
  });
export default handler;
