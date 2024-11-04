'use client';

import { useState, useRef, useEffect } from 'react';
import Task from './Task';
import TaskForm from './TaskForm';

interface Task {
  name: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'in-progress';
}

interface TaskListProps {
  tasks: Task[];
}

type SortDirection = 'asc' | 'desc';

const getNextStatus = (currentStatus: Task['status']): Task['status'] => {
  switch (currentStatus) {
    case 'pending':
      return 'in-progress';
    case 'in-progress':
      return 'completed';
    default:
      return 'completed';
  }
};

const ALL_STATUSES: Task['status'][] = ['pending', 'in-progress', 'completed'];

export default function TaskList({ tasks: initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<Task['status']>>(new Set(ALL_STATUSES));
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleStatusUpdate = (index: number) => {
    setTasks(tasks.map((task, i) => {
      if (i === index) {
        return {
          ...task,
          status: getNextStatus(task.status)
        };
      }
      return task;
    }));
  };

  const handleCreateTask = (newTask: Omit<Task, 'status'>) => {
    setTasks([...tasks, { ...newTask, status: 'pending' }]);
    setShowForm(false);
  };

  const toggleStatus = (status: Task['status']) => {
    const newSelectedStatuses = new Set(selectedStatuses);
    if (newSelectedStatuses.has(status)) {
      if (newSelectedStatuses.size > 1) { // Prevent deselecting all statuses
        newSelectedStatuses.delete(status);
      }
    } else {
      newSelectedStatuses.add(status);
    }
    setSelectedStatuses(newSelectedStatuses);
  };

  const filteredAndSortedTasks = tasks
    .filter(task => selectedStatuses.has(task.status))
    .sort((a, b) => {
      const dateComparison = sortDirection === 'asc' 
        ? a.dueDate.getTime() - b.dueDate.getTime()
        : b.dueDate.getTime() - a.dueDate.getTime();
      return dateComparison;
    });

  return (
    <div className="h-[calc(100vh-theme(spacing.16)-theme(spacing.8)*2)] flex flex-col relative">
      <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
            >
              <span>Status Filter</span>
              <span className="text-sm text-gray-500">
                ({selectedStatuses.size})
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {ALL_STATUSES.map((status) => (
                  <label
                    key={status}
                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStatuses.has(status)}
                      onChange={() => toggleStatus(status)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 capitalize">
                      {status.replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <span>Due Date</span>
            {sortDirection === 'asc' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {filteredAndSortedTasks.length} tasks
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="w-full flex flex-col items-center space-y-4 pb-20">
          {filteredAndSortedTasks.map((task, index) => (
            <Task
              key={index}
              task={task}
              onDelete={() => handleDelete(index)}
              onStatusUpdate={() => handleStatusUpdate(index)}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center bg-gradient-to-t from-gray-50 pt-8">
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
              clipRule="evenodd" 
            />
          </svg>
          New Task
        </button>
      </div>
      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
