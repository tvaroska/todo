// pages/index.tsx
import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { GoogleLogin } from '@react-oauth/google';
  
export default function Home() {
    const { user, login, logout } = useAuth();
  
    const handleGoogleSuccess = async (response: any) => {
      try {
        const res = await fetch('http://localhost:8000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: response.credential }),
        });
  
        const data = await res.json();
        login(data.access_token, data.user);
      } catch (error) {
        console.error('Login failed:', error);
      }
    };
  
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Welcome to User Management App</h1>
        
        {!user ? (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Login Failed')}
          />
        ) : (
          <div className="space-y-4">
            <p>Welcome, {user.email}</p>
            <p>Role: {user.role}</p>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }
