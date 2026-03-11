import { describe, it, expect } from 'vitest';
import type { Todo, CreateTodoRequest, ApiResponse } from '@todo/shared';

describe('workspace setup', () => {
  it('can import shared types in backend', () => {
    const request: CreateTodoRequest = { text: 'Test task' };
    expect(request.text).toBe('Test task');
  });

  it('ApiResponse type works as discriminated union', () => {
    const response: ApiResponse<Todo[]> = { success: true, data: [] };
    expect(response.success).toBe(true);
  });
});
