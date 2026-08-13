import React, { useEffect, useState, useMemo } from 'react';
import { DndContext, DragOverlay, rectIntersection, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Plus, Undo2, Search } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import type { TaskStatus, KanbanTask } from '../../types/board';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from './TaskCard';
import { TaskDrawer } from './TaskDrawer';
import { AddTaskModal } from './AddTaskModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';

export const KanbanBoard: React.FC = () => {
  const { tasks, isLoading, fetchInitialTasks, moveTask, undo, history } = useBoardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  
  // Modals / Drawer toggles
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Configure pointer and keyboard inputs for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // avoids conflict with card click handlers
      },
    })
  );

  useEffect(() => {
    fetchInitialTasks();
  }, [fetchInitialTasks]);

  // Filters tasks dynamically based on inputs
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assignee.name === assigneeFilter;

      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter]);

  // Groups tasks by status
  const tasksByStatus = useMemo(() => {
    const columns: Record<TaskStatus, KanbanTask[]> = {
      backlog: [],
      'in-progress': [],
      review: [],
      done: [],
    };
    
    filteredTasks.forEach((task) => {
      if (columns[task.status]) {
        columns[task.status].push(task);
      }
    });

    return columns;
  }, [filteredTasks]);

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find dragging task
    const draggingTask = tasks.find((t) => t.id === activeId);
    if (!draggingTask) return;

    // Dropped directly on a column status header/droppable container
    const statuses: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done'];
    if (statuses.includes(overId as TaskStatus)) {
      const targetStatus = overId as TaskStatus;
      if (draggingTask.status !== targetStatus) {
        // Place at the bottom of the target status column
        const columnTasks = tasks.filter((t) => t.status === targetStatus);
        moveTask(activeId, targetStatus, columnTasks.length);
      }
      return;
    }

    // Dropped over another task card
    const targetTask = tasks.find((t) => t.id === overId);
    if (targetTask) {
      const targetStatus = targetTask.status;
      const targetColumnTasks = tasks.filter((t) => t.status === targetStatus);
      const overIndex = targetColumnTasks.findIndex((t) => t.id === overId);

      // Move task to the exact index of target task
      moveTask(activeId, targetStatus, overIndex);
    }
  };

  const handleCardClick = (task: KanbanTask) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const activeDraggingTask = activeDragId ? tasks.find((t) => t.id === activeDragId) : null;

  // Retrieve unique assignees list for filters
  const uniqueAssigneeNames = useMemo(() => {
    const names = new Set(tasks.map((t) => t.assignee.name));
    return Array.from(names);
  }, [tasks]);

  const filterPriorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const filterAssigneeOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Assignees' },
      ...uniqueAssigneeNames.map((name) => ({ value: name, label: name })),
    ];
  }, [uniqueAssigneeNames]);

  return (
    <div className="flex flex-col gap-6 text-left relative">
      {/* Undo Alert Float banner */}
      {history.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl z-40 flex items-center gap-3 border border-slate-700/50 dark:border-slate-300 animate-bounce duration-1000">
          <span className="text-xs font-medium">Reorder or edits made. Want to revert?</span>
          <button
            onClick={undo}
            className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 dark:text-violet-600 dark:hover:text-violet-500 hover:underline transition-all"
          >
            <Undo2 className="h-4 w-4" />
            Undo Action
          </button>
        </div>
      )}

      {/* Toolbar Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 glass-panel">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              className="bg-white/80 dark:bg-slate-900/60"
            />
          </div>

          {/* Priority Filter */}
          <div className="w-full sm:w-40">
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={filterPriorityOptions}
              className="bg-white/80 dark:bg-slate-900/60"
            />
          </div>

          {/* Assignee Filter */}
          <div className="w-full sm:w-48">
            <Select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              options={filterAssigneeOptions}
              className="bg-white/80 dark:bg-slate-900/60"
            />
          </div>
        </div>

        {/* Create Task Button */}
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 shrink-0 h-10 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Board Column Canvas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/20">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start overflow-x-auto pb-4">
            <BoardColumn
              status="backlog"
              title="Backlog"
              tasks={tasksByStatus.backlog}
              onTaskClick={handleCardClick}
            />
            <BoardColumn
              status="in-progress"
              title="In Progress"
              tasks={tasksByStatus['in-progress']}
              onTaskClick={handleCardClick}
            />
            <BoardColumn
              status="review"
              title="Review"
              tasks={tasksByStatus.review}
              onTaskClick={handleCardClick}
            />
            <BoardColumn
              status="done"
              title="Done"
              tasks={tasksByStatus.done}
              onTaskClick={handleCardClick}
            />
          </div>

          {/* Dnd Kit Drag Overlay Preview */}
          <DragOverlay dropAnimation={null}>
            {activeDraggingTask ? (
              <div className="rotate-3 scale-[1.03] opacity-90 shadow-2xl border-violet-500 ring-2 ring-violet-500/50">
                <TaskCard task={activeDraggingTask} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Modals and Side Drawer */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <TaskDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
};
