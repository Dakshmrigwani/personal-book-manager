'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle2, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { AuthCard } from '../../components/auth-card';
import { useAuth } from '@/lib/auth-context';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const checks = [
    { label: 'At least 8 characters long', valid: password.length >= 8 },
    { label: 'Contains letter (A-Z)', valid: /[a-zA-Z]/.test(password) },
    { label: 'Contains a number (0-9)', valid: /[0-9]/.test(password) },
  ];

  const isFormValid = checks.every((c) => c.valid) && password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (!isFormValid) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
      } else {
        setError('Please satisfy all password requirements');
      }
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Token may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthCard
        title="Password Reset Complete!"
        subtitle="Your password has been successfully reset. You can now use your new password to log in."
      >
        <div className="text-center py-6 space-y-5">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <p className="text-sm text-muted-foreground">Account security updated successfully.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-all shadow-sm"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset Your Password" subtitle="Create a new secure password for your Bookleaf account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-9 pr-10 py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-md border border-border space-y-1.5">
          <p className="text-[11px] font-semibold text-foreground mb-1">Password Requirements:</p>
          {checks.map((check, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                  check.valid ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/30 text-transparent'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
              </div>
              <span className={check.valid ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {check.label}
              </span>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2 cursor-pointer"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>Update Password</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
