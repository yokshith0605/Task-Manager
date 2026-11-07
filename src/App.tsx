import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, DashboardStats, Subtask } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskTableView } from './components/TaskTableView';
import { TaskModal } from './components/TaskModal';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sqliteVersion, setSqliteVersion] = useState<string>('3.45+');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active view: 'board' | 'table'
  const [activeView, setActiveView] = useState<'board' | 'table'>('board');

  // Filter state
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultModalStatus, setDefaultModalStatus] = useState<TaskStatus>('todo');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load tasks and stats
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [tasksRes, statsRes, schemaRes] = await Promise.all([
        api.getTasks(),
        api.getStats(),
        api.getDatabaseSchema().catch(() => ({ sqliteVersion: '3.45+' })),
      ]);

      setTasks(tasksRes.data);
      setStats(statsRes.stats);
      if (schemaRes?.sqliteVersion) {
        setSqliteVersion(schemaRes.sqliteVersion);
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Error communicating with SQLite backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Unique categories derived from tasks
  const categories = useMemo(() => {
    const defaultCats = [
      'Frontend (HTML/CSS)',
      'JavaScript (Interactive)',
      'Database (SQLite 3)',
      'Documentation',
      'Testing & QA',
      'Development',
    ];
    const existing = tasks.map((t) => t.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...existing]));
  }, [tasks]);

  // Client-side interactive filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter, categoryFilter]);

  // Task Handlers
  const handleCreateOrUpdateTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, taskData);
      showToast(`Task #${editingTask.id} updated in SQLite database`);
    } else {
      const res = await api.createTask(taskData);
      showToast(`Task #${res.data.id} inserted into SQLite database`);
    }
    await refreshData();
  };

  const handleStatusChange = async (id: number, newStatus: TaskStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      await api.updateTaskStatus(id, newStatus);
      showToast(`Status updated to "${newStatus}" in SQLite`);
      const statsRes = await api.getStats();
      setStats(statsRes.stats);
    } catch (err: any) {
      showToast(`Error updating status: ${err.message}`);
      await refreshData();
    }
  };

  const handleUpdateSubtasks = async (id: number, subtasks: Subtask[]) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, subtasks } : t))
      );
      await api.updateTask(id, { subtasks });
    } catch (err: any) {
      showToast(`Error saving subtask: ${err.message}`);
      await refreshData();
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm(`Delete task #${id} permanently from SQLite database?`)) {
      return;
    }
    try {
      await api.deleteTask(id);
      showToast(`Task #${id} deleted from SQLite`);
      await refreshData();
    } catch (err: any) {
      showToast(`Error deleting task: ${err.message}`);
    }
  };

  const handleOpenNewTask = (status: TaskStatus = 'todo') => {
    setEditingTask(null);
    setDefaultModalStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract (3 zones) */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenNewTask={() => handleOpenNewTask('todo')}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Project Header Banner */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span>Task Management Dashboard</span>
                <span aria-hidden="true">·</span>
                <span>HTML, CSS & JavaScript</span>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-600 font-medium">SQLite 3 Database</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Task Management Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                Responsive HTML5 interface with CSS styling, JavaScript interactivity, and persistent CRUD operations connected to SQLite 3.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleOpenNewTask('todo')}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </section>

        {/* Error message banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold block">SQLite Backend Connection Alert</span>
              <span>{error}</span>
            </div>
            <button
              onClick={refreshData}
              className="px-3 py-1 bg-white border border-rose-300 text-rose-700 rounded-md font-medium hover:bg-rose-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* KPI Metrics Strip */}
        <StatsOverview stats={stats} sqliteVersion={sqliteVersion} />

        {/* Filter Bar */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          activeView={activeView}
          setActiveView={setActiveView}
          totalFiltered={filteredTasks.length}
        />

        {/* Loading state skeleton */}
        {isLoading && tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
            <span>Loading records from SQLite database...</span>
          </div>
        ) : activeView === 'board' ? (
          <KanbanBoard
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onUpdateSubtasks={handleUpdateSubtasks}
            onAddNewToColumn={handleOpenNewTask}
          />
        ) : (
          <TaskTableView
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateOrUpdateTask}
        editingTask={editingTask}
        defaultStatus={defaultModalStatus}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs flex items-center gap-2 border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean quiet footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TaskFlow</span>
            <span aria-hidden="true">·</span>
            <span>Frontend (HTML/CSS/JS) + SQLite 3 Database</span>
          </div>
          <div>
            <span>Storage: <code className="font-mono text-slate-700">data/taskmanager.db</code></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
