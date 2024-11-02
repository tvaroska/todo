'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';

export default function GoogleLogin() {
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useUser();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const userInfo = await userInfoResponse.json();
        
        setUser({
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
          accessToken: tokenResponse.access_token,
        });
      } catch (error) {
        console.error('Login error:', error);
        setError(error instanceof Error ? error.message : 'Failed to complete login');
      }
    },
    onError: () => {
      setError('Login failed. Please try again.');
    },
    scope: 'email profile https://www.googleapis.com/auth/tasks',
    ux_mode: 'popup',
  });

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => login()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Sign in with Google
      </button>
    );
  }

  return null;
}
