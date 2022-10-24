import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { formatDateTime, validDate } from '../lib/date';
import { getUncompletedTasks, Task } from '../lib/dbApi';

let getCurrentPage = (limit: number, offset: number) => {
  return Math.floor(offset / limit) + 1;
};

let getOffset = (limit: number, page: number) => {
  return (page - 1) * limit;
};

let getPages = (limit: number, total: number) => {
  return Math.ceil(total / limit);
};
const Display: NextPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(0);
  const [limit, setLimit] = useState(15);
  const [currentTimeAsString, setCurrentTimeAsString] =
    useState('00:00:00,000'); // hh:mm:ss
  // useCallBack
  const updateTasks = useCallback(async () => {
    getUncompletedTasks().then((tasks) => {
      let sortedTasks = tasks.sort((a, b) => {
        // TODO: Fix sorting...
        let aDoneBy = validDate(a.doneby)
          ? new Date(a.doneby as string)
          : new Date();
        let bDoneBy = validDate(b.doneby)
          ? new Date(b.doneby as string)
          : new Date();
        let now = new Date();
        if (aDoneBy < now) {
          return -1;
        } else if (bDoneBy < now) {
          return 1;
        }

        let aStart = validDate(a.start)
          ? new Date(a.start as string)
          : new Date();
        let bStart = validDate(b.start)
          ? new Date(b.start as string)
          : new Date();

        if (aStart < bStart) {
          return -1;
        }
        if (aStart > bStart) {
          return 1;
        }
        return 0;
      });
      setTasks(sortedTasks);
      setMaxPage(getPages(limit, sortedTasks.length));
    });
  }, [limit]);

  useEffect(() => {
    updateTasks();
    let interval = setInterval(() => {
      updateTasks();
    }, 2000);
    return () => clearInterval(interval);
  }, [updateTasks]);

  /* change page every 5 seconds */
  useEffect(() => {
    console.log(page);
    let interval = setInterval(() => {
      let newPage = page + 1;
      if (newPage > maxPage) newPage = 1;
      setPage(newPage);
    }, 5000);
    return () => clearInterval(interval);
  }, [page, maxPage]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hh = ('0' + now.getHours()).slice(-2);
      const mm = ('0' + now.getMinutes()).slice(-2);
      const ss = ('0' + now.getSeconds()).slice(-2);
      setCurrentTimeAsString(`${hh}:${mm}:${ss}`);
    }, 1001);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-400 min-h-screen max-h-screen">
      {/* Header */}
      <div className="flex flex-row items-center justify-center w-full h-24  border-gray-200">
        <div className="flex flex-row items-center justify-center w-full h-16 bg-gray-800">
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
        </div>
        <div className="flex flex-row items-center justify-center w-full h-16 bg-gray-800">
          <h1 className="text-2xl font-bold text-white">
            {currentTimeAsString}
          </h1>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center text-center">
        <table className="table-auto min-w-full">
          <thead className="bg-slate-300">
            <tr>
              <th className="px-4 py-2">Hva</th>
              <th className="px-4 py-2">Hvor</th>
              <th className="px-4 py-2"></th>
              <th className="px-4 py-2">Start</th>
              <th className="px-4 py-2">Frist</th>
            </tr>
          </thead>
          <tbody>
            {tasks
              .filter((_task, i) => {
                let offset = getOffset(limit, page);
                return i >= offset && i < offset + limit;
              })
              .map((task) => {
                if (!task) return null;
                let bg = 'bg-slate-400';
                if (validDate(task.start)) {
                  const start = new Date(task.start || '');
                  const now = new Date();
                  if (start < now) {
                    bg = 'bg-slate-500';
                  }
                }
                if (task.doneby !== null && validDate(task.doneby)) {
                  const doneby = new Date(task.doneby);
                  const now = new Date();
                  if (doneby < now) {
                    bg = 'bg-red-500 animate-pulse';
                  }
                }

                return (
                  <tr key={task.id} className={` ${bg}`}>
                    <td className="border px-4 py-2">{task.what}</td>
                    <td className="border px-4 py-2">{task.where}</td>
                    <td className="border px-4 py-2">
                      <span className="w-2">
                        {task.priority === 1 && '🔴'}
                        {task.priority === 2 && '🟡'}
                        {task.priority === 3 && '🟢'}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      {formatDateTime(task.start) ?? 'Snart'}
                    </td>
                    <td className="border px-4 py-2">
                      {formatDateTime(task.doneby) ?? 'Ingen frist'}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <div>
          <p>
            Page {page} of {getPages(limit, tasks.length)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Display;
