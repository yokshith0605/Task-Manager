import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { ArrowUpDown, Edit, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface TaskTableViewProps {
  tasks: Task[];
  onStatusChange: (id: number, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  onStatusChange,
  onEditTask,
  onDeleteTask,
}) => {
  const [sortField, setSortField] = useState<keyof Task>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';

    if (typeof aVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-rose-600 font-semibold';
      case 'high':
        return 'text-amber-600 font-semibold';
      case 'medium':
        return 'text-indigo-600';
      case 'low':
      default:
        return 'text-slate-500';
    }
  };

  const isOverdue = (dueDate: string | null, status: TaskStatus) => {
    if (!dueDate || status === 'completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>SQLite ID</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('title')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Task Title & Description</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('category')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('priority')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('due_date')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Due Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Subtasks</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No tasks found matching criteria.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const overdue = isOverdue(task.due_date, task.status);
                const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
                const totalSubtasks = task.subtasks.length;

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* SQLite Primary Key ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-400 tabular-nums">
                      #{task.id}
                    </td>

                    {/* Task Title & Description */}
                    <td className="py-3 px-4 max-w-xs md:max-w-md">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-slate-500 text-[11px] truncate mt-0.5 max-w-sm">
                          {task.description}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {task.category}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`capitalize ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>

                    {/* Status Select dropdown */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                        className="bg-slate-50 border border-slate-200 text-xs rounded-md px-2 py-1 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      {task.due_date ? (
                        <div
                          className={`flex items-center gap-1.5 ${
                            overdue ? 'text-rose-600 font-semibold' : 'text-slate-600'
                          }`}
                        >
                          {overdue ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{task.due_date}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Subtasks Progress */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {totalSubtasks > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums text-slate-500 text-[11px]">
                            {completedSubtasks}/{totalSubtasks}
                          </span>
                          <div className="w-12 bg-slate-100 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1 rounded-full"
                              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded"
                          title="Edit task"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
