import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { formatDateTime, validDate } from '../lib/date';
import { getUncompletedTasks, Task } from '../lib/dbApi';
const Display: NextPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [display, setDisplay] = useState<Task[]>([]);
  const [page, setPage] = useState(0);
  const [maxPage, setMaxPage] = useState(0);
  const [limit, setLimit] = useState(15);
  const [currentTimeAsString, setCurrentTimeAsString] =
    useState('00:00:00,000'); // hh:mm:ss

  const updateTasks = useCallback(async () => {
    getUncompletedTasks().then((tasks) => {
      let sortedTasks = tasks.sort((a, b) => {
        let aDate = new Date(0);
        let bDate = new Date(0);
        if (validDate(a.doneby)) aDate = new Date(a.doneby);
        if (validDate(b.doneby)) bDate = new Date(b.doneby);
        return bDate.getTime() - aDate.getTime();
      });
      setTasks(sortedTasks);
    });
  }, []);

  useEffect(() => {
    // sort tasks by doneby date
    updateTasks();
    const interval = setInterval(() => {
      updateTasks();
    }, 10000);
    return () => clearInterval(interval);
  }, [updateTasks]);

  let handlePage = useCallback(async () => {
    let currentPage = page;
    if (page * limit >= tasks.length) {
      currentPage = 1;
      setPage(1);
    } else {
      currentPage = page + 1;
      setPage(page + 1);
    }
    setDisplay(tasks.slice((currentPage - 1) * limit, currentPage * limit));
    setMaxPage(Math.ceil(tasks.length / limit));
  }, [page, limit, tasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      handlePage();
    }, 5222);
    return () => clearInterval(interval);
  }, [handlePage]);
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
            {display.map((task) => {
              let bg = 'bg-slate-400';
              if (validDate(task.start)) {
                const start = new Date(task.start);
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
            Page {page} of {maxPage} ({display.length}/{tasks.length} tasks)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Display;
