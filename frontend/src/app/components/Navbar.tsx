'use client';

import { useUser } from '../context/UserContext';
import { googleLogout } from '@react-oauth/google';

export default function Navbar() {
  const { user, setUser } = useUser();

  const handleLogout = () => {
    googleLogout();
    setUser(null);
  };

  return (
    <div className="navbar bg-black text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="text-xl font-semibold">TODO</div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
