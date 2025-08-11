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
      // This QR now represents a login token for THIS device/session.
      // An already authenticated device can scan this to log this device in.
      const loginToken = `qr-auth-token-${Date.now()}-${Math.random()}`;
      const loginUrl = `${baseUrl}/auth/token/${loginToken}`;
      
      QRCode.toCanvas(canvasRef.current, loginUrl, { 
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
  }, [baseUrl]);

  return (
    <Card className="p-4 bg-card shadow-lg rounded-lg border-2">
      <canvas ref={canvasRef} />
    </Card>
  );
}
