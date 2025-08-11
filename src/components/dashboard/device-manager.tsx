'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

type Device = {
  id: string;
  userAgent: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  isCurrent: boolean;
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

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, `users/${user.uid}/sessions`));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userDevices: Device[] = [];
      querySnapshot.forEach((doc) => {
        userDevices.push({
          id: doc.id,
          ...doc.data(),
          isCurrent: doc.id === currentSessionId
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
    if (!user || !currentSessionId) return;
    const batch = writeBatch(db);
    devices
      .filter((device) => !device.isCurrent)
      .forEach((device) => {
        const sessionRef = doc(db, `users/${user.uid}/sessions`, device.id);
        batch.delete(sessionRef);
      });
    await batch.commit();
  };
  
  const currentDevice = devices.find(d => d.isCurrent);
  const otherDevices = devices.filter(d => !d.isCurrent);


  return (
    <div className="w-full space-y-6 pt-4">
      {currentDevice && (
          <div>
            <Card className='border-primary'>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getDeviceIcon(getDeviceType(currentDevice.userAgent))}
                  <div>
                    <p className="font-semibold text-foreground">{currentDevice.userAgent}</p>
                    <div className="flex items-center gap-2 text-sm text-green-500">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Текущий сеанс</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {otherDevices.length > 0 && (
                 <div className="mt-6 flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                        Если вы не узнаете какое-либо устройство, вы можете завершить все остальные сеансы для безопасности.
                    </p>
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full max-w-xs">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Завершить все другие сеансы
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Завершить все другие сеансы?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы выйдете из системы на всех устройствах, кроме текущего. Это поможет защитить вашу учетную запись, если вы считаете, что она была скомпрометирована.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleTerminateAllOtherSessions}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Завершить все
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
            {otherDevices.length > 0 && <Separator className='my-6'/>}
          </div>
      )}
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
  );
}
