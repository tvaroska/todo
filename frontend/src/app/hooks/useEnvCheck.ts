'use client';

import { useState, useEffect } from 'react';

export function useEnvCheck() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_CLIENT_ID;
    setClientId(id || null);
    setIsConfigured(!!id && id !== 'your-google-client-id-here');
  }, []);

  return { isConfigured, clientId };
}
