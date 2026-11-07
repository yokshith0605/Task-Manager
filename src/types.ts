export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  due_date: string | null;
  assignee: string;
  subtasks: Subtask[];
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total: number;
  status: Record<TaskStatus, number>;
  priorities: { priority: TaskPriority; count: number }[];
  categories: { category: string; count: number }[];
  overdue: number;
  completionRate: number;
}

export interface SqlActivityLog {
  id: number;
  action_type: string;
  sql_statement: string;
  affected_rows: number;
  timestamp: string;
}

export interface TableSchema {
  name: string;
  sql: string;
}

export interface DatabaseInfo {
  dbPath: string;
  dbSizeBytes: number;
  sqliteVersion: string;
  tables: TableSchema[];
}
