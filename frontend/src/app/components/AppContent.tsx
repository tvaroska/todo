'use client';

import { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../contexts/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useEnvCheck } from '../hooks/useEnvCheck';

function ConfigurationGuide() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Configuration Required</h1>
        <p>Please set up your Google OAuth client ID:</p>
        <ol className="list-decimal list-inside text-left space-y-2">
          <li>Create a project in Google Cloud Console</li>
          <li>Enable Google OAuth2 API</li>
          <li>Create OAuth 2.0 credentials</li>
          <li>Copy the client ID</li>
          <li>Add it to .env.local as CLIENT_ID</li>
        </ol>
        <p className="text-sm text-gray-600 mt-4">
          After setting up, restart the development server
        </p>
      </div>
    </div>
  );
}

function MainContent() {
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

export default function AppContent() {
  const [mounted, setMounted] = useState(false);
  const { isConfigured, clientId } = useEnvCheck();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!isConfigured) {
    return <ConfigurationGuide />;
  }

  return (
    <GoogleOAuthProvider clientId={clientId || ''}>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
