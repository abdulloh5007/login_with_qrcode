'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/login-form';
import QrScanner from '@/components/auth/qr-scanner';
import { QrCode, KeyRound } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('password');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="absolute top-4 left-4">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            На главную
          </Link>
        </Button>
      </div>
      <div className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card className="shadow-2xl rounded-xl border-2">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center mb-4">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path d="M11 11H19V19H11V11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M29 11H37V19H29V11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M11 29H19V37H11V29Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M22 29H26V33H22V29Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M29 22H33V26H29V22Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M29 33H37V37H29V33Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M33 29H37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 4V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 4H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M44 4V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M40 4H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 44V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 44H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M44 44V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M40 44H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M24 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 24H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M42 24H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M24 42V44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <CardTitle className="text-3xl font-headline">QRAuth</CardTitle>
              <CardDescription>
                Войдите в свою учетную запись
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Пароль
                </TabsTrigger>
                <TabsTrigger value="qr">
                  <QrCode className="mr-2 h-4 w-4" />
                  QR-код
                </TabsTrigger>
              </TabsList>
              <TabsContent value="password">
                <LoginForm />
              </TabsContent>
              <TabsContent value="qr">
                 {activeTab === 'qr' && <QrScanner onScanSuccess={(data) => console.log(data)} />}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </main>
  );
}
