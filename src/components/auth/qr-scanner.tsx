'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { Loader2, CheckCircle, CameraOff } from 'lucide-react';

interface QrScannerProps {
    onScanSuccess: (data: string) => void;
}

export default function QrScanner({ onScanSuccess }: QrScannerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeBox, setQrCodeBox] = useState<{ x: number; y: number; width: number; height: number; } | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const tick = () => {
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && !scanSuccess) {
        setLoading(false);
        const canvas = canvasRef.current;
        if (!canvas) {
            animationFrameId = requestAnimationFrame(tick);
            return;
        }
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
            animationFrameId = requestAnimationFrame(tick);
            return;
        }

        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          onScanSuccess(code.data);
          const qrBox = {
              x: code.location.topLeftCorner.x,
              y: code.location.topLeftCorner.y,
              width: code.location.topRightCorner.x - code.location.topLeftCorner.x,
              height: code.location.bottomLeftCorner.y - code.location.topLeftCorner.y
          };
          setQrCodeBox(qrBox);

          setScanSuccess(true);
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          cancelAnimationFrame(animationFrameId);

          if (code.data.includes('/auth/token/')) {
             setTimeout(() => {
                router.push(code.data);
             }, 1500);
          } else {
             setTimeout(() => {
                router.push('/dashboard');
             }, 1500);
          }
          return;
        } else {
            setQrCodeBox(null);
        }
      }
      if (!scanSuccess) {
          animationFrameId = requestAnimationFrame(tick);
      }
    };

    const startScan = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (video) {
          video.srcObject = stream;
          video.setAttribute('playsinline', 'true');
          video.play();
          animationFrameId = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setLoading(false);
        setError("Не удалось получить доступ к камере. Пожалуйста, предоставьте права доступа к камере в настройках вашего браузера.");
      }
    };

    startScan();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [router, scanSuccess, onScanSuccess]);

  return (
    <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center mt-6">
      {loading && <Loader2 className="animate-spin text-primary" size={48} />}
      
      <video ref={videoRef} className={`w-full h-full object-cover transition-opacity duration-300 ${loading || scanSuccess || error ? 'opacity-0' : 'opacity-100'}`} />
      <canvas ref={canvasRef} className="hidden" />

      {qrCodeBox && (
        <div
          className="absolute border-4 border-accent rounded-md transition-all duration-500 ease-in-out animate-pulse"
          style={{
            left: `${(qrCodeBox.x / (videoRef.current?.videoWidth || 1)) * 100}%`,
            top: `${(qrCodeBox.y / (videoRef.current?.videoHeight || 1)) * 100}%`,
            width: `${(qrCodeBox.width / (videoRef.current?.videoWidth || 1)) * 100}%`,
            height: `${(qrCodeBox.height / (videoRef.current?.videoHeight || 1)) * 100}%`,
            boxShadow: '0 0 20px 10px hsla(var(--accent), 0.5)'
          }}
        />
      )}
      
      {scanSuccess && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center transition-opacity duration-500">
          <CheckCircle className="text-green-500 animate-bounce" size={64} />
          <p className="mt-4 text-lg font-semibold text-foreground">Вход выполнен успешно!</p>
          <p className="text-sm text-muted-foreground">Перенаправление...</p>
        </div>
      )}
      
      {error && !loading && (
          <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4 text-center">
              <CameraOff className="text-destructive mb-4" size={48} />
              <p className="text-destructive font-semibold">Ошибка камеры</p>
              <p className="text-sm text-muted-foreground">{error}</p>
          </div>
      )}
    </div>
  );
}
