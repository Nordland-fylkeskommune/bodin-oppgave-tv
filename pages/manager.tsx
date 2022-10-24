// TODO: Add a Modal to add a new task.
import nb from 'date-fns/locale/nb';
import { NextPage } from 'next';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import Datepicker, {
  getDefaultLocale,
  registerLocale,
  setDefaultLocale,
} from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatDateTime, validDate } from '../lib/date';
import {
  editTask,
  finishTask,
  getTaskById,
  getTasks,
  Task,
  unfinishTask,
} from '../lib/dbApi';
registerLocale('nb', nb);
setDefaultLocale('nb');
type Time = {
  hours: string;
  minutes: string;
  seconds: string;
};
const Header = () => {
  let [currentTimeAsString, setCurrentTimeAsString] = useState<Time>({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hh = ('0' + now.getHours()).slice(-2);
      const mm = ('0' + now.getMinutes()).slice(-2);
      const ss = ('0' + now.getSeconds()).slice(-2);
      setCurrentTimeAsString({
        hours: hh,
        minutes: mm,
        seconds: ss,
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-row justify-between items-center bg-slate-500 text-white p-2">
      <div className="flex flex-row items-center">
        <h1 className="text-2xl font-bold ml-2">Oppgaver</h1>
      </div>
      <div className="flex flex-row items-center">
        <div>
          <span id="hours" className="text-black">
            {currentTimeAsString.hours}
          </span>
          <span>:</span>
          <span id="minutes">{currentTimeAsString.minutes}</span>
          <span>:</span>
          <span
            id="seconds"
            className="text-black
          "
          >
            {currentTimeAsString.seconds}
          </span>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <div className="absolute w-full bottom-0">
      <div className="flex flex-row justify-center items-center">
        <Link href="/">
          <a className="text-white">på skjermen</a>
        </Link>
        <span className="mx-2">|</span>
        <Link href="/manager">
          <a className="text-white">i menyen</a>
        </Link>
      </div>
    </div>
  );
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-gray-700 text-white justify-center content-center text-center min-h-screen relative">
      <Header />
      <div className="h-max p-6">{children} </div>
      <Footer />
    </div>
  );
};

const TaskModal = ({ task, onClose }: { task: Task; onClose: () => void }) => {
  const [taskEdit, setTaskEdit] = useState<Task>();
  const getTask = useCallback(async () => {
    const _task = await getTaskById(task.id);
    if (_task) {
      setTaskEdit(_task.task);
    }
  }, [task.id]);

  useEffect(() => {
    getTask();
  }, [getTask]);

  useEffect(() => {
    if (!taskEdit) return;
    editTask(taskEdit);
  }, [taskEdit]);

  if (!taskEdit) {
    return (
      <div
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
        onClick={onClose}
      ></div>
    );
  }
  const edit = (e: React.ChangeEvent<HTMLInputElement>) => {
    let field = e.target.name;
    switch (e.target.type) {
      case 'text':
        setTaskEdit({
          ...taskEdit,
          [field]: e.target.value,
        });
        break;
      case 'number': {
        let num = parseInt(e.target.value);
        if (e.target.max && num > Number(e.target.max)) {
          num = Number(e.target.max);
        }
        if (e.target.min && num < Number(e.target.min)) {
          num = Number(e.target.min);
        }

        setTaskEdit({
          ...taskEdit,
          [field]: num,
        });
        break;
      }
    }
  };
  const editDate = (date: Date, field: string) => {
    setTaskEdit({
      ...taskEdit,
      [field]: date.toISOString(),
    });
  };
  const dateFields = ['start', 'doneby'];
  const fields = [
    {
      name: 'what',
      label: 'Hva',
      type: 'text',
    },
    {
      name: 'where',
      label: 'Hvor',
      type: 'text',
    },
    {
      name: 'start',
      label: 'Start',
      type: 'date',
    },
    {
      name: 'doneby',
      label: 'Frist',
      type: 'date',
    },
    {
      name: 'priority',
      label: 'Prioritet',
      type: 'number',
      attr: {
        min: 1,
        max: 3,
      },
    },
  ];
  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-full sm:w-3/4 sm:h-3/4 text-black flex flex-wrap -mx-3 sm:mb-6 mb-0"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-full px-1 bg-gray-400 h-9">
          <h2 className="text-2xl font-bold">Oppgave</h2>
        </div>
        {fields.map((field) => {
          if (!field || !field.name) return <div />;
          if (field.type === 'text') {
            return (
              <div
                className="w-full md:w-1/2 px-3 mb-1 md:mb-0"
                key={field.name}
              >
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor={field.name}
                >
                  {field.label}
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                  id={field.name}
                  type="text"
                  placeholder={field.name}
                  value={taskEdit[field.name as keyof Task] ?? ''}
                  onChange={edit}
                  name={field.name}
                />
              </div>
            );
          }
          if (field.type === 'date') {
            let date = taskEdit[field.name as keyof Task]
              ? (taskEdit[field.name as keyof Task] ?? '').toString()
              : new Date().toISOString();
            if (!validDate(date)) {
              date = new Date().toISOString();
            }
            return (
              <div className="w-full md:w-1/2 px-1  md:mb-0" key={field.name}>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor={field.name}
                >
                  {field.label}
                </label>

                <Datepicker
                  locale={getDefaultLocale()}
                  dateFormat="dd.MM.yyyy HH:mm"
                  showTimeSelect
                  selected={validDate(date) ? new Date(date) : new Date()}
                  onChange={(date) => {
                    if (!date) return;
                    editDate(date, field.name);
                  }}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                />
              </div>
            );
          }
          if (field.type === 'number') {
            return (
              <div
                className="w-full md:w-1/2 px-3 mb-6 md:mb-0"
                key={field.name}
              >
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor={field.name}
                >
                  {field.label}
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  value={taskEdit[field.name as keyof Task] ?? ''}
                  onChange={edit}
                  {...field.attr}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};
const EditTaskButton = ({ onclick }: { onclick: () => void }) => {
  return (
    <button
      className="bg-gray-600 text-white p-2 rounded-md cursor-pointer"
      onClick={() => {
        onclick();
      }}
    >
      Endre
    </button>
  );
};
const FinishTaskButton = ({ onclick }: { onclick: () => void }) => {
  return (
    <button
      className="bg-green-600 text-white p-2 rounded-md cursor-pointer"
      onClick={() => {
        onclick();
      }}
    >
      Ferdig
    </button>
  );
};
const UnFinishTaskButton = ({ onclick }: { onclick: () => void }) => {
  return (
    <button
      className="bg-red-600 text-white p-2 rounded-md cursor-pointer"
      onClick={() => {
        onclick();
      }}
    >
      Ikke Ferdig
    </button>
  );
};

const Manager: NextPage = () => {
  // redirect to /display
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task>();
  const [showCompleted, setShowCompleted] = useState(false);
  const updateTasks = useCallback(async () => {
    getTasks().then((tasks) => {
      let sortedTasks = tasks.sort((a, b) => {
        let aDate = new Date(0);
        let bDate = new Date(0);
        if (validDate(a.doneby)) aDate = new Date(a.doneby as string);
        if (validDate(b.doneby)) bDate = new Date(b.doneby as string);
        return bDate.getTime() - aDate.getTime();
      });
      setTasks(sortedTasks);
    });
  }, []);

  useEffect(() => {
    updateTasks();
  }, [updateTasks]);

  return (
    <Layout>
      <div className="">
        <button
          onClick={() => {
            setShowCompleted(!showCompleted);
          }}
        >
          {showCompleted ? 'Hide' : 'Show'} completed
        </button>
      </div>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Hva</th>
            <th className="px-4 py-2">Hvor</th>
            <th className="px-4 py-2">Start</th>
            <th className="px-4 py-2">Frist</th>
            <th className="px-4 py-2">Endre</th>
            <th className="px-4 py-2">Ferdig</th>
          </tr>
        </thead>
        <tbody>
          {tasks
            .filter((task) => {
              if (showCompleted) return true;
              return !task.done;
            })

            .map((task) => (
              <tr key={task.id}>
                <td className="border px-4 py-2">{task.what}</td>
                <td className="border px-4 py-2">{task.where}</td>
                <td className="border px-4 py-2">
                  {formatDateTime(task.start)}
                </td>
                <td className="border px-4 py-2">
                  {formatDateTime(task.doneby)}
                </td>
                <td className="border px-4 py-2">
                  <EditTaskButton
                    onclick={() => {
                      setSelectedTask(task);
                      setShowModal(true);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  {!task.done ? (
                    <FinishTaskButton
                      onclick={() => {
                        setTasks((tasks) => {
                          let newTasks = [...tasks];
                          newTasks.find((t) => t.id === task.id)!.done =
                            new Date().toISOString();
                          return newTasks;
                        });
                        finishTask(task).then(() => {
                          updateTasks();
                        });
                      }}
                    />
                  ) : (
                    <UnFinishTaskButton
                      onclick={() => {
                        setTasks((tasks) => {
                          let newTasks = [...tasks];
                          newTasks.find((t) => t.id === task.id)!.done = null;
                          return newTasks;
                        });
                        unfinishTask(task).then(() => {
                          updateTasks();
                        });
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
        </tbody>
        {showModal && selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => {
              setShowModal(false);
              setSelectedTask(undefined);
              updateTasks();
            }}
          />
        )}
      </table>
    </Layout>
  );
};

export default Manager;
