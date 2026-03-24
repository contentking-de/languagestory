'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff, Check, X as XIcon, AlertTriangle, PartyPopper } from 'lucide-react';
import { signUp } from '../actions';
import { ActionState } from '@/lib/auth/middleware';
import { validatePassword } from '@/lib/utils';

export function AcceptInvitation() {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('inviteId');

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUp,
    { error: '' }
  );

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: false });
  const [gdprAccepted, setGdprAccepted] = useState(false);

  const [invitationEmail, setInvitationEmail] = useState('');
  const [invitationRole, setInvitationRole] = useState('');
  const [invitedByName, setInvitedByName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [invitationLoading, setInvitationLoading] = useState(true);
  const [invitationError, setInvitationError] = useState('');

  useEffect(() => {
    if (!inviteId) {
      setInvitationLoading(false);
      setInvitationError('No invitation ID provided. Please use the link from your invitation email.');
      return;
    }

    fetch(`/api/invitations/${inviteId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setInvitationError(data.error);
        } else if (data.email) {
          setInvitationEmail(data.email);
          setInvitationRole(data.role || '');
          setInvitedByName(data.invitedByName || '');
          setTeamName(data.teamName || '');
        }
      })
      .catch(() => {
        setInvitationError('Failed to load invitation details. Please try again.');
      })
      .finally(() => {
        setInvitationLoading(false);
      });
  }, [inviteId]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length > 0) {
      setPasswordValidation(validatePassword(newPassword));
    } else {
      setPasswordValidation({ isValid: false });
    }
  };

  const getRoleDisplayName = (role: string) => {
    const names: Record<string, string> = {
      teacher: 'Teacher',
      student: 'Student',
      parent: 'Parent',
      member: 'Member',
      content_creator: 'Content Creator',
      institution_admin: 'Administrator',
    };
    return names[role] || role;
  };

  if (invitationLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col justify-center items-center py-12 px-4 bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="mt-4 text-gray-600">Loading your invitation...</p>
      </div>
    );
  }

  if (invitationError) {
    return (
      <div className="min-h-[100dvh] flex flex-col justify-center items-center py-12 px-4 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center">
            <Image src="/favicon.png" alt="Lingoletics.com" width={48} height={48} className="h-12 w-12" />
          </div>
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation Problem</h2>
            <p className="text-gray-600 mb-6">{invitationError}</p>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image src="/favicon.png" alt="Lingoletics.com" width={48} height={48} className="h-12 w-12" />
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <PartyPopper className="h-4 w-4" />
            You&apos;ve been invited!
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Accept Your Invitation
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {invitedByName && (
              <>
                <span className="font-semibold text-gray-800">{invitedByName}</span> has invited you to join as a{' '}
                <span className="font-semibold text-orange-600">{getRoleDisplayName(invitationRole)}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200">
          <form className="space-y-5" action={formAction}>
            <input type="hidden" name="inviteId" value={inviteId || ''} />
            <input type="hidden" name="role" value={invitationRole} />
            <input type="hidden" name="redirect" value="" />
            <input type="hidden" name="priceId" value="" />

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={invitationEmail}
                  readOnly
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This is the email address your invitation was sent to
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Your Name
              </Label>
              <div className="mt-1">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  autoFocus
                  required
                  maxLength={100}
                  defaultValue={state.name}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Choose a Password
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={100}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`appearance-none rounded-lg relative block w-full px-3 py-2 pr-12 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                    password.length > 0
                      ? passwordValidation.isValid
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                        : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Choose a secure password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              {password.length > 0 && passwordValidation.isValid && (
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  Password meets security requirements
                </div>
              )}

              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-2">Password requirements:</div>
                <div className="space-y-1">
                  <div className={`flex items-center text-xs ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                    {password.length >= 8 ? <Check className="h-3 w-3 mr-1" /> : <XIcon className="h-3 w-3 mr-1" />}
                    At least 8 characters
                  </div>
                  <div className={`flex items-center text-xs ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[A-Z]/.test(password) ? <Check className="h-3 w-3 mr-1" /> : <XIcon className="h-3 w-3 mr-1" />}
                    One uppercase letter
                  </div>
                  <div className={`flex items-center text-xs ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[0-9]/.test(password) ? <Check className="h-3 w-3 mr-1" /> : <XIcon className="h-3 w-3 mr-1" />}
                    One number
                  </div>
                  <div className={`flex items-center text-xs ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? <Check className="h-3 w-3 mr-1" /> : <XIcon className="h-3 w-3 mr-1" />}
                    One special character
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="gdpr"
                checked={gdprAccepted}
                onCheckedChange={(checked) => setGdprAccepted(checked as boolean)}
                required
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="gdpr"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{' '}
                  <Link href="/terms" className="text-orange-600 hover:text-orange-700 underline" target="_blank">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-orange-600 hover:text-orange-700 underline" target="_blank">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>

            {state?.error && (
              <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pending || !gdprAccepted || !passwordValidation.isValid}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Creating your account...
                </>
              ) : (
                'Accept Invitation & Create Account'
              )}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href={`/sign-in${inviteId ? `?inviteId=${inviteId}` : ''}`} className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
