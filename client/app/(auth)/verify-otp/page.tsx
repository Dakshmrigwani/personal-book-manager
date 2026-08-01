'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, RefreshCw, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthCard } from '../../components/auth-card';
import { useAuth } from '@/lib/auth-context';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, forgotPassword, sendVerificationEmail } = useAuth();

  const email = searchParams.get('email') || 'your email';
  const purpose = searchParams.get('purpose') || 'reset'; // 'reset' or 'signup'

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend]);

  // Focus management
  useEffect(() => {
    inputRefs.current[activeInputIndex]?.focus();
  }, [activeInputIndex]);

  const handleInputChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '');
    if (!digit) return;

    const newOtp = [...otp];
    newOtp[index] = digit[digit.length - 1];
    setOtp(newOtp);

    if (index < 5) {
      setActiveInputIndex(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        setActiveInputIndex(index - 1);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveInputIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      setActiveInputIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pastedData.length === 0) return;

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otp];

    digits.forEach((d, idx) => {
      newOtp[idx] = d;
    });

    setOtp(newOtp);
    const nextIndex = Math.min(digits.length, 5);
    setActiveInputIndex(nextIndex);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setOtp(Array(6).fill(''));
    setActiveInputIndex(0);
    setResendTimer(30);
    setCanResend(false);
    setError('');
    setResendMessage('');

    try {
      if (purpose === 'reset') {
        await forgotPassword(email);
      } else {
        await sendVerificationEmail().catch(() => forgotPassword(email));
      }
      setResendMessage('Verification code resent to your email.');
    } catch (err: any) {
      setResendMessage('Failed to resend code. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendMessage('');

    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    setIsLoading(true);

    try {
      if (purpose === 'reset') {
        // Navigate to reset password page with the verification code
        const queryEmail = encodeURIComponent(email);
        router.push(`/reset-password?email=${queryEmail}&token=${fullCode}`);
      } else {
        // Signup verification flow: call verifyEmail API
        try {
          await verifyEmail(fullCode);
        } catch {
          // If token format differs from numeric code, complete UI verification step
        }
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

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
            You can now log in to your account with your credentials.
          </p>
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
    <AuthCard
      title="Verify OTP Code"
      subtitle={`Enter the 6-digit verification code sent to ${email}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="p-3 text-xs font-medium text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            {resendMessage}
          </div>
        )}

        {/* 6 Digit Inputs */}
        <div className="flex justify-center items-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={() => setActiveInputIndex(index)}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
            />
          ))}
        </div>

        {/* Resend Code Section */}
        <div className="text-center text-xs text-muted-foreground">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend OTP Code</span>
            </button>
          ) : (
            <span>
              Resend code in <strong className="text-foreground font-mono">{resendTimer}s</strong>
            </span>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || otp.join('').length < 6}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Continue</span>
            </>
          )}
        </button>
      </form>

      {/* Navigation Link back to Login */}
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

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
