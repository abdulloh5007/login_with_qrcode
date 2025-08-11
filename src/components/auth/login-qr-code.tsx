'use client';

import { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// In a real app, you would use a library like `pusher-js` or native WebSockets
// to listen for an authentication event from the server.
const MOCK_WEBSOCKET_DELAY = 2000; // ms

export default function LoginQrCode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  // This token would be generated and stored temporarily in your backend.
  const loginRequestToken = `login-request-${Date.now()}-${Math.random()}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, loginRequestToken, { 
        width: 256,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF' 
        }
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [loginRequestToken]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // This simulates a WebSocket or polling connection listening for the "authorization" event
    // after another device has scanned the QR code.
    const listenForAuthorization = () => {
      console.log(`Listening for authorization for token: ${loginRequestToken}`);
      
      // MOCK: Pretend we received an auth message after a delay.
      timeoutId = setTimeout(() => {
         // In a real app, the server would confirm this token was authorized.
         console.log(`Token ${loginRequestToken} has been authorized.`);
         setIsAuthorized(true);
      }, MOCK_WEBSOCKET_DELAY + Math.random() * 3000); // Add jitter
    };

    // Start listening when the component mounts
    listenForAuthorization();

    return () => {
      clearTimeout(timeoutId);
    }
  }, [loginRequestToken]);


  useEffect(() => {
    if (isAuthorized) {
        // Once authorized, redirect to the dashboard.
        setTimeout(() => {
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
    </div>
  );
}
