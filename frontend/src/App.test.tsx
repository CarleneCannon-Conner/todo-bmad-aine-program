import { describe, it, expect } from 'vitest';
import type { Todo, ApiResponse } from '@todo/shared';

describe('workspace setup', () => {
  it('can import shared types', () => {
    const todo: Todo = {
      id: '123',
      text: 'Test',
      isCompleted: false,
      createdAt: new Date(),
    };
    expect(todo.text).toBe('Test');
  });

  it('ApiResponse type works as discriminated union', () => {
    const success: ApiResponse<string> = { success: true, data: 'hello' };
    const error: ApiResponse<string> = {
      success: false,
      error: { code: 'TEST', message: 'fail' },
    };
    expect(success.success).toBe(true);
    expect(error.success).toBe(false);
  });
});
