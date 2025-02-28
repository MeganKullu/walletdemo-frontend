import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

interface DecodedToken {
    sub: string;
    role: string;
    exp: number;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            router.push('/auth/login');
            return;
        }
        
        try {
            // Decode the token to check expiration and role
            const decoded = jwtDecode<DecodedToken>(token);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp < currentTime) {
                // Token expired
                localStorage.removeItem('token');
                router.push('/auth/login');
                return;
            }
            
            // Check if admin role is required
            if (requireAdmin && decoded.role !== 'ADMIN') {
                router.push('/dashboard');
                return;
            }
            
            setIsAuthenticated(true);
        } catch (error) {
            localStorage.removeItem('token');
            router.push('/auth/login');
        } finally {
            setIsLoading(false);
        }
    }, [router, requireAdmin]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? <>{children}</> : null;
}