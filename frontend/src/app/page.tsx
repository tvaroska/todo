'use client';

import GoogleLogin from "./components/GoogleLogin";
import { useUser } from "./context/UserContext";

export default function Home() {
  const { user } = useUser();

  return (
    <>
      <GoogleLogin />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900">
          TODO App
        </h1>
        <p className="text-xl text-gray-600">
          {user ? `Welcome, ${user.name}` : 'Welcome, please sign in'}
        </p>
      </div>
    </>
  )
}
