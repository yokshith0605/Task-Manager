import { Task, DashboardStats, SqlActivityLog, DatabaseInfo, TaskStatus } from './types';

export const api = {
  async getTasks(params?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ data: Task[]; count: number; executedSql?: string }> {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params?.priority && params.priority !== 'all') searchParams.set('priority', params.priority);
    if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const queryStr = searchParams.toString();
    const res = await fetch(`/api/tasks${queryStr ? `?${queryStr}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch tasks from SQLite database');
    return res.json();
  },

  async createTask(taskData: Partial<Task>): Promise<{ success: boolean; data: Task; executedSql?: string }> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create task in SQLite');
    return result;
  },

  async updateTask(id: number, taskData: Partial<Task>): Promise<{ success: boolean; data: Task }> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update task in SQLite');
    return result;
  },

  async updateTaskStatus(id: number, status: TaskStatus): Promise<{ success: boolean; data: Task }> {
    const res = await fetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update task status in SQLite');
    return result;
  },

  async deleteTask(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete task from SQLite');
    return result;
  },

  async getStats(): Promise<{ stats: DashboardStats }> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async seedData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/seed', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reseed SQLite database');
    return res.json();
  },

  async getDatabaseSchema(): Promise<DatabaseInfo> {
    const res = await fetch('/api/database/schema');
    if (!res.ok) throw new Error('Failed to fetch SQLite schema');
    return res.json();
  },

  async getSqlLogs(): Promise<{ logs: SqlActivityLog[] }> {
    const res = await fetch('/api/database/logs');
    if (!res.ok) throw new Error('Failed to fetch SQL logs');
    return res.json();
  },

  async runCustomQuery(query: string): Promise<{ rowCount: number; executionTimeMs: string; rows: any[] }> {
    const res = await fetch('/api/database/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to execute query on SQLite');
    return result;
  },
};
