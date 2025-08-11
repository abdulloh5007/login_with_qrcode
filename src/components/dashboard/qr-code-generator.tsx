'use client';

import { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';

export default function QrCodeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Этот хук гарантирует, что window.location будет доступен только на клиенте
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (canvasRef.current && baseUrl) {
      // Mock user-specific login token
      const loginToken = `qr-auth-token-${Date.now()}-${Math.random()}`;
      const loginUrl = `${baseUrl}/auth/token/${loginToken}`;
      
      QRCode.toCanvas(canvasRef.current, loginUrl, { 
        width: 256,
        margin: 2,
        color: {
            dark: '#000000', // Black
            light: '#00000000' // Transparent
        }
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [baseUrl]);

  return (
    <Card className="p-4 bg-card shadow-lg rounded-lg border-2">
      <canvas ref={canvasRef} />
    </Card>
  );
}
