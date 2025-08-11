'use client';

import { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';

export default function QrCodeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Mock user-specific login token
      const loginToken = `qr-auth-token-${Date.now()}-${Math.random()}`;
      QRCode.toCanvas(canvasRef.current, loginToken, { 
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
  }, []);

  return (
    <Card className="p-4 bg-card shadow-lg rounded-lg border-2">
      <canvas ref={canvasRef} />
    </Card>
  );
}
