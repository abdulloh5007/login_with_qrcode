'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import DeviceManager from '@/components/dashboard/device-manager';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DevicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p>Загрузка...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl relative">
        <header className="absolute -top-16 left-0 sm:top-4 sm:left-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Link>
          </Button>
        </header>
        <Card className="shadow-2xl rounded-xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Управление устройствами</CardTitle>
            <CardDescription>
              Просмотр и управление активными сеансами.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeviceManager />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
