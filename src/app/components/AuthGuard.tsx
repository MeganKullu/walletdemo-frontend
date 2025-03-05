'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            try {
                const decodedToken: any = jwtDecode(token);

                // Check if token is expired
                if (decodedToken.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    router.push('/auth/login');
                    return;
                }

                // Store user name for display purposes
                localStorage.setItem('userName', decodedToken.name);

                setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('token');
                router.push('/auth/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}