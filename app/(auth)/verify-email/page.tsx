"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import Image from "next/image";

function VerifyEmailContent() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a 6-digit verification code");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/logo.png"
                alt="SauerBridge"
                width={48}
                height={48}
                className="rounded"
              />
            </div>
            <CardTitle className="text-center">Email Verified!</CardTitle>
            <CardDescription className="text-center">
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You can now sign in to your account.
            </p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="SauerBridge"
              width={64}
              height={64}
              className="rounded"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify Email</CardTitle>
          <CardDescription className="text-center">
            Enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!email && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            {email && (
              <div className="text-sm text-muted-foreground">
                Verification code sent to: <strong>{email}</strong>
              </div>
            )}
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code from your email
              </p>
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
