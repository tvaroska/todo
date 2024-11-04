'use client';

interface TaskProps {
  task: {
    name: string;
    description: string;
    dueDate: Date;
    status: 'pending' | 'completed' | 'in-progress';
  };
  onDelete: () => void;
  onStatusUpdate: () => void;
}

export default function Task({ task, onDelete, onStatusUpdate }: TaskProps) {
  return (
    <div className="w-[75%] max-w-5xl border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-lg font-semibold truncate">{task.name}</h3>
          <p className="text-gray-600 mt-1 break-words">{task.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-sm text-gray-500">
              Due: {task.dueDate.toLocaleDateString()}
            </span>
            <span className={`
              px-2 py-1 rounded-full text-sm
              ${task.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
              ${task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
            `}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          {task.status !== 'completed' && (
            <button
              onClick={onStatusUpdate}
              className="text-blue-600 hover:text-blue-800 transition-colors p-2 flex-shrink-0"
              aria-label="Update status"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          )}
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 transition-colors p-2 flex-shrink-0"
            aria-label="Delete task"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
