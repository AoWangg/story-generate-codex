"use client";

import { useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/url";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Mail, Lock, LogIn, UserPlus } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AuthMode = "magic" | "password";
type AuthType = "signin" | "signup";

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const supabase = getSupabase();
  const siteUrl = useMemo(() => getSiteUrl(), []);
  const [mode, setMode] = useState<AuthMode>("password");
  const [type, setType] = useState<AuthType>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onOAuth = async (provider: "github") => {
    if (!supabase) return;
    setPending(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${siteUrl}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      const msg: string = err?.message || "OAuth sign-in failed";
      if (/provider is not enabled|Unsupported provider/i.test(msg)) {
        setMessage(
          "GitHub provider is not enabled in Supabase. Please enable it in Authentication → Providers."
        );
      } else {
        setMessage(msg);
      }
    } finally {
      setPending(false);
    }
  };

  const onMagicLink = async () => {
    if (!supabase) return;
    setPending(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${siteUrl}/auth/callback` },
      });
      if (error) throw error;
      setMessage("Magic link sent! Check your email.");
    } catch (err: any) {
      setMessage(err?.message ?? "Failed to send magic link");
    } finally {
      setPending(false);
    }
  };

  const onPasswordAuth = async () => {
    if (!supabase) return;
    setPending(true);
    setMessage(null);
    try {
      if (type === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onOpenChange(false);
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${siteUrl}/auth/callback` },
        });
        if (error) throw error;
        if (data?.user && !data.user.confirmed_at) {
          setMessage("Sign up successful. Please check your email to verify.");
        } else {
          onOpenChange(false);
        }
      }
    } catch (err: any) {
      setMessage(err?.message ?? "Authentication failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "signin" ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {type === "signin" ? "Sign In" : "Sign Up"}
          </DialogTitle>
          <DialogDescription>
            Use email/password, magic link, or GitHub
          </DialogDescription>
        </DialogHeader>

        {!supabase ? (
          <div className="text-sm text-muted-foreground">
            Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </div>
        ) : (
          <div className="space-y-4">
            {/* OAuth Provider */}
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                onClick={() => onOAuth("github")}
                disabled={pending}
                className="w-full"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Separator className="flex-1" />
              <span>or</span>
              <Separator className="flex-1" />
            </div>

            {/* Mode Switch */}
            <div className="inline-flex rounded-md bg-muted p-1 text-xs">
              <button
                className={`px-3 py-1 rounded ${
                  mode === "password" ? "bg-background shadow" : ""
                }`}
                onClick={() => setMode("password")}
                type="button"
              >
                Email & Password
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  mode === "magic" ? "bg-background shadow" : ""
                }`}
                onClick={() => setMode("magic")}
                type="button"
              >
                Magic Link
              </button>
            </div>

            {/* Forms */}
            {mode === "password" ? (
              <div className="space-y-2">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={pending}
                      className="pl-9"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={pending}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <button
                    className="text-muted-foreground hover:underline"
                    type="button"
                    onClick={() =>
                      setType(type === "signin" ? "signup" : "signin")
                    }
                  >
                    {type === "signin"
                      ? "Create an account"
                      : "Have an account? Sign in"}
                  </button>
                </div>
                <Button
                  onClick={onPasswordAuth}
                  disabled={pending || !email || !password}
                  className="w-full"
                >
                  {type === "signin" ? "Sign In" : "Sign Up"}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={pending}
                    className="pl-9"
                  />
                </div>
                <Button
                  onClick={onMagicLink}
                  disabled={pending || !email}
                  className="w-full"
                >
                  Send Magic Link
                </Button>
                <div className="text-xs text-muted-foreground">
                  We will email you a secure sign-in link.
                </div>
              </div>
            )}

            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
