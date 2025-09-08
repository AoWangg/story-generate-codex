'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const supabase = getSupabase();
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendMagicLink = async () => {
    if (!supabase) return;
    setPending(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMessage('Magic link sent! Check your email.');
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to send magic link');
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in with Email</DialogTitle>
          <DialogDescription>
            Enter your email to receive a sign-in link.
          </DialogDescription>
        </DialogHeader>
        {!supabase ? (
          <div className="text-sm text-muted-foreground">
            Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
            <Button onClick={sendMagicLink} disabled={pending || !email}>
              {pending ? 'Sending…' : 'Send Magic Link'}
            </Button>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
