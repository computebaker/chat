'use server';

import { z } from 'zod';

import { createUser, getUser } from '@/lib/db/queries';

import { signIn } from './auth';

import Prelude from "@prelude.so/sdk";

// initialize Prelude client with environment variable
const preludeClient = new Prelude({ apiToken: process.env.PRELUDE_API_TOKEN! });

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    await createUser(validatedData.email, validatedData.password);
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
 };

// Email verification send action
export interface SendVerificationState {
  status: 'idle' | 'in_progress' | 'sent' | 'failed' | 'invalid_data';
}
export const sendVerification = async (
  _: SendVerificationState,
  formData: FormData
): Promise<SendVerificationState> => {
  try {
    const email = formData.get('email');
    if (typeof email !== 'string' || !email) {
      return { status: 'invalid_data' };
    }
    await preludeClient.verification.create({
      target: { type: 'email_address', value: email },
    });
    return { status: 'sent' };
  } catch (error) {
    return { status: 'failed' };
  }
};

// Email verification check and user creation
export interface CheckVerificationState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'invalid_data'
    | 'wrong_code'
    | 'user_exists';
}
export const checkVerification = async (
  _: CheckVerificationState,
  formData: FormData
): Promise<CheckVerificationState> => {
  try {
    const email = formData.get('email');
    const password = formData.get('password');
    const code = formData.get('code');
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof code !== 'string'
    ) {
      return { status: 'invalid_data' };
    }
    // verify code
    await preludeClient.verification.check({
      target: { type: 'email_address', value: email },
      code,
    });
    // create user and sign in
    const [existing] = await getUser(email);
    if (existing) {
      return { status: 'user_exists' };
    }
    await createUser(email, password);
    await signIn('credentials', { email, password, redirect: false });
    return { status: 'success' };
  } catch (error: any) {
    if (error.code === 'VERIFICATION_CODE_MISMATCH') {
      return { status: 'wrong_code' };
    }
    return { status: 'failed' };
  }
};
