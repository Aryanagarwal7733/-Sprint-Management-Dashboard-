export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Assignee {
  name: string;
  avatar: string;
  email: string;
}

export interface TaskComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: Assignee;
  dueDate: string;
  comments: TaskComment[];
}
