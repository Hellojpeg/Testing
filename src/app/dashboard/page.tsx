
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { User } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const getInitials = (email: string | null) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md shadow-lg border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Dashboard</CardTitle>
          <CardDescription>Welcome back to your personal dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={user.photoURL || undefined} alt="User Avatar" />
              <AvatarFallback className="text-3xl">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {user.displayName || 'Welcome, User!'}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
