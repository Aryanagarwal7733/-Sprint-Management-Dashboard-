import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KanbanTask, TaskStatus, TaskPriority, Assignee } from '../types/board';
import { apiClient } from '../api/client';

interface BoardState {
  tasks: KanbanTask[];
  history: KanbanTask[][];
  isLoading: boolean;
  fetchInitialTasks: () => Promise<void>;
  addTask: (task: Omit<KanbanTask, 'id' | 'comments'>) => void;
  updateTask: (taskId: string, updatedFields: Partial<KanbanTask>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, targetStatus: TaskStatus, targetIndex: number) => void;
  undo: () => void;
  addComment: (taskId: string, commentText: string, authorName: string) => void;
  clearHistory: () => void;
}

const mockAssignees: Assignee[] = [
  { name: 'Vini Chaudhary', email: 'vini.chaudhary@x.dummyjson.com', avatar: 'https://dummyjson.com/icon/vinic/128' },
  { name: 'Emily Johnson', email: 'emily.johnson@x.dummyjson.com', avatar: 'https://dummyjson.com/icon/emilys/128' },
  { name: 'Michael Williams', email: 'michael.williams@x.dummyjson.com', avatar: 'https://dummyjson.com/icon/michaelw/128' },
  { name: 'Alexander Jones', email: 'alexander.jones@x.dummyjson.com', avatar: 'https://dummyjson.com/icon/alexanderj/128' },
  { name: 'Sophia Taylor', email: 'sophia.taylor@x.dummyjson.com', avatar: 'https://dummyjson.com/icon/sophiat/128' }
];

const viniTasks = [
  "Setup Vini's developer workspace and environment settings",
  "Deploy Vini's authentication portal login",
  "Analyze Vini's database queries for dashboard metrics",
  "Verify Vini's notification bell polling integration",
  "Create Vini's custom button components styling",
  "Configure Vini's drag-and-drop sensor parameters",
  "Audit Vini's task permission roles for admins",
  "Implement Vini's analytics donut charts layout",
  "Add Vini's comment forms inside side drawer panel",
  "Fix Vini's password field visibility toggle button",
  "Deploy Vini's production bundles to server hosting",
  "Setup Vini's test suites with Vitest tool runner",
  "Optimize Vini's image rendering file assets",
  "Verify Vini's responsive layouts at 375px viewport",
  "Assess Vini's accessibility ARIA labels coverage",
  "Integrate Vini's local storage session retention manager",
  "Write Vini's developer documentation walkthrough guide",
  "Configure Vini's auto-dismiss timers on notifications",
  "Add Vini's custom input validator warning blocks",
  "Verify Vini's undo history state reverting system",
  "Optimize Vini's bundle chunk lazy load routes",
  "Audit Vini's CORS headers on mock API requests",
  "Build Vini's dark-mode theme color variables list",
  "Review Vini's task reordering within columns flow",
  "Refactor Vini's Axios client interceptors sequence",
  "Test Vini's form validations under mock errors",
  "Setup Vini's scrollbar styles on drawer lists",
  "Review Vini's skeleton loader states on slow fetches",
  "Configure Vini's page visibility tab polling states",
  "Approve Vini's final code merge checklist request"
];

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      tasks: [],
      history: [],
      isLoading: false,

      fetchInitialTasks: async () => {
        // If we already have tasks, check if Vini tasks are loaded. If not, reload!
        const hasViniTasks = get().tasks.some((t) => t.title.toLowerCase().includes('vini'));
        if (get().tasks.length > 0 && hasViniTasks) return;

        set({ isLoading: true });
        try {
          const response = await apiClient.get<Array<{ id: number; title: string; completed: boolean }>>('/todos?_limit=30');
          
          const mappedTasks: KanbanTask[] = response.data.map((todo, index) => {
            const priorities: TaskPriority[] = ['low', 'medium', 'high'];
            const priority = priorities[todo.id % priorities.length];
            
            // Map status
            let status: TaskStatus = 'backlog';
            if (todo.completed) {
              status = 'done';
            } else {
              const statusOptions: TaskStatus[] = ['backlog', 'in-progress', 'review'];
              status = statusOptions[todo.id % statusOptions.length];
            }

            // Create future due date
            const date = new Date();
            date.setDate(date.getDate() + (todo.id % 14) + 1); // 1 to 15 days in future

            const customTitle = viniTasks[index] || `Vini Chaudhary task: ${todo.title}`;

            return {
              id: `task-${todo.id}`,
              title: customTitle,
              description: `Objective: Complete the task card regarding "${customTitle}". Managed on behalf of Vini Chaudhary's project sprint.`,
              status,
              priority,
              assignee: mockAssignees[0], // Vini Chaudhary
              dueDate: date.toISOString().split('T')[0],
              comments: [
                {
                  id: `comment-init-${todo.id}`,
                  text: `This Vini Chaudhary task has been successfully initialized in the sprint backlog.`,
                  author: 'System Manager',
                  createdAt: new Date().toISOString()
                }
              ]
            };
          });

          set({ tasks: mappedTasks, isLoading: false });
        } catch (error) {
          console.error('Failed to pre-fetch JSONPlaceholder tasks:', error);
          set({ isLoading: false });
        }
      },

      addTask: (taskData) => {
        const newTask: KanbanTask = {
          ...taskData,
          id: `task-custom-${Math.random().toString(36).substring(2, 9)}`,
          comments: []
        };
        const currentTasks = get().tasks;
        const newHistory = [...get().history, currentTasks];

        set({
          tasks: [...currentTasks, newTask],
          history: newHistory.slice(-10) // keep last 10 steps in history
        });
      },

      updateTask: (taskId, updatedFields) => {
        const currentTasks = get().tasks;
        const newHistory = [...get().history, currentTasks];

        set({
          tasks: currentTasks.map((t) => (t.id === taskId ? { ...t, ...updatedFields } : t)),
          history: newHistory.slice(-10)
        });
      },

      deleteTask: (taskId) => {
        const currentTasks = get().tasks;
        const newHistory = [...get().history, currentTasks];

        set({
          tasks: currentTasks.filter((t) => t.id !== taskId),
          history: newHistory.slice(-10)
        });
      },

      moveTask: (taskId, targetStatus, targetIndex) => {
        const currentTasks = get().tasks;
        const taskToMove = currentTasks.find((t) => t.id === taskId);
        
        if (!taskToMove) return;
        

        
        const newHistory = [...get().history, currentTasks];

        // Separate moving task from other tasks
        const otherTasks = currentTasks.filter((t) => t.id !== taskId);
        
        // Split other tasks into current status column tasks and others
        const colTasks = otherTasks.filter((t) => t.status === targetStatus);
        const remainingTasks = otherTasks.filter((t) => t.status !== targetStatus);

        // Update task status
        const updatedTask: KanbanTask = { ...taskToMove, status: targetStatus };

        // Insert at designated index in the target column
        colTasks.splice(targetIndex, 0, updatedTask);

        set({
          tasks: [...remainingTasks, ...colTasks],
          history: newHistory.slice(-10)
        });
      },

      undo: () => {
        const currentHistory = get().history;
        if (currentHistory.length === 0) return;

        const previousTasks = currentHistory[currentHistory.length - 1];
        set({
          tasks: previousTasks,
          history: currentHistory.slice(0, -1)
        });
      },

      addComment: (taskId, commentText, authorName) => {
        const currentTasks = get().tasks;
        const newComment = {
          id: `comment-${Math.random().toString(36).substring(2, 9)}`,
          text: commentText,
          author: authorName,
          createdAt: new Date().toISOString()
        };

        set({
          tasks: currentTasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                comments: [...task.comments, newComment]
              };
            }
            return task;
          })
        });
      },

      clearHistory: () => {
        set({ history: [] });
      }
    }),
    {
      name: 'sprintdesk_board_store',
      partialize: (state) => ({ tasks: state.tasks }), // only persist tasks in localStorage
    }
  )
);
export { mockAssignees };
