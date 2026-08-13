import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useBoardStore, mockAssignees } from './boardStore';

describe('Zustand Board Store', () => {
  beforeEach(() => {
    // Reset state before running each test
    act(() => {
      useBoardStore.setState({
        tasks: [],
        history: [],
        isLoading: false,
      });
    });
  });

  it('should add a new task and record a checkpoint to history', () => {
    const testTask = {
      title: 'Unit Test Task',
      description: 'Verify this description works',
      status: 'backlog' as const,
      priority: 'high' as const,
      assignee: mockAssignees[0],
      dueDate: '2026-08-20',
    };

    act(() => {
      useBoardStore.getState().addTask(testTask);
    });

    const state = useBoardStore.getState();
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].title).toBe('Unit Test Task');
    expect(state.tasks[0].id).toContain('task-custom-');
    expect(state.tasks[0].comments).toEqual([]);
    expect(state.history).toHaveLength(1);
  });

  it('should move a task between columns and arrange ordering correctly', () => {
    const task1 = {
      title: 'Task 1',
      description: 'Description 1',
      status: 'backlog' as const,
      priority: 'low' as const,
      assignee: mockAssignees[0],
      dueDate: '2026-08-15',
    };
    const task2 = {
      title: 'Task 2',
      description: 'Description 2',
      status: 'in-progress' as const,
      priority: 'medium' as const,
      assignee: mockAssignees[1],
      dueDate: '2026-08-16',
    };

    act(() => {
      useBoardStore.getState().addTask(task1);
      useBoardStore.getState().addTask(task2);
    });

    const storeTasks = useBoardStore.getState().tasks;
    const id1 = storeTasks[0].id;
    const id2 = storeTasks[1].id;

    // Move task1 into 'in-progress' at index 0 (ahead of task2)
    act(() => {
      useBoardStore.getState().moveTask(id1, 'in-progress', 0);
    });

    const updatedTasks = useBoardStore.getState().tasks;
    const movedTask = updatedTasks.find((t) => t.id === id1);
    expect(movedTask?.status).toBe('in-progress');

    const inProgressTasks = updatedTasks.filter((t) => t.status === 'in-progress');
    expect(inProgressTasks).toHaveLength(2);
    expect(inProgressTasks[0].id).toBe(id1);
    expect(inProgressTasks[1].id).toBe(id2);
  });

  it('should delete a task from the board', () => {
    const taskToDelete = {
      title: 'Delete Me',
      description: 'Will be deleted',
      status: 'review' as const,
      priority: 'medium' as const,
      assignee: mockAssignees[2],
      dueDate: '2026-08-17',
    };

    act(() => {
      useBoardStore.getState().addTask(taskToDelete);
    });

    const firstTasks = useBoardStore.getState().tasks;
    const taskId = firstTasks[0].id;
    expect(firstTasks).toHaveLength(1);

    act(() => {
      useBoardStore.getState().deleteTask(taskId);
    });

    const postDeleteTasks = useBoardStore.getState().tasks;
    expect(postDeleteTasks).toHaveLength(0);
  });
});
