'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const checkPasswordStrength = (password: string): {level: number, has: {[key: string]: boolean}} => {
    let typesCount = 0;

    const has = {
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      digits: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
      length: password.length >= 8
    };

    if (has.lowercase) typesCount++;
    if (has.uppercase) typesCount++;
    if (has.digits) typesCount++;
    if (has.special) typesCount++;
    
    let level = 0;
    if (password.length > 0) {
      level = typesCount;
      if (has.length && typesCount >= 3) {
         level = 4;
      }
    }


    return { level, has };
};


const PasswordStrengthIndicator = ({ strength }: { strength: {level: number, has: {[key: string]: boolean}} }) => {
    const strengthLevels = [
        { label: "Очень слабый", color: "bg-gray-200 dark:bg-gray-700" }, // level 0
        { label: "Слабый", color: "bg-red-500" },      // level 1
        { label: "Нормальный", color: "bg-orange-500" }, // level 2
        { label: "Хороший", color: "bg-yellow-500" },    // level 3
        { label: "Сложный", color: "bg-green-500" }     // level 4
    ];

    const requirements = [
        { key: 'lowercase', text: 'маленькие буквы: [a-z]' },
        { key: 'uppercase', text: 'большие буквы: [A-Z]' },
        { key: 'digits', text: 'цифры: [0-9]' },
        { key: 'special', text: 'спецсимволы: [^a-zA-Z0-9]' },
        { key: 'length', text: 'не менее 8 символов' }
    ];

    return (
        <div className="space-y-3 pt-2">
            <div className="flex gap-1.5">
                {strengthLevels.slice(1).map((level, index) => (
                    <div
                        key={index}
                        className={`h-2 flex-1 rounded-full ${strength.level > index ? level.color : strengthLevels[0].color}`}
                        title={level.label}
                    />
                ))}
            </div>
            <div className="space-y-1">
                {requirements.map(req => (
                     <div key={req.key} className={`flex items-center text-xs transition-colors ${strength.has[req.key] ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <CheckCircle className={`h-3 w-3 mr-2 ${strength.has[req.key] ? 'opacity-100' : 'opacity-50'}`} />
                        <span>{req.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, has: {} });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Ошибка регистрации',
        description: 'Пароли не совпадают.',
      });
      return;
    }
    try {
      await register(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка регистрации',
        description: error.message,
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value;
      setPassword(newPassword);
      const result = checkPasswordStrength(newPassword);
      setPasswordStrength(result);
  };

  return (
    <Card className="border-0 shadow-none">
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Эл. почта</Label>
            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={handlePasswordChange}
                 />
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                 >
                    {showPassword ? <EyeOff /> : <Eye />}
                 </Button>
            </div>
            {password.length > 0 && <PasswordStrengthIndicator strength={passwordStrength} />}
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirm-password">Подтвердите пароль</Label>
             <div className="relative">
                <Input 
                  id="confirm-password" 
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                 >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                 </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={passwordStrength.level < 4}>
            Зарегистрироваться
          </Button>
           <p className="text-xs text-muted-foreground text-center">
            Уже есть аккаунт? <Link href="/login" className="underline text-primary">Войти</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
