'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import Image from 'next/image';

import { 
  sendVerification, type SendVerificationState,
  checkVerification, type CheckVerificationState,
} from '../actions';
import Form from 'next/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/toast';
import { ChatAnimation } from '@/components/chat-animation';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [sendState, sendAction] = useActionState<SendVerificationState, FormData>(
    sendVerification,
    { status: 'idle' },
  );
  const [verifyState, verifyAction] = useActionState<CheckVerificationState, FormData>(
    checkVerification,
    { status: 'idle' },
  );

  useEffect(() => {
    if (sendState.status === 'invalid_data') {
      toast({ type: 'error', description: 'Invalid email or password' });
    } else if (sendState.status === 'failed') {
      toast({ type: 'error', description: 'Failed to send verification code' });
    } else if (sendState.status === 'sent') {
      toast({ type: 'success', description: 'Verification code sent' });
    }
  }, [sendState]);
  useEffect(() => {
    if (verifyState.status === 'wrong_code') {
      toast({ type: 'error', description: 'Incorrect verification code' });
    } else if (verifyState.status === 'invalid_data') {
      toast({ type: 'error', description: 'Invalid data. Please try again' });
    } else if (verifyState.status === 'failed') {
      toast({ type: 'error', description: 'Verification failed. Please try again' });
    } else if (verifyState.status === 'user_exists') {
      toast({ type: 'error', description: 'Account already exists!' });
    } else if (verifyState.status === 'success') {
      toast({ type: 'success', description: 'Account created successfully!' });
      router.push('/');
    }
  }, [verifyState]);

  const handleSend = (formData: FormData) => {
    const e = formData.get('email') as string;
    const p = formData.get('password') as string;
    setEmail(e);
    setPassword(p);
    sendAction(formData);
  };
  const handleVerify = (formData: FormData) => {
    verifyAction(formData);
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
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account to start using Tekir AI Chat
          </p>
        </div>
        {sendState.status !== 'sent' ? (
          <AuthForm action={handleSend} defaultEmail={email}>
            <SubmitButton isSuccessful={(sendState.status as any) === 'sent'}>
              Send Code
            </SubmitButton>
            <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
              {'Already have an account? '}
              <Link
                href="/login"
                className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              >
                Sign in
              </Link>
              {' instead.'}
            </p>
          </AuthForm>
        ) : (
          <Form action={handleVerify} className="flex flex-col gap-4 px-4 sm:px-16">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="password" value={password} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="code" className="text-zinc-600 font-normal dark:text-zinc-400">
                Verification Code
              </Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="12345"
                required
                pattern="\d{5}"
                className="bg-muted text-md md:text-sm"
              />
            </div>
            <SubmitButton isSuccessful={(verifyState.status as any) === 'success'}>
              Verify Code
            </SubmitButton>
          </Form>
        )}
      </div>
      <div className="hidden lg:flex lg:w-full lg:max-w-md lg:ml-4">
        <ChatAnimation />
      </div>
    </div>
  );
}
