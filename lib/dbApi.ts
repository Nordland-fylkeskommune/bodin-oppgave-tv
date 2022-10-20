export type Task = {
  id: number;
  what: string;
  where: string;
  priority: number;
  start: string;
  doneby: string;
  done: string | null;
  created_at: string;
  updated_at: string;
};

export type TasksAPIResponse = {
  tasks: Task[];
};

export type TaskAPIResponse = {
  task: Task;
};

export let getTasks = async () => {
  let tasks = await fetch('/api/task');
  if (tasks.ok) {
    let response: TasksAPIResponse = await tasks.json();
    return response.tasks;
  }
  return [];
};

export let getUncompletedTasks = async () => {
  let tasks = await fetch('/api/task');
  if (tasks.ok) {
    let response: TasksAPIResponse = await tasks.json();
    let foundTasks = response.tasks.filter((task) => task.done === null);
    return foundTasks;
  }
  return [];
};

export let getTaskById = async (id: number) => {
  let task = await fetch(`/api/task/${id}`);
  if (task.ok) {
    let response: TaskAPIResponse = await task.json();
    return response;
  }
  return null;
};

export let editTask = async (task: Task) => {
  let response = await fetch(`/api/task/${task.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task,
    }),
  });
  if (response.ok) {
    return true;
  }
  return false;
};

export let finishTask = async (task: Task) => {
  let response = await fetch(`/api/task/${task.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task: { ...task, done: new Date().toISOString() },
    }),
  });
  if (response.ok) {
    return true;
  }
  return false;
};

export let unfinishTask = async (task: Task) => {
  let response = await fetch(`/api/task/${task.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task: { ...task, done: null },
    }),
  });
  if (response.ok) {
    return true;
  }
  return false;
};
