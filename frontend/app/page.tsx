'use client';

import { useUser } from "./context/UserContext";
import TaskList from "./components/TaskList";

const DEMO = [
  {
    name: 'First',
    description: 'First task',
    dueDate: new Date('2024-04-11'),
    status: 'pending' as const
  },
  {
    name: 'Second',
    description: 'Second task',
    dueDate: new Date('2024-04-12'),
    status: 'in-progress' as const
  },
  {
    name: 'Third',
    description: 'Third task',
    dueDate: new Date('2024-04-13'),
    status: 'completed' as const
  }
];

export default function Home() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Task App
        </h1>
      </div>
    );
  }

  return <TaskList tasks={DEMO} />;
}
