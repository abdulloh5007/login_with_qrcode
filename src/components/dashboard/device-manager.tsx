'use client';

import { useState } from 'react';
import { Smartphone, Monitor, Tablet, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type Device = {
  id: string;
  type: 'mobile' | 'desktop' | 'tablet';
  name: string;
  lastSeen: string;
  isCurrent: boolean;
};

const mockDevices: Device[] = [
  { id: '1', type: 'desktop', name: 'Chrome on Windows', lastSeen: 'Сейчас', isCurrent: true },
  { id: '2', type: 'mobile', name: 'iPhone 15 Pro', lastSeen: '2 часа назад', isCurrent: false },
  { id: '3', type: 'tablet', name: 'iPad Air', lastSeen: '1 день назад', isCurrent: false },
  { id: '4', type: 'desktop', name: 'Safari on macOS', lastSeen: '3 дня назад', isCurrent: false },
];

const getDeviceIcon = (type: Device['type']) => {
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
  const [devices, setDevices] = useState(mockDevices);

  const handleTerminateSession = (id: string) => {
    setDevices(devices.filter((device) => device.id !== id));
  };

  const handleTerminateAllOtherSessions = () => {
    setDevices(devices.filter((device) => device.isCurrent));
  };

  return (
    <div className="w-full space-y-6 pt-4">
      <ul className="space-y-4">
        {devices.map((device) => (
          <li key={device.id}>
            <Card className={`transition-all ${device.isCurrent ? 'border-primary' : ''}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getDeviceIcon(device.type)}
                  <div>
                    <p className="font-semibold text-foreground">{device.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {device.isCurrent ? (
                        <>
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                          <span>Текущий сеанс</span>
                        </>
                      ) : (
                        <span>Последний раз: {device.lastSeen}</span>
                      )}
                    </div>
                  </div>
                </div>
                {!device.isCurrent && (
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
                          Это действие приведет к выходу из сеанса на устройстве '{device.name}'. Это действие нельзя отменить.
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
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <Separator />
      <div className="flex flex-col items-center gap-2">
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
    </div>
  );
}
