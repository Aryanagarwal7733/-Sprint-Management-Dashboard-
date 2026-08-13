import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import type { KanbanTask } from '../../types/board';

interface TaskCardProps {
  task: KanbanTask;
  onClick: (task: KanbanTask) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const priorityColors = {
    low: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/30',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/30',
    high: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800/30',
  };

  // Check if date is overdue or near (next 2 days)
  const isOverdue = () => {
    if (task.status === 'done') return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick(task)}
      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all select-none group pointer-events-auto"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {isOverdue() && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-500 animate-pulse">
            <AlertCircle className="h-3.5 w-3.5" />
            Overdue
          </span>
        )}
      </div>

      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 text-left mb-1.5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
        {task.title}
      </h4>

      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 text-left mb-4 leading-normal">
        {task.description}
      </p>

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3">
        {/* Due Date Indicator */}
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <span className={`text-[10px] font-medium ${isOverdue() ? 'text-rose-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
            {task.dueDate}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Comments count */}
          {task.comments.length > 0 && (
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-[10px] font-medium">{task.comments.length}</span>
            </div>
          )}

          {/* Assignee Avatar */}
          <div className="relative group/avatar" title={task.assignee.name}>
            <img
              src={task.assignee.avatar}
              alt={task.assignee.name}
              className="h-6 w-6 rounded-full bg-slate-100 ring-2 ring-white dark:ring-slate-900 object-cover"
            />
            {/* Tooltip */}
            <span className="absolute bottom-full mb-1.5 right-1/2 translate-x-1/2 hidden group-hover/avatar:block bg-slate-950 text-white text-[9px] font-semibold rounded px-2 py-0.5 whitespace-nowrap shadow-lg z-10">
              {task.assignee.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
