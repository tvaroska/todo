'use client';

import GoogleLogin from "./components/GoogleLogin";
import TaskList from "./components/TaskList";
import { useUser } from "./context/UserContext";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
        {!user ? (
          <>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900">
              TODO App
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Welcome, please sign in to see your tasks
            </p>
            <GoogleLogin />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
            <TaskList />
          </>
        )}
      </div>
    </div>
  );
}
