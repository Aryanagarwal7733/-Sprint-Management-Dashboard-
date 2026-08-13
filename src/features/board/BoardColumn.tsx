import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { KanbanTask, TaskStatus } from '../../types/board';
import { TaskCard } from './TaskCard';

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: KanbanTask[];
  onTaskClick: (task: KanbanTask) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ status, title, tasks, onTaskClick }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  const columnStyles = {
    backlog: 'border-t-slate-400 bg-slate-100/40 dark:bg-slate-900/20',
    'in-progress': 'border-t-blue-500 bg-blue-50/10 dark:bg-blue-950/5',
    review: 'border-t-amber-500 bg-amber-50/10 dark:bg-amber-950/5',
    done: 'border-t-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5',
  };

  const headerColors = {
    backlog: 'text-slate-700 dark:text-slate-300',
    'in-progress': 'text-blue-600 dark:text-blue-400',
    review: 'text-amber-600 dark:text-amber-400',
    done: 'text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[270px] max-w-sm rounded-xl border border-slate-200/60 dark:border-slate-800/80 border-t-4 p-4 flex flex-col gap-4 transition-all duration-200 ${
        isOver ? 'ring-2 ring-violet-500 bg-violet-500/5' : ''
      } ${columnStyles[status]}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-sm tracking-wide ${headerColors[status]}`}>
          {title}
        </h3>
        <span className="text-[10px] font-bold bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Task List container */}
      <div className="flex-1 flex flex-col gap-3 min-h-[400px] overflow-y-auto pr-1 select-none">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))
        ) : (
          <div className="flex-grow flex items-center justify-center border-2 border-dashed border-slate-200/50 dark:border-slate-800/50 rounded-xl p-8 text-center">
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              Drop tasks here
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
