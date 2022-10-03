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
/*
model tasks {
  id         Int       @id @default(autoincrement())
  what       String?
  where      String?
  priority   Int?
  start      DateTime?
  doneby     DateTime?
  done       DateTime?
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt

  @@index([id], map: "id")
}*/
type Task = {
  what?: string;
  where?: string;
  priority?: number;
  start?: string;
  doneby?: string;
  done?: string;
};
interface taskIndexPostRequest extends NextApiRequest {
  body: {
    task: Task;
  };
}
interface taskIndexPostResponse {
  task: Task;
}

// taskIndexPostRequestGuard
let validateDateString = (dateToValidate: any): boolean => {
  console.log(dateToValidate);
  if (typeof dateToValidate !== 'string') return false;
  if (dateToValidate.length === 0) return false;
  if (isNaN(Date.parse(dateToValidate))) return false;
  return true;
};

const postGuard = (
  req: taskIndexPostRequest,
): { errors: string[]; allowed: boolean } => {
  const errors: string[] = [];
  const task = req.body.task;
  let keys: {
    key: keyof Task;
    type: 'string' | 'number' | 'date';
    required: boolean;
  }[] = [
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
  if (!task) {
    errors.push('task is missing');
  }
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
  return { errors, allowed: errors.length === 0 };
  /*if (task) {
    if (!task.what) {
      errors.push('what is missing');
    }
    if (typeof task.what !== 'string') {
      errors.push('what is not a string');
    }
    if (!task.where) {
      errors.push('where is missing');
    }
    if (typeof task.where !== 'string') {
      errors.push('where is not a string');
    }
    if (task.priority && typeof task.priority !== 'number') {
      errors.push('priority is not a number');
    }
    if (task.priority && (task.priority < 1 || task.priority > 3)) {
      errors.push('priority is not between 1 and 3');
    }
    if (task.start && typeof task.start !== 'string') {
      errors.push('start is not a string');
    }
    if (task.start && !validateDateString(task.start)) {
      errors.push('start is not a valid date');
    }

    if (task.doneby && typeof task.doneby !== 'string') {
      errors.push('doneby is not a string');
    }
    if (task.doneby && !validateDateString(task.doneby)) {
      errors.push('doneby is not a valid date');
    }
    if (task.done && typeof task.done !== 'string') {
      errors.push('done is not a string');
    }
    if (task.done && !validateDateString(task.done)) {
      errors.push('done is not a valid date');
    }
  }*/
};

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
  // TODO: #3 Post /api/task skal oprette en ny "task" i databasen.
  .post(async (req: taskIndexPostRequest, res: NextApiResponse) => {
    let { errors, allowed } = postGuard(req);
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
  })
  // DELETE /api/task
  // TODO: #4 DELETE /api/task skal slette en "task" fra databasen.
  .delete((req: NextApiRequest, res: NextApiResponse) => {})
  // PUT /api/task
  // TODO: #5 PUT /api/task skal oppdatere en "task" i databasen.
  .put((req: NextApiRequest, res: NextApiResponse) => {});

export default handler;
