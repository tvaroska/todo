'use client';

import { UserProvider } from '../context/UserContext';

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserProvider>{children}</UserProvider>;
}
