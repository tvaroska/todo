// pages/admin.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../../types';

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      // Redirect or show error
      return;
    }

    // Fetch users
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    };

    fetchUsers();
  }, [user]);

  const updateUserRole = async (userId: number, newRole: string) => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      await fetch(`${apiUrl}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      // Refresh users list
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  if (user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center space-x-4 p-4 border rounded">
            <span>{user.email}</span>
            <select
              value={user.role}
              onChange={(e) => updateUserRole(user.id, e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
