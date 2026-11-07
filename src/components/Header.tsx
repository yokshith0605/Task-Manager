import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  activeView: 'board' | 'table';
  setActiveView: (view: 'board' | 'table') => void;
  onOpenNewTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenNewTask,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setActiveView('board')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 text-left"
          >
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              TF
            </span>
            <span>TaskFlow</span>
          </button>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveView('board')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeView === 'board'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeView === 'table'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Data Table
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewTask}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden flex border-t border-slate-100 px-4 py-2 overflow-x-auto gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveView('board')}
          className={`whitespace-nowrap px-3 py-1 rounded ${
            activeView === 'board' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          Board
        </button>
        <button
          onClick={() => setActiveView('table')}
          className={`whitespace-nowrap px-3 py-1 rounded ${
            activeView === 'table' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          Table
        </button>
      </div>
    </header>
  );
};
