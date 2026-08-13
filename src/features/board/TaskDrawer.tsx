import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Trash2, Send } from 'lucide-react';
import type { KanbanTask, TaskStatus, TaskPriority } from '../../types/board';
import { useBoardStore, mockAssignees } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

interface TaskDrawerProps {
  task: KanbanTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({ task, isOpen, onClose }) => {
  const { updateTask, deleteTask, addComment } = useBoardStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [priority, setPriority] = useState<TaskPriority>('low');
  const [assigneeName, setAssigneeName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Sync state with selected task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeName(task.assignee.name);
      setDueDate(task.dueDate);
      setCommentText('');
      setShowConfirmDelete(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const isOwner = task.assignee.name === (user ? `${user.firstName} ${user.lastName}` : '');
  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin || isOwner;
  const canDelete = isAdmin;
  const canAssign = isAdmin;

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Task title cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    const selectedAssignee = mockAssignees.find((a) => a.name === assigneeName) || task.assignee;

    updateTask(task.id, {
      title,
      description,
      status,
      priority,
      assignee: selectedAssignee,
      dueDate,
    });

    toast({
      title: 'Task Updated',
      description: 'Changes have been saved successfully.',
      variant: 'success',
    });
    onClose();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    toast({
      title: 'Task Deleted',
      description: 'Task has been removed from the sprint board.',
      variant: 'info',
    });
    onClose();
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const authorName = user ? `${user.firstName} ${user.lastName}` : 'Anonymous';
    addComment(task.id, commentText.trim(), authorName);
    setCommentText('');
    toast({
      title: 'Comment Added',
      description: 'Your comment has been posted.',
      variant: 'success',
      duration: 1500,
    });
  };

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const statusOptions = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
  ];

  const assigneeOptions = mockAssignees.map((a) => ({
    value: a.name,
    label: a.name,
  }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col z-10 animate-slide-in text-left">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Task Settings
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {showConfirmDelete ? (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 p-6 flex flex-col gap-4 text-center">
              <h4 className="font-bold text-rose-800 dark:text-rose-400">Delete Task?</h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-normal">
                Are you sure you want to permanently delete this task? This action is undoable only if you click the Undo banner after returning to the board.
              </p>
              <div className="flex gap-3 justify-center mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Confirm Delete
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Task Fields */}
              <Input
                label="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                disabled={!canEdit}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task details and description..."
                  rows={4}
                  disabled={!canEdit}
                  className="w-full p-3 rounded-lg border text-sm outline-none transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  options={statusOptions}
                />
                <Select
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  options={priorityOptions}
                  disabled={!canEdit}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Assignee"
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  options={assigneeOptions}
                  disabled={!canAssign}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={!canEdit}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 justify-between border-t border-b border-slate-100 dark:border-slate-800/80 py-4 my-2">
                {canDelete ? (
                  <Button
                    variant="ghost"
                    onClick={() => setShowConfirmDelete(true)}
                    className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-2 px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({task.comments.length})
                </span>

                {/* Comment Posting form */}
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                  <Button type="submit" variant="secondary" className="px-3 h-9">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>

                {/* Comment List */}
                <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
                  {task.comments.length > 0 ? (
                    task.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-lg text-left"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {comment.author}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                          {comment.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-center text-slate-400 py-4">
                      No comments yet. Start the conversation!
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
