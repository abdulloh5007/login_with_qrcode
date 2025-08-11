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
import zxcvbn from 'zxcvbn';

const PasswordStrengthIndicator = ({ score, feedback }: { score: number; feedback: any }) => {
    const strengthLevels = [
        { label: "Слабый", color: "bg-red-500", width: "w-1/4" },
        { label: "Нормальный", color: "bg-orange-500", width: "w-2/4" },
        { label: "Хороший", color: "bg-yellow-500", width: "w-3/4" },
        { label: "Сложный", color: "bg-green-500", width: "w-full" }
    ];

    const currentStrength = strengthLevels[score] || strengthLevels[0];

    return (
        <div className="space-y-2">
            <Progress value={(score + 1) * 25} className={`h-2 ${currentStrength.color}`} />
            <p className="text-xs text-muted-foreground">
                <span className="font-semibold">{currentStrength.label}.</span>
                {feedback?.warning && <span className="ml-1">{feedback.warning}</span>}
                {feedback?.suggestions?.length > 0 && <span className="ml-1">{feedback.suggestions[0]}</span>}
            </p>
        </div>
    );
};


export default function RegisterForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: null });
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
          const result = zxcvbn(newPassword);
          setPasswordStrength({
              score: result.score,
              feedback: result.feedback as any,
          });
      } else {
          setPasswordStrength({ score: 0, feedback: null });
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
            {password && <PasswordStrengthIndicator score={passwordStrength.score} feedback={passwordStrength.feedback} />}
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
