'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${siteUrl}/auth/callback` },
      });
      if (authError) throw authError;
      // Pass email through to verify-email screen via query param
      router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0A0E1A' }}>
      <div
        className="flex flex-col flex-1 px-7 pb-10 overflow-y-auto gap-5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 60px)' }}
      >
        {/* Back */}
        <Link
          href="/welcome"
          className="text-sm"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          ← Back
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-2 mb-2">
          <h1
            className="text-white"
            style={{
              fontSize: 32,
              fontFamily: 'var(--font-dm-serif), DM Serif Display, Georgia, serif',
              lineHeight: 1.2,
            }}
          >
            Create your account
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            Start building your Shimmer.
            <br />
            London&apos;s new way to date.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>sign up with email</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <TextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            type="email"
            autoComplete="email"
            name="email"
          />
          <TextInput
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            type="password"
            autoComplete="new-password"
            name="password"
          />
        </div>

        {error && (
          <p className="text-center text-sm" style={{ color: '#FF6B6B' }}>
            {error}
          </p>
        )}

        <Button
          label="Create account"
          onPress={handleSignUp}
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        />

        <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Already have an account?{' '}
          <Link href="/sign-in" className="font-semibold" style={{ color: '#E8A87C' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
