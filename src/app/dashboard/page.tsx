
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Spinner size="lg" />
        <p className="ml-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    // This typically won't be seen due to the redirect, but good for completeness
    return (
       <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
         <p className="text-muted-foreground">Redirecting to login...</p>
       </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <LayoutDashboard className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Dashboard
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Welcome to your protected dashboard, {user.email}!
        </p>
      </section>

      <Card className="shadow-md border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-500" />
            Protected Content
          </CardTitle>
          <CardDescription>
            This page is only accessible to logged-in users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your user ID: {user.uid}</p>
          <p>More dashboard content can go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
