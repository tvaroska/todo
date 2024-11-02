'use client';

import { useGoogleOneTapLogin, CredentialResponse } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';

interface GoogleCredential {
  name: string;
  email: string;
  picture: string;
}

export default function GoogleLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setUser } = useUser();

  useGoogleOneTapLogin({
    onSuccess: (credentialResponse: CredentialResponse) => {
      console.log(credentialResponse);
      try {
        if (credentialResponse.credential) {
          const decoded: GoogleCredential = jwtDecode(credentialResponse.credential);
          setUser({
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture
          });
        }
      } catch (error) {
        setError('Failed to decode user information');
      }
      setIsLoading(false);
    },
    onError: () => {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    },
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

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        Initializing login...
      </div>
    );
  }

  return null;
}
