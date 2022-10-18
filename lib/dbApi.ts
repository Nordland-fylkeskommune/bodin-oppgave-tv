import { taskIndexGetResponse } from '../pages/api/task';
export type TaskAPIResponse = {
  id: number;
  what: string;
  where: string;
  priority: number;
  start: string;
  doneby: string;
  done: string;
  created_at: string;
  updated_at: string;
};

export type TasksAPIResponse = {
  tasks: TaskAPIResponse[];
};
export let getTasks = async () => {
  let tasks = await fetch('/api/task');
  if (tasks.ok) {
    let response: taskIndexGetResponse = await tasks.json();
    return response.tasks;
  }
  return [];
};

export let getUncompletedTasks = async () => {
  let tasks = await fetch('/api/task');
  if (tasks.ok) {
    let response: TasksAPIResponse = await tasks.json();
    console.log(response);
    let foundTasks = response.tasks.filter((task) => task.done === null);
    return foundTasks;
  }
  return [];
};
