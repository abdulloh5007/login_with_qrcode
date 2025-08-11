import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut, SlidersHorizontal } from 'lucide-react';
import QrCodeGenerator from '@/components/dashboard/qr-code-generator';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl relative">
        <header className="absolute -top-16 right-0 sm:top-4 sm:right-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Link>
          </Button>
        </header>
        <Card className="shadow-2xl rounded-xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Добро пожаловать в QRAuth</CardTitle>
            <CardDescription>
              Ваша личная панель управления.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-6">
            <p className="text-center text-muted-foreground max-w-sm">
              Отсканируйте этот QR-код другим устройством для мгновенного входа.
            </p>
            <QrCodeGenerator />
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
