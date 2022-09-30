// File: prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';
const prisma = new PrismaClient();
const pickRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
async function main() {
  console.log('Seeding...');
  const createTasks: Prisma.tasksCreateManyInput[] = [];
  for (let i of new Array(100)) {
    const generatedTask: Prisma.tasksCreateInput = {
      what: faker.lorem.sentence(),
      where: faker.address.streetAddress(),
      start: pickRandom([null, faker.date.past(), new Date()]),
      doneby: pickRandom([null, faker.date.future(), , new Date()]),
      done: pickRandom([null, faker.date.future(), , new Date()]),
      priority: faker.datatype.number({ min: 1, max: 3 }),
    };
    createTasks.push(generatedTask);
  }
  await prisma.tasks.createMany({
    data: createTasks,
  });
  console.log('Seeding done.');
  console.log('Done seeding!');
}
main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    if (prisma && prisma.$disconnect) {
      prisma.$disconnect();
    }
  });
