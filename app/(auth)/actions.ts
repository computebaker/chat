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
  console.log('Attempting to send verification email...');
  try {
    const email = formData.get('email');
    if (typeof email !== 'string' || !email) {
      console.log('Invalid data: Email is missing or not a string.');
      return { status: 'invalid_data' };
    }
    console.log(`Sending verification to: ${email}`);
    await preludeClient.verification.create({
      target: { type: 'email_address', value: email },
    });
    console.log(`Verification email sent successfully to: ${email}`);
    return { status: 'sent' };
  } catch (error) {
    console.error('Failed to send verification email:', error);
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
  console.log('Attempting to check verification code...');
  try {
    const email = formData.get('email');
    const password = formData.get('password');
    const code = formData.get('code');
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof code !== 'string'
    ) {
      console.log('Invalid data: Email, password, or code is missing or not a string.');
      return { status: 'invalid_data' };
    }
    console.log(`Checking verification for email: ${email} with code: ${code}`);
    const verificationResult = await preludeClient.verification.check({
      target: { type: 'email_address', value: email },
      code,
    });

    if (verificationResult.status === 'failure') {
      console.log(`Verification check for email ${email} failed with status: ${verificationResult.status}. Code might be incorrect.`);
      return { status: 'wrong_code' };
    }

    console.log(`Verification successful for email: ${email}`);
    const [existing] = await getUser(email);
    if (existing) {
      console.log(`User already exists for email: ${email}`);
      return { status: 'user_exists' };
    }
    console.log(`Creating user for email: ${email}`);
    await createUser(email, password);
    console.log(`User created for email: ${email}. Signing in...`);
    await signIn('credentials', { email, password, redirect: false });
    console.log(`Successfully signed in user: ${email}`);
    return { status: 'success' };
  } catch (error: any) {
    console.error('Failed to check verification or create user:', error);
    if (error.code === 'VERIFICATION_CODE_MISMATCH') {
      console.log('Verification code mismatch.');
      return { status: 'wrong_code' };
    }
    return { status: 'failed' };
  }
};

