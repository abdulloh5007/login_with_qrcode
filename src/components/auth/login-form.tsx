'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const getFriendlyAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Неверный адрес электронной почты или пароль.';
    case 'auth/invalid-email':
      return 'Некорректный формат адреса электронной почты.';
    case 'auth/user-disabled':
      return 'Эта учетная запись была отключена.';
    case 'auth/too-many-requests':
      return 'Слишком много попыток входа. Попробуйте позже.';
    default:
      return 'Произошла неизвестная ошибка. Пожалуйста, попробуйте еще раз.';
  }
}


export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка входа',
        description: getFriendlyAuthErrorMessage(error.code),
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Эл. почта</Label>
            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading} 
              />
              <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Нет аккаунта? <Link href="/register" className="underline text-primary">Зарегистрироваться</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
