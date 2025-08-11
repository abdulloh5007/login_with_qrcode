'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import QrScanner from '../auth/qr-scanner';

export default function QrCodeScannerDialog() {
  const [open, setOpen] = useState(false);

  const handleScanSuccess = (data: string) => {
    console.log('Scanned data:', data);
    // The success UI is handled within the QrScanner component.
    // The scanner will auto-close the dialog via the onDialogClose prop.
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full max-w-xs">
          <QrCode className="mr-2 h-5 w-5" />
          Войти на новом устройстве
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Сканировать QR-код</DialogTitle>
          <DialogDescription>
            Наведите камеру на QR-код, отображаемый на другом устройстве, чтобы войти в систему.
          </DialogDescription>
        </DialogHeader>
        {open && (
           <QrScanner 
                onScanSuccess={handleScanSuccess} 
                onDialogClose={() => setOpen(false)}
            />
        )}
      </DialogContent>
    </Dialog>
  );
}
