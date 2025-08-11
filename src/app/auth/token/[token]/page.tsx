'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function TokenLoginPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<'pending' | 'authorized' | 'expired'>('pending');

  useEffect(() => {
    if (!token) {
        setStatus('expired');
        return;
    };

    const docRef = doc(db, "loginRequests", token);
    const unsubscribe = onSnapshot(docRef, (doc) => {
        const data = doc.data();
        if (doc.exists() && data && data.status === 'authorized' && data.sessionId) {
            setStatus('authorized');
            // This is a simplified "login". The auth state is managed on the login page via QR code component
            // This page just confirms the login was successful and redirects.
            setTimeout(() => {
                router.push('/dashboard');
            }, 2500);
            unsubscribe();
        } else if (!doc.exists()) {
            setStatus('expired');
            unsubscribe();
        }
    });
    
    // Clean up the listener if the user navigates away or component unmounts
    return () => unsubscribe();

  }, [token, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Аутентификация</CardTitle>
          <CardDescription>
            {status === 'pending' && 'Проверка вашего токена...'}
            {status === 'authorized' && 'Вход выполнен успешно!'}
            {status === 'expired' && 'Ссылка недействительна или срок ее действия истек.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
           {status === 'pending' && (
                <div className="flex flex-col items-center justify-center text-center">
                   <Loader2 className="animate-spin h-16 w-16 text-primary" />
                   <p className="mt-4 text-muted-foreground">Ожидание авторизации...</p>
                </div>
            )}
            {status === 'authorized' && (
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
            )}
             {status === 'expired' && (
                <div className="flex flex-col items-center justify-center text-center">
                    <XCircle className="h-16 w-16 text-destructive" />
                    <h2 className="mt-4 text-xl font-semibold">Ошибка входа</h2>
                    <p className="mt-2 text-muted-foreground">
                        Пожалуйста, сгенерируйте новый QR-код и попробуйте снова.
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
