'use client';

import { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default function LoginQrCode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  
  const loginRequestToken = useRef(uuidv4()).current;

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const createLoginRequest = async () => {
      try {
        const loginUrl = `${window.location.origin}/auth/token/${loginRequestToken}`;
        
        await setDoc(doc(db, 'loginRequests', loginRequestToken), {
          status: 'pending',
          createdAt: new Date(),
          token: loginRequestToken
        });
        
        if (canvasRef.current) {
          QRCode.toCanvas(canvasRef.current, loginUrl, {
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

        // Listen for authorization
        unsubscribe = onSnapshot(doc(db, "loginRequests", loginRequestToken), (doc) => {
            const data = doc.data();
            if (data && data.status === 'authorized' && data.sessionId) {
                setIsAuthorized(true);
                sessionStorage.setItem('currentSessionId', data.sessionId);
                // We don't call loginWithToken here. The session is already created.
                // The auth state will be managed via a custom token signIn in a real scenario
                // For now, we redirect and let useAuth handle the state.
                if(unsubscribe) unsubscribe();
            }
        });

      } catch (error) {
        console.error("Error creating login request:", error);
      }
    };
    
    createLoginRequest();

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
        // Clean up the request document if the user navigates away before auth
        if(!isAuthorized) {
             deleteDoc(doc(db, "loginRequests", loginRequestToken));
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginRequestToken]);


  useEffect(() => {
    if (isAuthorized) {
        // We need a way to sign in the user. In a real app, you'd get a custom token.
        // For this demo, we'll redirect and the other page will handle the "logged in" view.
        // A proper implementation requires signInWithCustomToken.
        // The token-page will redirect to dashboard
        router.push(`/auth/token/${loginRequestToken}`);
    }
  }, [isAuthorized, router, loginRequestToken]);


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
