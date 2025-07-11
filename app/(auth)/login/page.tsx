'use client';

/* Trying to fix the bug */
import React, { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from '@/components/toast';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { login, type LoginActionState } from '../actions';
import { ChatAnimation } from '@/components/chat-animation';

function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get('callbackUrl') || '/';
  const callbackUrl = rawCallback === '/' ? '/' : decodeURIComponent(rawCallback);

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: 'idle' },
  );

  useEffect(() => {
    if (state.status === 'failed') {
      toast({ type: 'error', description: 'Invalid credentials!' });
    } else if (state.status === 'invalid_data') {
      toast({ type: 'error', description: 'Failed validating your submission!' });
    } else if (state.status === 'success') {
      router.push(callbackUrl);
    }
  }, [state.status, router, callbackUrl]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        {/* Tekir head logo */}
        <div className="flex justify-center pt-4">
          <Image
            src="/images/tekir-head.png"
            alt="Tekir Head"
            width={100}
            height={100}
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Login to see past conversations and create new ones.
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign up
            </Link>
            {' for free.'}
          </p>
        </AuthForm>
      </div>
      <div className="hidden lg:flex lg:w-full lg:max-w-md lg:ml-4">
        <ChatAnimation />
      </div>
    </div>
  );
}
