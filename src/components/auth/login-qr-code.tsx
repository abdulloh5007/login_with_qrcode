
'use client';

import { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default function LoginQrCode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  const loginRequestToken = useRef(uuidv4()).current;

  useEffect(() => {
    const createLoginRequest = async () => {
      try {
        await setDoc(doc(db, 'loginRequests', loginRequestToken), {
          status: 'pending',
          createdAt: new Date(),
        });
        
        if (canvasRef.current) {
          QRCode.toCanvas(canvasRef.current, loginRequestToken, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          }, (error) => {
            if (error) console.error('QR Code Generation Error:', error);
          });
        }
      } catch (error) {
        console.error("Error creating login request:", error);
      }
    };
    createLoginRequest();

    const unsub = onSnapshot(doc(db, "loginRequests", loginRequestToken), (doc) => {
        const data = doc.data();
        if (data && data.status === 'authorized') {
            setIsAuthorized(true);
            unsub(); 
        }
    });

    return () => {
        unsub();
    }
  }, [loginRequestToken]);


  useEffect(() => {
    if (isAuthorized) {
        // Once authorized, redirect to the dashboard.
        setTimeout(() => {
            // Here you would typically handle the actual login, e.g., set a cookie/session.
            // For now, we'll just redirect.
            router.push('/dashboard');
        }, 1500);
    }
  }, [isAuthorized, router]);


  return (
    <div className="flex flex-col items-center justify-center pt-6 space-y-4">
        <p className="text-center text-sm text-muted-foreground max-w-sm">
            Чтобы войти, отсканируйте этот QR-код с помощью уже авторизованного устройства.
        </p>
        <Card className="p-4 bg-card shadow-lg rounded-lg border-2">
            <canvas ref={canvasRef} />
        </Card>
        {isAuthorized && (
            <div className="flex items-center gap-2 text-green-600">
                <Loader2 className="animate-spin h-4 w-4" />
                <p className="font-semibold">Авторизация успешна! Перенаправление...</p>
            </div>
        )}
         {!isAuthorized && (
             <div className="flex items-center gap-2 text-muted-foreground pt-4">
                <Loader2 className="animate-spin h-4 w-4" />
                <p>Ожидание сканирования...</p>
            </div>
        )}
    </div>
  );
}
