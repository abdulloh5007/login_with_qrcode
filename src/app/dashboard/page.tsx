'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut, SlidersHorizontal, QrCode } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import QrCodeScannerDialog from '@/components/dashboard/qr-code-scanner-dialog';
import { useAuth } from '@/hooks/use-auth';

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
       <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl relative">
        <header className="absolute -top-16 right-0 sm:top-4 sm:right-4">
          <Button variant="ghost" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </header>
        <Card className="shadow-2xl rounded-xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Добро пожаловать в QRAuth</CardTitle>
            <CardDescription>
              Вы вошли как <span className="font-bold">{user.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-6">
            <div className="w-full flex flex-col items-center gap-4">
               <QrCodeScannerDialog />
               <p className="text-center text-muted-foreground max-w-xs text-sm">
                  Используйте сканер, чтобы войти в свою учетную запись на другом устройстве.
               </p>
            </div>
            
            <Separator className="my-4" />

            <div className="w-full flex flex-col items-center gap-2">
                <p className="text-center text-muted-foreground">
                    Управляйте своими активными сеансами.
                </p>
                <Button asChild>
                    <Link href="/dashboard/devices">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Управление устройствами
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
