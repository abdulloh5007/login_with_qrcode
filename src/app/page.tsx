'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ArrowRight, KeyRound, QrCode } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2">
              <path d="M11 11H19V19H11V11Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
              <path d="M29 11H37V19H29V11Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
              <path d="M11 29H19V37H11V29Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
              <path d="M22 29H26V33H22V29Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
              <path d="M29 22H33V26H29V22Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
              <path d="M29 33H37V37H29V33Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
              <path d="M33 29H37" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 4V8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 4H4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M44 4V8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M40 4H44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 44V40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 44H4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M44 44V40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M40 44H44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24 4V6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 24H6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M42 24H44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24 42V44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-bold">QRAuth</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeSwitcher />
            <Button asChild>
              <Link href="/login">
                Войти
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-headline tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Безопасная и быстрая аутентификация с <span className="text-primary">QRAuth</span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Забудьте о сложных паролях. Войдите в систему мгновенно, отсканировав QR-код.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/login">Начать</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/register">Зарегистрироваться</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="container space-y-6 bg-slate-50 dark:bg-slate-900/50 py-8 md:py-12 lg:py-24 rounded-lg">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="font-headline text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Возможности</h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    QRAuth предлагает современный подход к аутентификации, делая вход в систему быстрым, удобным и безопасным.
                </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                <Card className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <QrCode className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-headline text-xl">Вход по QR-коду</h3>
                    <p className="text-muted-foreground">
                        Войдите на любом устройстве, просто отсканировав QR-код. Никаких паролей не требуется.
                    </p>
                </Card>
                <Card className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-headline text-xl">Классический вход</h3>
                    <p className="text-muted-foreground">
                        Предпочитаете традиционные методы? Используйте свою электронную почту и пароль для входа.
                    </p>
                </Card>
                <Card className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <h3 className="mb-2 font-headline text-xl">Управление сеансами</h3>
                    <p className="text-muted-foreground">
                        Просматривайте все активные сеансы и выходите из системы на любом устройстве для дополнительной безопасности.
                    </p>
                </Card>
            </div>
        </section>
        <section className="container py-12">
            <Image src="https://placehold.co/1200x400.png" width={1200} height={400} alt="placeholder" className="rounded-lg shadow-2xl" data-ai-hint="technology security" />
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} QRAuth. Все права защищены.
            </p>
        </div>
      </footer>
    </div>
  );
}
