'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
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

const getDeviceType = (userAgent: string): 'mobile' | 'desktop' | 'tablet' => {
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
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
                    <p className="font-semibold text-foreground">{currentDevice.userAgent}</p>
                    <div className="flex items-center gap-2 text-sm text-green-500">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Это устройство</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {otherDevices.length > 0 && <Separator className='my-6'/>}
          </div>
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
                            <p className="font-semibold text-foreground">{device.userAgent}</p>
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
                                Это действие приведет к выходу из сеанса на устройстве '{device.userAgent}'. Это действие нельзя отменить.
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
    </div>
  );
}
