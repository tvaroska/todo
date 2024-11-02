'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState, useEffect } from 'react';
import { UserProvider } from '../context/UserContext';

export default function GoogleOAuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!clientId) {
      setError('Google Client ID is not configured');
    }
  }, [clientId]);

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <GoogleOAuthProvider 
      clientId={clientId}
      onScriptLoadError={() => setError('Failed to load Google OAuth')}
    >
      <UserProvider>
        {children}
      </UserProvider>
    </GoogleOAuthProvider>
  );
}
