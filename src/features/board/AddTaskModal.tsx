import React, { useState, useEffect } from 'react';
import { useBoardStore, mockAssignees } from '../../store/boardStore';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuthStore } from '../../store/authStore';
import type { TaskStatus, TaskPriority } from '../../types/board';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask } = useBoardStore();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeName, setAssigneeName] = useState(mockAssignees[0].name);
  const [dueDate, setDueDate] = useState('');

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Set default due date to tomorrow on load/open
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus('backlog');
      setPriority('medium');
      
      const defaultName = user && user.role !== 'admin'
        ? `${user.firstName} ${user.lastName}`
        : mockAssignees[0].name;
      setAssigneeName(defaultName);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Task title is required.',
        variant: 'destructive',
      });
      return;
    }

    const assignee = mockAssignees.find((a) => a.name === assigneeName) || mockAssignees[0];

    addTask({
      title: title.trim(),
      description: description.trim() || 'No description provided.',
      status,
      priority,
      assignee,
      dueDate,
    });

    toast({
      title: 'Task Created',
      description: 'The task has been successfully added to the Kanban board.',
      variant: 'success',
    });
    onClose();
  };

  const statusOptions = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const assigneeOptions = mockAssignees.map((a) => ({
    value: a.name,
    label: a.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task objective..."
            rows={3}
            className="w-full p-3 rounded-lg border text-sm outline-none transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Initial Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={statusOptions}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={priorityOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Assignee"
            value={assigneeName}
            onChange={(e) => setAssigneeName(e.target.value)}
            options={assigneeOptions}
            disabled={!isAdmin}
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
