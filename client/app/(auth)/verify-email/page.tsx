'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { AuthCard } from '../../components/auth-card';
import { useAuth } from '@/lib/auth-context';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function handleVerify() {
      if (!token) {
        setError('Missing verification token in URL.');
        setIsLoading(false);
        return;
      }

      try {
        await verifyEmail(token);
        setIsSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Email verification failed. The link may be expired or invalid.');
      } finally {
        setIsLoading(false);
      }
    }

    handleVerify();
  }, [token, verifyEmail]);

  if (isLoading) {
    return (
      <AuthCard title="Verifying your email" subtitle="Please wait while we verify your email address...">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Communicating with verification service...</p>
        </div>
      </AuthCard>
    );
  }

  if (isSuccess) {
    return (
      <AuthCard
        title="Email Verified!"
        subtitle="Your email address has been successfully verified."
      >
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <p className="text-sm text-muted-foreground">
            Thank you for verifying your email address. You now have full access to your account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-all shadow-sm"
          >
            <span>Go to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verification Failed"
      subtitle="We could not verify your email address."
    >
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-2">
          <AlertCircle className="w-10 h-10" />
        </div>
        <p className="text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {error}
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-all shadow-sm"
          >
            <span>Return to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
