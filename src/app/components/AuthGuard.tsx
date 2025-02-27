'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const isAdmin = decoded.role === 'ADMIN';
      
      if (requireAdmin && !isAdmin) {
        router.push('/dashboard');
        return;
      }

      if (!requireAdmin && isAdmin) {
        router.push('/admin/approve-users');
        return;
      }

      setAuthorized(true);
    } catch (error) {
      localStorage.removeItem('token');
      router.push('/auth/login');
    }
  }, [router, requireAdmin]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}