import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBoardStore } from '../../store/boardStore';
import { DataTable, type Column } from '../../components/ui/DataTable';
import type { KanbanTask } from '../../types/board';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks } = useBoardStore();

  const userTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter((t) => t.assignee.name.toLowerCase().includes(user.firstName.toLowerCase()));
  }, [tasks, user]);

  const stats = useMemo(() => {
    const total = userTasks.length;
    const completed = userTasks.filter((t) => t.status === 'done').length;
    const inProgress = userTasks.filter((t) => t.status === 'in-progress').length;
    const pending = total - completed;

    return { total, completed, inProgress, pending };
  }, [userTasks]);

  const priorityColors = {
    low: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/30',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/30',
    high: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800/30',
  };

  const statusColors = {
    backlog: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'in-progress': 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
    review: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400',
    done: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
  };

  const tableColumns: Column<KanbanTask>[] = [
    {
      key: 'title',
      label: 'Task Name',
      sortable: true,
      render: (val) => (
        <span
          onClick={() => navigate('/board')}
          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors block text-left"
        >
          {val}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (val: 'low' | 'medium' | 'high') => (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityColors[val]}`}>
          {val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val: keyof typeof statusColors) => {
        const labels = {
          backlog: 'Backlog',
          'in-progress': 'In Progress',
          review: 'Review',
          done: 'Done',
        };
        return (
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusColors[val]}`}>
            {labels[val] || val}
          </span>
        );
      },
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (val) => <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{val}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Welcome Banner */}
      {user && (
        <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <img
              src={user.image}
              alt={user.firstName}
              className="h-14 w-14 rounded-full bg-slate-100 object-cover ring-2 ring-violet-500/20"
            />
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                Welcome back, {user.firstName} {user.lastName}!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Here's a breakdown of your current tasks for Sprint 4.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => navigate('/board')}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <FolderKanban className="h-4 w-4" />
              Go to Board
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold transition-all"
            >
              <TrendingUp className="h-4 w-4" />
              Analytics
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Tasks</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">{stats.total}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Completed</span>
          <p className="text-3xl font-extrabold text-emerald-500 mt-1">{stats.completed}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My In Progress</span>
          <p className="text-3xl font-extrabold text-blue-500 mt-1">{stats.inProgress}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Remaining</span>
          <p className="text-3xl font-extrabold text-amber-500 mt-1">{stats.pending}</p>
        </div>
      </div>

      {/* Assigned Tasks Data Table */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Tasks Assigned to Me</h3>
          <p className="text-xs text-slate-400">Search and sort tasks currently registered in your queue</p>
        </div>
        <DataTable
          columns={tableColumns}
          data={userTasks}
          searchPlaceholder="Search my tasks..."
          searchKey="title"
          pageSize={5}
        />
      </div>
    </div>
  );
};
