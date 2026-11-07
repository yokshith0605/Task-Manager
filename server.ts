import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize SQLite Database
const dbDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'taskmanager.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT CHECK(status IN ('todo', 'in_progress', 'review', 'completed')) DEFAULT 'todo',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    category TEXT DEFAULT 'Development',
    due_date TEXT,
    assignee TEXT DEFAULT 'Yokshith',
    subtasks TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sql_activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL,
    sql_statement TEXT NOT NULL,
    affected_rows INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Helper to log executed SQL queries for the educational SQLite query inspector
function logSqlQuery(actionType: string, sqlStatement: string, affectedRows = 0) {
  try {
    const stmt = db.prepare(`
      INSERT INTO sql_activity_logs (action_type, sql_statement, affected_rows, timestamp)
      VALUES (?, ?, ?, datetime('now', 'localtime'))
    `);
    stmt.run(actionType, sqlStatement, affectedRows);
  } catch (err) {
    console.error('Error logging SQL query:', err);
  }
}

// Function to seed initial project tasks if table is empty
function seedDatabase(force = false) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
  if (countRow.count > 0 && !force) {
    return;
  }

  if (force) {
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM sql_activity_logs').run();
  }

  const sampleTasks = [
    {
      title: 'Design Interactive HTML5 & CSS3 Dashboard Layout',
      description: 'Create responsive grid with sidebar, statistics metrics, search filters, and status columns matching modern UI standards.',
      status: 'completed',
      priority: 'high',
      category: 'Frontend (HTML/CSS)',
      due_date: '2026-11-04',
      assignee: 'Yokshith',
      subtasks: JSON.stringify([
        { id: '1', title: 'Define HTML5 semantic tags', completed: true },
        { id: '2', title: 'Implement CSS styling with Tailwind', completed: true },
        { id: '3', title: 'Verify responsive layout on desktop & mobile', completed: true }
      ])
    },
    {
      title: 'Setup SQLite 3 Database & Schema with Node.js',
      description: 'Configure local SQLite relational database file, primary keys, check constraints, and table definitions for task management.',
      status: 'completed',
      priority: 'high',
      category: 'Database (SQLite 3)',
      due_date: '2026-11-04',
      assignee: 'Yokshith',
      subtasks: JSON.stringify([
        { id: '1', title: 'Write CREATE TABLE tasks DDL statement', completed: true },
        { id: '2', title: 'Add check constraints for status and priority', completed: true },
        { id: '3', title: 'Test WAL mode and foreign key integrity', completed: true }
      ])
    },
    {
      title: 'Develop Real-time JavaScript Task Filtering & Search',
      description: 'Build instantaneous client-side search by title/description and multi-factor filters by category, priority, and completion status.',
      status: 'in_progress',
      priority: 'urgent',
      category: 'JavaScript (Interactive)',
      due_date: '2026-11-06',
      assignee: 'Yokshith',
      subtasks: JSON.stringify([
        { id: '1', title: 'Debounced search input event listeners', completed: true },
        { id: '2', title: 'Multi-criteria filter combination algorithm', completed: false },
        { id: '3', title: 'Empty state illustration when no tasks match', completed: true }
      ])
    },
    {
      title: 'Implement Interactive Kanban Board & Status Transitions',
      description: 'Allow 1-click status advancement (To Do -> In Progress -> Review -> Completed) and drag & drop reordering.',
      status: 'in_progress',
      priority: 'medium',
      category: 'JavaScript (Interactive)',
      due_date: '2026-11-07',
      assignee: 'Yokshith',
      subtasks: JSON.stringify([
        { id: '1', title: 'Status badge dropdown and quick buttons', completed: true },
        { id: '2', title: 'Optimistic UI update on status change', completed: true },
        { id: '3', title: 'Subtask completion percentage calculation', completed: true }
      ])
    },
    {
      title: 'Prepare Mini Project Presentation & Demo for Mam',
      description: 'Organize project presentation slides, live demonstration script explaining HTML/CSS frontend, JavaScript events, and SQLite backend architecture.',
      status: 'review',
      priority: 'high',
      category: 'Documentation',
      due_date: '2026-11-08',
      assignee: 'Yokshith',
      subtasks: JSON.stringify([
        { id: '1', title: 'Document system architecture diagram', completed: true },
        { id: '2', title: 'List SQL queries used in CRUD operations', completed: true },
        { id: '3', title: 'Practice live demonstration walkthrough', completed: false }
      ])
    },
    {
      title: 'Perform Full CRUD Testing & Data Persistence Audit',
      description: 'Verify Create, Read, Update, and Delete operations persist directly to SQLite storage file even across server restarts.',
      status: 'todo',
      priority: 'medium',
      category: 'Testing & QA',
      due_date: '2026-11-09',
      assignee: 'Yokshith',
      subtasks: JSON.stringify([
        { id: '1', title: 'Test edge case task title lengths', completed: false },
        { id: '2', title: 'Verify SQLite journal rollback safety', completed: false }
      ])
    },
    {
      title: 'Add Live SQLite Query Inspector & Raw SQL Runner',
      description: 'Provide an in-app SQLite database console where teachers and evaluators can view raw table data, examine executed queries, and run custom SELECT commands.',
      status: 'completed',
      priority: 'medium',
      category: 'Database (SQLite 3)',
      due_date: '2026-11-05',
      assignee: 'Yokshith',
      subtasks: JSON.stringify([
        { id: '1', title: 'Expose sqlite_master schema introspection API', completed: true },
        { id: '2', title: 'Provide safe SQL runner endpoint', completed: true },
        { id: '3', title: 'Format tabular result grid', completed: true }
      ])
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, category, due_date, assignee, subtasks)
    VALUES (@title, @description, @status, @priority, @category, @due_date, @assignee, @subtasks)
  `);

  const insertMany = db.transaction((tasks) => {
    for (const task of tasks) {
      insertStmt.run(task);
    }
  });

  insertMany(sampleTasks);
  logSqlQuery('SEED', `INSERT INTO tasks (7 sample records for mini project presentation)`, sampleTasks.length);
}

// Initial seed
seedDatabase();

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// GET /api/tasks - Fetch tasks with filtering & sorting
app.get('/api/tasks', (req, res) => {
  try {
    const { status, priority, category, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority && priority !== 'all') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Safe sorting columns
    const allowedSortColumns = ['id', 'title', 'status', 'priority', 'due_date', 'created_at'];
    const safeSort = allowedSortColumns.includes(String(sortBy)) ? String(sortBy) : 'created_at';
    const safeOrder = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${safeSort} ${safeOrder}`;

    const stmt = db.prepare(query);
    const tasks = stmt.all(...params) as any[];

    // Parse subtasks JSON safely
    const parsedTasks = tasks.map(t => ({
      ...t,
      subtasks: typeof t.subtasks === 'string' ? JSON.parse(t.subtasks || '[]') : t.subtasks
    }));

    logSqlQuery('SELECT', `${query} -- params: ${JSON.stringify(params)}`, parsedTasks.length);

    res.json({
      success: true,
      count: parsedTasks.length,
      data: parsedTasks,
      executedSql: query,
      params
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tasks/:id - Fetch single task
app.get('/api/tasks/:id', (req, res) => {
  try {
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    const task = db.prepare(sql).get(req.params.id) as any;

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    task.subtasks = typeof task.subtasks === 'string' ? JSON.parse(task.subtasks || '[]') : task.subtasks;
    logSqlQuery('SELECT', `${sql} [id = ${req.params.id}]`, 1);

    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tasks - Create task
app.post('/api/tasks', (req, res) => {
  try {
    const { title, description = '', status = 'todo', priority = 'medium', category = 'Development', due_date = null, assignee = 'Yokshith', subtasks = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    const subtasksJson = JSON.stringify(subtasks);
    const sql = `
      INSERT INTO tasks (title, description, status, priority, category, due_date, assignee, subtasks, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
    `;

    const stmt = db.prepare(sql);
    const result = stmt.run(title.trim(), description.trim(), status, priority, category, due_date, assignee, subtasksJson);

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) as any;
    newTask.subtasks = JSON.parse(newTask.subtasks || '[]');

    logSqlQuery('INSERT', `INSERT INTO tasks (title, status, priority...) VALUES ('${title.replace(/'/g, "''")}', '${status}', '${priority}'...)`, 1);

    res.status(201).json({
      success: true,
      message: 'Task created successfully in SQLite database',
      data: newTask,
      executedSql: sql
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { title, description, status, priority, category, due_date, assignee, subtasks } = req.body;
    const taskId = req.params.id;

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const subtasksJson = subtasks !== undefined ? JSON.stringify(subtasks) : (existing as any).subtasks;

    const sql = `
      UPDATE tasks
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          category = COALESCE(?, category),
          due_date = COALESCE(?, due_date),
          assignee = COALESCE(?, assignee),
          subtasks = ?,
          updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `;

    const stmt = db.prepare(sql);
    const result = stmt.run(
      title !== undefined ? title.trim() : null,
      description !== undefined ? description.trim() : null,
      status || null,
      priority || null,
      category || null,
      due_date !== undefined ? due_date : null,
      assignee || null,
      subtasksJson,
      taskId
    );

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
    updatedTask.subtasks = JSON.parse(updatedTask.subtasks || '[]');

    logSqlQuery('UPDATE', `UPDATE tasks SET status='${status}', priority='${priority}', updated_at=datetime('now') WHERE id=${taskId}`, result.changes);

    res.json({
      success: true,
      message: 'Task updated successfully in SQLite database',
      data: updatedTask
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/tasks/:id/status - Quick status change (e.g. Kanban move)
app.patch('/api/tasks/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    if (!['todo', 'in_progress', 'review', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const sql = `
      UPDATE tasks
      SET status = ?,
          updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `;

    const stmt = db.prepare(sql);
    const result = stmt.run(status, taskId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
    updatedTask.subtasks = JSON.parse(updatedTask.subtasks || '[]');

    logSqlQuery('UPDATE STATUS', `UPDATE tasks SET status = '${status}' WHERE id = ${taskId}`, result.changes);

    res.json({
      success: true,
      message: `Task status updated to '${status}' in SQLite`,
      data: updatedTask
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const taskId = req.params.id;
    const sql = 'DELETE FROM tasks WHERE id = ?';
    const stmt = db.prepare(sql);
    const result = stmt.run(taskId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    logSqlQuery('DELETE', `DELETE FROM tasks WHERE id = ${taskId}`, result.changes);

    res.json({
      success: true,
      message: `Task #${taskId} deleted successfully from SQLite database`,
      affectedRows: result.changes
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/stats - Dashboard analytics and counts
app.get('/api/stats', (req, res) => {
  try {
    const totalRow = db.prepare('SELECT COUNT(*) as total FROM tasks').get() as { total: number };
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count FROM tasks GROUP BY status
    `).all() as { status: string; count: number }[];

    const priorityCounts = db.prepare(`
      SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority
    `).all() as { priority: string; count: number }[];

    const categoryCounts = db.prepare(`
      SELECT category, COUNT(*) as count FROM tasks GROUP BY category
    `).all() as { category: string; count: number }[];

    const today = new Date().toISOString().split('T')[0];
    const overdueRow = db.prepare(`
      SELECT COUNT(*) as overdue FROM tasks
      WHERE status != 'completed' AND due_date IS NOT NULL AND due_date != '' AND due_date < ?
    `).get(today) as { overdue: number };

    const statusMap: Record<string, number> = { todo: 0, in_progress: 0, review: 0, completed: 0 };
    statusCounts.forEach(s => { statusMap[s.status] = s.count; });

    const completionRate = totalRow.total > 0 ? Math.round((statusMap.completed / totalRow.total) * 100) : 0;

    res.json({
      success: true,
      stats: {
        total: totalRow.total,
        status: statusMap,
        priorities: priorityCounts,
        categories: categoryCounts,
        overdue: overdueRow.overdue,
        completionRate
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/seed - Reset / re-seed demo data
app.post('/api/seed', (req, res) => {
  try {
    seedDatabase(true);
    res.json({ success: true, message: 'Database successfully reseeded with sample tasks' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/database/schema - Inspect SQLite schema
app.get('/api/database/schema', (req, res) => {
  try {
    const tables = db.prepare(`
      SELECT name, sql FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();

    const dbStats = fs.statSync(dbPath);

    res.json({
      success: true,
      dbPath: 'data/taskmanager.db',
      dbSizeBytes: dbStats.size,
      sqliteVersion: (db.prepare('SELECT sqlite_version() as version').get() as any).version,
      tables
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/database/logs - Recent SQL queries executed by the backend
app.get('/api/database/logs', (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM sql_activity_logs
      ORDER BY id DESC LIMIT 50
    `).all();
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/database/query - Run custom SQL query (read-only SELECT for student demo)
app.post('/api/database/query', (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'SQL query string is required' });
    }

    const trimmed = query.trim();
    // Allow SELECT queries, PRAGMA, or EXPLAIN
    if (!/^(SELECT|PRAGMA|EXPLAIN)\b/i.test(trimmed)) {
      return res.status(403).json({
        success: false,
        error: 'Only read-only SELECT or PRAGMA statements are permitted in the interactive query runner.'
      });
    }

    const startTime = performance.now();
    const rows = db.prepare(trimmed).all();
    const executionTimeMs = (performance.now() - startTime).toFixed(2);

    logSqlQuery('MANUAL SELECT', trimmed, rows.length);

    res.json({
      success: true,
      rowCount: rows.length,
      executionTimeMs,
      rows
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow Server running on http://localhost:${PORT}`);
  });
}

startServer();
