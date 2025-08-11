
'use client';

import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Loader2, CheckCircle, CameraOff } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';


interface QrScannerProps {
    onScanSuccess?: (data: string) => void;
    onDialogClose?: () => void;
}

export default function QrScanner({ onScanSuccess, onDialogClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeBox, setQrCodeBox] = useState<{ x: number; y: number; width: number; height: number; } | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();


  const handleAuthorizeToken = async (token: string) => {
    setLoading(true);
    try {
        const docRef = doc(db, "loginRequests", token);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().status === 'pending') {
            await updateDoc(docRef, {
                status: "authorized",
                authorizedAt: new Date(),
                // In a real app, you'd also save which user authorized it.
                // authorizedBy: auth.currentUser.uid 
            });
            setScanSuccess(true);
            if (onScanSuccess) {
                onScanSuccess(token);
            }
             setTimeout(() => {
                if (onDialogClose) onDialogClose();
            }, 1500);
        } else {
             toast({
                variant: 'destructive',
                title: 'Неверный QR-код',
                description: 'Этот QR-код недействителен или уже был использован.',
            });
            setError('Неверный или просроченный QR-код.');
        }
    } catch (err) {
        console.error("Error authorizing token:", err);
        setError("Произошла ошибка при авторизации. Попробуйте снова.");
        toast({
            variant: 'destructive',
            title: 'Ошибка сервера',
            description: 'Не удалось авторизовать устройство. Пожалуйста, попробуйте позже.',
        });
    } finally {
        setLoading(false);
    }
  }


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
          
          const qrBox = {
              x: code.location.topLeftCorner.x,
              y: code.location.topLeftCorner.y,
              width: code.location.topRightCorner.x - code.location.topLeftCorner.x,
              height: code.location.bottomLeftCorner.y - code.location.topLeftCorner.y
          };
          setQrCodeBox(qrBox);

          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          cancelAnimationFrame(animationFrameId);

          // Once a QR code is found, try to authorize it.
          handleAuthorizeToken(code.data);
          
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
          await video.play();
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
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanSuccess]);

  return (
    <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center mt-6">
      {loading && !scanSuccess && <Loader2 className="animate-spin text-primary" size={48} />}
      
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
          <p className="mt-4 text-lg font-semibold text-foreground">Устройство авторизовано!</p>
          <p className="text-sm text-muted-foreground">Закрытие сканера...</p>
        </div>
      )}
      
      {error && !loading && (
          <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4 text-center">
              <CameraOff className="text-destructive mb-4" size={48} />
              <p className="text-destructive font-semibold">Ошибка сканирования</p>
              <p className="text-sm text-muted-foreground">{error}</p>
          </div>
      )}
    </div>
  );
}
