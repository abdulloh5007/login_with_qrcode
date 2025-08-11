'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function LoginForm() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    router.push('/dashboard');
  };

  return (
    <Card className="border-0 shadow-none">
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" type="submit">
            Sign In
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Don't have an account? <a href="#" className="underline text-primary">Sign up</a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
