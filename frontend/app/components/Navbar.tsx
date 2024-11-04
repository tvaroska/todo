'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import LoginForm from './LoginForm';

export default function Navbar() {
  const { user, logout } = useUser();
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleLogout = () => {
    console.log('Handling logout');
    logout();
  };

  const handleLoginClick = () => {
    console.log('Opening login form');
    setShowLoginForm(true);
  };

  return (
    <>
      <nav className="border-b bg-black text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-white hover:text-gray-300 transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="text-white hover:text-gray-300 transition-colors"
              >
                About
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-gray-300">{user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleLoginClick}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      {showLoginForm && (
        <LoginForm onClose={() => setShowLoginForm(false)} />
      )}
    </>
  );
}
