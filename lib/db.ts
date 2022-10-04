import { Prisma, PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

class databaseWrapper {
  prisma: PrismaClient;
  connected: boolean;
  constructor() {
    this.prisma = new PrismaClient();
    this.connected = false;
  }
  async connect() {
    if (!this.connected) {
      await this.prisma.$connect();
      this.connected = true;
    }
    return this;
  }
  async disconnect() {
    if (this.connected) {
      await this.prisma.$disconnect();
      this.connected = false;
    }
    return this;
  }
  async createError(error: any, req: any) {
    const uid = uuidv4();
    await this.prisma.errors.create({
      data: {
        message: error.debugMessage,
        user_message: error.userMessage,
        error_ref: uid,
        url: req.url || '',
        method: req.method || '',
        headers: JSON.stringify(req.headers) || '',
      },
    });
    return uid;
  }
  async getTasks() {
    await this.connect();

    return await this.prisma.tasks.findMany();
  }
  async getTask(id: number) {
    await this.connect();

    return await this.prisma.tasks.findUnique({
      where: {
        id: id,
      },
    });
  }
  async createTask(task: Prisma.tasksCreateInput) {
    await this.connect();

    return await this.prisma.tasks.create({
      data: task,
    });
  }
  async updateTask(id: number, task: Prisma.tasksUpdateInput) {
    await this.connect();

    return await this.prisma.tasks.update({
      where: {
        id: id,
      },
      data: task,
    });
  }
  async updateTaskIfExist(id: number, task: Prisma.tasksUpdateInput) {
    await this.connect();

    const taskExists = await this.prisma.tasks.findUnique({
      where: {
        id: id,
      },
    });
    if (taskExists) {
      return await this.prisma.tasks.update({
        where: {
          id: id,
        },
        data: task,
      });
    } else {
      return null;
    }
  }

  async deleteTask(id: number) {
    await this.connect();

    return await this.prisma.tasks.delete({
      where: {
        id: id,
      },
    });
  }
}

export default databaseWrapper;