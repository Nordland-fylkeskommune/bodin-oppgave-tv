import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import databaseWrapper from '../../../lib/db';
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
  // GET /api/task
  // TODO: #9 #10 add possibility to filter by any field
  .get(
    async (req: NextApiRequest, res: NextApiResponse<taskIndexGetResponse>) => {
      // prisma
      const prisma = new databaseWrapper();
      const tasks = await prisma.getTasks();
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
    const prisma = new databaseWrapper();
    try {
      let created = await prisma.createTask(task);
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
