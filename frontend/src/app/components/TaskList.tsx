'use client';

import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';

interface Task {
  id: string;
  title: string;
  status: string;
  due?: string;
}

interface TaskListResponse {
  items?: Task[];
  error?: {
    code: number;
    message: string;
  };
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // First, get the default task list ID
        const listResponse = await fetch(
          'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
          {
            headers: {
              'Authorization': `Bearer ${user?.accessToken}`,
              'Accept': 'application/json',
            },
          }
        );

        if (!listResponse.ok) {
          throw new Error(`Failed to fetch task lists: ${listResponse.statusText}`);
        }

        const listData = await listResponse.json();
        const defaultListId = listData.items?.[0]?.id;

        if (!defaultListId) {
          throw new Error('No task list found');
        }

        // Then fetch tasks from the default list
        const taskResponse = await fetch(
          `https://tasks.googleapis.com/tasks/v1/lists/${defaultListId}/tasks`,
          {
            headers: {
              'Authorization': `Bearer ${user?.accessToken}`,
              'Accept': 'application/json',
            },
          }
        );

        if (!taskResponse.ok) {
          throw new Error(`Failed to fetch tasks: ${taskResponse.statusText}`);
        }

        const data: TaskListResponse = await taskResponse.json();
        
        if (data.error) {
          throw new Error(data.error.message);
        }

        setTasks(data.items || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.accessToken) {
      fetchTasks();
    }
  }, [user?.accessToken]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks found</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-white rounded-lg shadow border border-gray-200"
            >
              <div className="flex items-center gap-2">
                <span className={task.status === 'completed' ? 'line-through text-gray-500' : ''}>
                  {task.title}
                </span>
                {task.due && (
                  <span className="text-sm text-gray-500">
                    Due: {new Date(task.due).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
