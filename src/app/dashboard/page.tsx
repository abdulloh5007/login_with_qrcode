import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import QrCodeGenerator from '@/components/dashboard/qr-code-generator';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl relative">
        <header className="absolute -top-16 right-0 sm:top-4 sm:right-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Link>
          </Button>
        </header>
        <Card className="shadow-2xl rounded-xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Welcome to QRAuth</CardTitle>
            <CardDescription>
              Your personal dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-6">
            <p className="text-center text-muted-foreground max-w-sm">
              Scan this QR code with another device to log in instantly.
            </p>
            <QrCodeGenerator />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
