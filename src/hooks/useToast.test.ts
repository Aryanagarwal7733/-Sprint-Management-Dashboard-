import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useToast } from './useToast';
import { useToastStore } from '../store/toastStore';

describe('useToast Hook', () => {
  beforeEach(() => {
    // Clear the global toast store before running each test
    act(() => {
      useToastStore.setState({ toasts: [] });
    });
  });

  it('should add a toast, return a unique ID, and update the global store', () => {
    const { result } = renderHook(() => useToast());

    let toastId = '';
    act(() => {
      toastId = result.current.toast({
        title: 'Success Toast',
        description: 'Operation completed successfully.',
        variant: 'success',
      });
    });

    expect(toastId).toBeTruthy();
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toEqual({
      id: toastId,
      title: 'Success Toast',
      description: 'Operation completed successfully.',
      variant: 'success',
    });
  });

  it('should dismiss an active toast by its unique ID', () => {
    const { result } = renderHook(() => useToast());

    let toastId = '';
    act(() => {
      toastId = result.current.toast({
        title: 'Toast to dismiss',
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});
