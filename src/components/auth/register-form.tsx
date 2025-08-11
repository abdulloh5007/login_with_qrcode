'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const checkPasswordStrength = (password: string): {level: number, label: string, suggestions: string[]} => {
    let typesCount = 0;
    const suggestions: string[] = [];

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigits = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (hasLowercase) typesCount++;
    if (hasUppercase) typesCount++;
    if (hasDigits) typesCount++;
    if (hasSpecial) typesCount++;

    let level = typesCount;
    let label = "";

    if (level === 1) label = "Слабый";
    else if (level === 2) label = "Нормальный";
    else if (level === 3) label = "Хороший";
    else if (level === 4 && password.length > 8) label = "Сложный";
    else if (level === 4) {
      level = 3; // Downgrade level if length is not sufficient
      label = "Хороший";
    }
    else {
      level = 1;
      label = "Слабый"
    }


    if (level < 4) {
        if (!hasLowercase) suggestions.push("Добавьте маленькие буквы");
        if (!hasUppercase) suggestions.push("Добавьте большие буквы");
        if (!hasDigits) suggestions.push("Добавьте цифры");
        if (!hasSpecial) suggestions.push("Добавьте спецсимвол");
        if (password.length <= 8) suggestions.push("Сделайте пароль длиннее 8 символов");
    }

    if (level > 4) level = 4;
    if (level === 4 && password.length > 8) {
        label = "Сложный";
        suggestions.length = 0;
    }

    return { level, label, suggestions };
};


const PasswordStrengthIndicator = ({ strength }: { strength: {level: number, label: string, suggestions: string[]} }) => {
    const strengthLevels = [
        { label: "Очень слабый", color: "bg-red-700" }, // level 0, shouldn't happen
        { label: "Слабый", color: "bg-red-500" }, // level 1
        { label: "Нормальный", color: "bg-orange-500" }, // level 2
        { label: "Хороший", color: "bg-yellow-500" }, // level 3
        { label: "Сложный", color: "bg-green-500" } // level 4
    ];

    const currentStrength = strengthLevels[strength.level] || strengthLevels[0];

    return (
        <div className="space-y-2">
            <Progress value={strength.level * 25} className={`h-2 ${currentStrength.color}`} />
            <p className="text-xs text-muted-foreground">
                <span className="font-semibold">{currentStrength.label}.</span>
                {strength.suggestions.length > 0 && <span className="ml-1">{strength.suggestions.join(' ')}</span>}
            </p>
        </div>
    );
};


export default function RegisterForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, label: '', suggestions: [] });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock register logic
    router.push('/dashboard');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value;
      setPassword(newPassword);
      if (newPassword) {
          const result = checkPasswordStrength(newPassword);
          setPasswordStrength(result);
      } else {
          setPasswordStrength({ level: 0, label: '', suggestions: [] });
      }
  };

  return (
    <Card className="border-0 shadow-none">
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Эл. почта</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
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
            {password && <PasswordStrengthIndicator strength={passwordStrength} />}
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirm-password">Подтвердите пароль</Label>
             <div className="relative">
                <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} required minLength={8}/>
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
          <Button className="w-full" type="submit">
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
