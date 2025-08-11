'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

type Device = {
  id: string;
  userAgent: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

const parseUserAgent = (ua: string) => {
    let browser = 'Неизвестный браузер';
    let os = 'Неизвестная ОС';

    // OS detection
    if (ua.includes('Windows NT')) os = 'Windows';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    // Browser detection
    if (ua.includes('Chrome') && !ua.includes('Chromium')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('MSIE') || ua.includes('Trident/')) browser = 'Internet Explorer';
    else if (ua.includes('Edge')) browser = 'Edge';

    return `${browser} на ${os}`;
};


const getDeviceType = (userAgent: string): 'mobile' | 'desktop' | 'tablet' => {
    const lowerUa = userAgent.toLowerCase();
    if (/mobile/.test(lowerUa) || /iphone/.test(lowerUa) || /android/.test(lowerUa)) return 'mobile';
    if (/tablet/.test(lowerUa) || /ipad/.test(lowerUa)) return 'tablet';
    return 'desktop';
};

const getDeviceIcon = (type: 'mobile' | 'desktop' | 'tablet') => {
  switch (type) {
    case 'mobile':
      return <Smartphone className="h-6 w-6 text-muted-foreground" />;
    case 'desktop':
      return <Monitor className="h-6 w-6 text-muted-foreground" />;
    case 'tablet':
      return <Tablet className="h-6 w-6 text-muted-foreground" />;
  }
};

export default function DeviceManager() {
  const { user, currentSessionId } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  
  const currentDevice = devices.find(d => d.id === currentSessionId);
  const otherDevices = devices.filter(d => d.id !== currentSessionId);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, `users/${user.uid}/sessions`));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userDevices: Device[] = [];
      querySnapshot.forEach((doc) => {
        userDevices.push({
          id: doc.id,
          ...doc.data(),
        } as Device);
      });
      setDevices(userDevices.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
    });

    return () => unsubscribe();
  }, [user, currentSessionId]);

  const handleTerminateSession = async (sessionId: string) => {
    if (!user) return;
    const sessionRef = doc(db, `users/${user.uid}/sessions`, sessionId);
    await deleteDoc(sessionRef);
  };
  
  const handleTerminateAllOtherSessions = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    otherDevices.forEach(device => {
        const sessionRef = doc(db, `users/${user.uid}/sessions`, device.id);
        batch.delete(sessionRef);
    });
    await batch.commit();
  }

  return (
    <div className="w-full space-y-6 pt-4">
        {currentDevice && (
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Текущее устройство</h3>
            <Card className='border-primary bg-primary/5'>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getDeviceIcon(getDeviceType(currentDevice.userAgent))}
                  <div>
                    <p className="font-semibold text-foreground">{parseUserAgent(currentDevice.userAgent)}</p>
                    <div className="flex items-center gap-2 text-sm text-green-500">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Это устройство</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {otherDevices.length > 0 && (
        <>
            <div className="flex justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full max-w-xs">
                            Завершить все другие сеансы
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                        Это действие приведет к выходу из всех других сеансов. Вам нужно будет снова войти на этих устройствах.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                        onClick={handleTerminateAllOtherSessions}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                        Завершить сеансы
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <Separator className='my-6'/>
        </>
      )}

      {otherDevices.length > 0 && (
        <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Другие сеансы</h3>
            <ul className="space-y-4">
                {otherDevices.map((device) => (
                <li key={device.id}>
                    <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                        {getDeviceIcon(getDeviceType(device.userAgent))}
                        <div>
                            <p className="font-semibold text-foreground">{parseUserAgent(device.userAgent)}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>
                                    {formatDistanceToNow(new Date(device.createdAt.seconds * 1000), { addSuffix: true, locale: ru })}
                                </span>
                            </div>
                        </div>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Это действие приведет к выходу из сеанса на устройстве '{parseUserAgent(device.userAgent)}'. Это действие нельзя отменить.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                onClick={() => handleTerminateSession(device.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                Завершить сеанс
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                    </Card>
                </li>
                ))}
            </ul>
        </div>
      )}

       {devices.length === 0 && !currentDevice && (
         <div className="text-center text-muted-foreground py-8">
            <HelpCircle className="mx-auto h-12 w-12" />
            <p className="mt-4">Нет активных сеансов.</p>
         </div>
       )}
    </div>
  );
}
