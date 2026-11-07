import React, { useState } from 'react';
import { Task, TaskStatus, Subtask } from '../types';
import {
  Calendar,
  CheckCircle,
  Circle,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Edit,
  CheckSquare,
  Square,
  AlertCircle,
  Plus
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (id: number, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onUpdateSubtasks: (id: number, subtasks: Subtask[]) => void;
  onAddNewToColumn: (status: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'border-t-slate-400' },
  { id: 'in_progress', title: 'In Progress', color: 'border-t-amber-500' },
  { id: 'review', title: 'Under Review', color: 'border-t-indigo-500' },
  { id: 'completed', title: 'Completed', color: 'border-t-emerald-500' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onUpdateSubtasks,
  onAddNewToColumn,
}) => {
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<number | null>(null);
  const [expandedSubtasksId, setExpandedSubtasksId] = useState<number | null>(null);

  const getPriorityStyle = (priority: string) => {
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

  const handleToggleSubtask = (task: Task, subtaskId: string) => {
    const updated = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateSubtasks(task.id, updated);
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'review';
    if (current === 'review') return 'completed';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'completed') return 'review';
    if (current === 'review') return 'in_progress';
    if (current === 'in_progress') return 'todo';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);

        return (
          <div
            key={column.id}
            className={`bg-slate-100/70 rounded-xl border border-slate-200 border-t-4 ${column.color} flex flex-col min-h-[500px]`}
          >
            {/* Column Header */}
            <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60 bg-white/50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-slate-800">{column.title}</h3>
                <span className="text-xs font-mono font-medium text-slate-400 tabular-nums bg-slate-200/80 px-1.5 py-0.5 rounded">
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddNewToColumn(column.id)}
                className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                title={`Add task to ${column.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards Container */}
            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {columnTasks.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs text-center border-2 border-dashed border-slate-200 rounded-lg p-4">
                  <span>No tasks in this column</span>
                  <button
                    onClick={() => onAddNewToColumn(column.id)}
                    className="mt-2 text-indigo-600 font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add one
                  </button>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
                  const totalSubtasks = task.subtasks.length;
                  const overdue = isOverdue(task.due_date, task.status);
                  const isMenuOpen = activeMenuTaskId === task.id;
                  const isSubtasksExpanded = expandedSubtasksId === task.id;

                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all p-3.5 group relative"
                    >
                      {/* Top metadata line: Category · Priority */}
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium truncate">
                          <span className="truncate">{task.category}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className={`capitalize ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* More Menu Action */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuTaskId(isMenuOpen ? null : task.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-50"
                            title="Task options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-6 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                              <button
                                onClick={() => {
                                  setActiveMenuTaskId(null);
                                  onEditTask(task);
                                }}
                                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit Task</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuTaskId(null);
                                  onDeleteTask(task.id);
                                }}
                                className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Task</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Task Title */}
                      <h4 className="text-sm font-semibold text-slate-900 mb-1 leading-snug">
                        {task.title}
                      </h4>

                      {/* Task Description */}
                      {task.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2.5">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks checklist progress bar */}
                      {totalSubtasks > 0 && (
                        <div className="mb-2.5 bg-slate-50 border border-slate-100 rounded p-2">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <button
                              onClick={() =>
                                setExpandedSubtasksId(isSubtasksExpanded ? null : task.id)
                              }
                              className="font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                            >
                              <span>Subtasks</span>
                              <span className="font-mono tabular-nums text-slate-400">
                                ({completedSubtasks}/{totalSubtasks})
                              </span>
                            </button>
                            <span className="text-[10px] font-mono text-slate-400">
                              {Math.round((completedSubtasks / totalSubtasks) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1 rounded-full transition-all"
                              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                            />
                          </div>

                          {/* Expanded subtask list */}
                          {isSubtasksExpanded && (
                            <div className="mt-2 space-y-1 pt-1 border-t border-slate-200/60">
                              {task.subtasks.map((st) => (
                                <button
                                  key={st.id}
                                  onClick={() => handleToggleSubtask(task, st.id)}
                                  className="w-full flex items-center gap-2 text-left text-xs py-0.5 text-slate-700 hover:text-indigo-600"
                                >
                                  {st.completed ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  )}
                                  <span className={st.completed ? 'line-through text-slate-400 truncate' : 'truncate'}>
                                    {st.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom row: Due Date, Assignee, Status Shift Arrows */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500">
                          {task.due_date ? (
                            <div
                              className={`flex items-center gap-1 font-mono text-[11px] ${
                                overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                              }`}
                              title={overdue ? 'Overdue deadline' : 'Due date'}
                            >
                              {overdue ? (
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                              ) : (
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span>{task.due_date}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No due date</span>
                          )}
                        </div>

                        {/* Interactive Status Transition Controls */}
                        <div className="flex items-center gap-1">
                          {getPrevStatus(task.status) && (
                            <button
                              onClick={() => onStatusChange(task.id, getPrevStatus(task.status)!)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                              title="Move back"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick complete toggle */}
                          <button
                            onClick={() =>
                              onStatusChange(
                                task.id,
                                task.status === 'completed' ? 'todo' : 'completed'
                              )
                            }
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-600 transition-colors"
                            title={task.status === 'completed' ? 'Revert to To Do' : 'Mark Completed'}
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300 hover:text-emerald-500" />
                            )}
                          </button>

                          {getNextStatus(task.status) && (
                            <button
                              onClick={() => onStatusChange(task.id, getNextStatus(task.status)!)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                              title="Advance to next status"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
