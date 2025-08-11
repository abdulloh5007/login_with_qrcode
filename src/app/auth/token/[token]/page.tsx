'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function TokenLoginPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token;

  useEffect(() => {
    if (token) {
      // Здесь должна быть логика проверки токена на сервере.
      // Для демонстрации мы просто перенаправляем пользователя.
      console.log('Аутентификация с токеном:', token);

      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);
    }
  }, [token, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Аутентификация</CardTitle>
          <CardDescription>Проверка вашего токена...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex flex-col items-center justify-center text-center">
                <CheckCircle className="h-16 w-16 text-green-500 animate-pulse" />
                <h2 className="mt-4 text-xl font-semibold">Вы успешно вошли!</h2>
                <p className="mt-2 text-muted-foreground">
                    Вы вошли как <span className="font-bold text-primary">Гость</span>.
                </p>
                <div className="flex items-center gap-2 mt-6">
                   <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
                   <p className="text-sm text-muted-foreground">Перенаправление на панель управления...</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
