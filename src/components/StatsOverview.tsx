import React from 'react';
import { DashboardStats } from '../types';
import { CheckCircle2, Clock, AlertTriangle, Layers, Database } from 'lucide-react';

interface StatsOverviewProps {
  stats: DashboardStats | null;
  sqliteVersion?: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, sqliteVersion }) => {
  const total = stats?.total ?? 0;
  const inProgress = stats?.status.in_progress ?? 0;
  const completed = stats?.status.completed ?? 0;
  const overdue = stats?.overdue ?? 0;
  const completionRate = stats?.completionRate ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Stat 1: Total Tasks */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">Total Tasks</span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">{total}</span>
          <span className="text-xs text-slate-400">stored in SQLite</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span>{stats?.status.todo ?? 0} To Do</span>
          <span aria-hidden="true">·</span>
          <span>{stats?.status.review ?? 0} In Review</span>
        </div>
      </div>

      {/* Stat 2: In Progress */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">Active Execution</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-amber-600">{inProgress}</span>
          <span className="text-xs text-slate-400">in progress</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          <span>Interactive JavaScript handlers</span>
        </div>
      </div>

      {/* Stat 3: Completion Rate */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">Completed Rate</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600">{completionRate}%</span>
          <span className="text-xs text-slate-400">({completed} of {total})</span>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Stat 4: SQLite Database Engine */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">SQLite 3 Relational DB</span>
          <Database className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-indigo-600">v{sqliteVersion || '3.x'}</span>
          <span className="text-xs text-emerald-600 font-medium">Connected</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>{overdue > 0 ? `${overdue} overdue task${overdue > 1 ? 's' : ''}` : 'All deadlines on track'}</span>
          {overdue > 0 && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 inline ml-1" />}
        </div>
      </div>
    </div>
  );
};
