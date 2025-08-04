'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import { Loader2, X, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { validatePassword } from '@/lib/utils';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: false });

  const [modalOpen, setModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState('');

  // Modal content data
  const modalContent = {
    'privacy-policy': {
      title: 'Privacy Policy',
      content: `
        <h2 class="text-xl font-bold mb-4">Privacy Policy</h2>
        
        <h3 class="text-lg font-semibold mb-2">Who we are</h3>
        <p class="mb-4">Our website address is: <a href="https://alanguagestory.com" class="text-orange-600 hover:underline">https://alanguagestory.com</a></p>
        <div class="mb-4">
          <p class="font-semibold">Post:</p>
          <p class="mb-2">30 Tithe Barn Road, Stafford, England, ST16 3PH, GB</p>
          <p class="font-semibold">Email:</p>
          <p>info@alanguagestory.com</p>
        </div>
        
        <h3 class="text-lg font-semibold mb-2">Comments</h3>
        <p class="mb-4">When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor's IP address and browser user agent string to help spam detection. An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. After approval of your comment, your profile picture is visible to the public in the context of your comment.</p>
        
        <h3 class="text-lg font-semibold mb-2">Media</h3>
        <p class="mb-4">If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.</p>
        
        <h3 class="text-lg font-semibold mb-2">Cookies</h3>
        <p class="mb-4">If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.</p>
        <p class="mb-4">If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.</p>
        <p class="mb-4">When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.</p>
        
        <h3 class="text-lg font-semibold mb-2">Embedded content from other websites</h3>
        <p class="mb-4">Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website. These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content.</p>
        
        <h3 class="text-lg font-semibold mb-2">How long we retain your data</h3>
        <p class="mb-4">If you leave a comment, the comment and its metadata are retained indefinitely. For users that register on our website, we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username).</p>
        
        <h3 class="text-lg font-semibold mb-2">What rights you have over your data</h3>
        <p class="mb-4">If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.</p>
        
        <h3 class="text-lg font-semibold mb-2">Where your data is sent</h3>
        <p>Visitor comments may be checked through an automated spam detection service.</p>
      `
    },
    'terms-and-conditions': {
      title: 'Terms and Conditions',
      content: `
        <h2 class="text-xl font-bold mb-4">Terms and Conditions</h2>
        
        <h3 class="text-lg font-semibold mb-2">Using the materials on Lingoletics.com</h3>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li>Material from Lingoletics.com may not be copied, reproduced, republished, downloaded, posted, broadcast, or transmitted in any way, except for your own use as a teacher and that of your pupils within your own educational establishment.</li>
          <li>Any other use requires the prior written permission of Lingoletics.com</li>
          <li>The illustrations on the site are the legal property of Lingoletics.com and cannot be copied or reproduced in any way.</li>
          <li>You agree not to adapt or alter any of the material contained in this site or use it for any purpose other than your personal, non-commercial use.</li>
          <li>Copies of this site should not be used for any promotional, administrative, or commercial purposes of the educational establishment.</li>
          <li>If you register as an individual tutor, you will only be permitted to access and use the site with your own private pupils. Failure to comply will lead to your login details to become invalid.</li>
        </ul>
        
        <h3 class="text-lg font-semibold mb-2">Legal</h3>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li>You agree to use this site only for lawful purposes, and in a manner that does not infringe the rights of any third party.</li>
          <li>If any of these Terms and Conditions should be determined to be illegal, invalid or otherwise unenforceable by reason of the laws of any state or country in which these Terms and Conditions are intended to be effective, then to the extent and within the jurisdiction which that Term or Condition is illegal, invalid or unenforceable, it shall be severed and deleted from this clause and the remaining terms and conditions shall survive, remain in full force and effect and continue to be binding and enforceable.</li>
          <li>These Terms and Conditions shall be governed by and construed in accordance with the laws of England and Wales. Disputes arising here from shall be exclusively subject to the jurisdiction of the courts of England and Wales.</li>
          <li>If these Terms and Conditions are not accepted in full, you do not have permission to access the contents of this website and therefore should cease using this website immediately.</li>
          <li>Use of this site constitutes your acceptance of these terms and conditions, from your first visit to this site.</li>
        </ul>
        
        <h3 class="text-lg font-semibold mb-2">Cancellation</h3>
        <div class="mb-4">
          <p class="mb-2"><strong>7 day cooling off period:</strong> In accordance with the above law, you have a 7 day 'cooling off period' in which you have the right to cancel your purchase and receive a refund. You do not need to give a reason for cancelling your purchase. Should you choose to cancel, we will refund your payment within 30 days of your cancellation.</p>
          <p class="mb-2">Should you wish to cancel your purchase within the 7 days' cooling off' period, please email us at <a href="mailto:info@alanguagestory.com" class="text-orange-600 hover:underline">info@alanguagestory.com</a> or write to us at the following address:</p>
          <div class="ml-4 mb-2">
            <p>Lingoletics.com</p>
            <p>30 Tithe Barn Road, Stafford, ST163PH</p>
          </div>
          <p class="mb-2">Should you cancel your purchase within this 7 day 'cooling off' period, we will refund your payment. If you paid by credit or with debit card from this website, your refund will be made directly to your credit or debit card within 30 days of your cancellation.</p>
          <p class="mb-2"><strong>Conditions of the refund:</strong> In the case of the request for a refund, Lingoletics.com reserves the right to track usage by an individual (through his/her own unique code) of specific pages visited, frequency of use, and time of use. No refund will be granted if Lingoletics.com has cause to believe that an individual has undertaken significant usage of the resource OR has printed off selected material.</p>
        </div>
        
        <h3 class="text-lg font-semibold mb-2">Payments</h3>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li>Buying a school licence will entitle you to use Lingoletics.com with a limit on the number of teachers or pupils accessing it, depending on the subscription. Usage must remain only within your educational establishment. Failure to comply will lead to the educational establishment login to become invalid.</li>
          <li>The fee is valid for a year. You will be sent a reminder a month before your registration expires.</li>
          <li>You will be sent a confirmation of your received payment.</li>
          <li>Due to the nature of our product(s) and service(s), our refund policy is such that each individual refund request will be considered on a case-by-case basis.</li>
          <li>Refunds will only be given at the discretion of the Company Management.</li>
        </ul>
      `
    }
  };

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveModal('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (mode === 'signup' && newPassword.length > 0) {
      const validation = validatePassword(newPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation({ isValid: false });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image 
            src="/favicon.png" 
            alt="Lingoletics.com" 
            width={48} 
            height={48} 
            className="h-12 w-12"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {mode === 'signin'
            ? 'Sign in to your account'
            : 'Create your account'}
        </h2>
        {mode === 'signup' && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up is completely free • Start your 14-day free trial today
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ''} />
          <input type="hidden" name="priceId" value={priceId || ''} />
          <input type="hidden" name="inviteId" value={inviteId || ''} />
          {mode === 'signup' && <input type="hidden" name="role" value="teacher" />}
          {mode === 'signup' && (
            <div>
              <Label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </Label>
              <div className="mt-1">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  defaultValue={state.name}
                  required
                  maxLength={100}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}
          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email}
                required
                maxLength={50}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <div className="mt-1 relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={handlePasswordChange}
                required
                minLength={8}
                maxLength={100}
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 pr-12 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm ${
                  mode === 'signup' && password.length > 0
                    ? passwordValidation.isValid
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your password"
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
            
            {mode === 'signup' && password.length > 0 && (
              <div className="mt-2">
                {passwordValidation.isValid ? (
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    Password meets security requirements
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    {passwordValidation.error}
                  </div>
                )}
              </div>
            )}
            
            {mode === 'signup' && (
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
            )}
          </div>

          {mode === 'signup' && (
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
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); openModal('terms-and-conditions'); }}
                    className="text-orange-600 hover:text-orange-700 underline"
                  >
                    Terms & Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); openModal('privacy-policy'); }}
                    className="text-orange-600 hover:text-orange-700 underline"
                  >
                    Privacy Policy
                  </button>
                </Label>
                <p className="text-xs text-gray-500">
                  By checking this box, you confirm that you have read and understood our terms and agree to the processing of your data in accordance with our privacy policy.
                </p>
              </div>
            </div>
          )}

          {state?.error && (
            <div className="text-red-500 text-sm">{state.error}</div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pending || (mode === 'signup' && (!gdprAccepted || !passwordValidation.isValid))}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : mode === 'signin' ? (
                'Sign in'
              ) : (
                'Sign up'
              )}
            </Button>
          </div>

          {mode === 'signin' && (
            <div className="text-center mt-4">
              <Link 
                href="/forgot-password" 
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                {mode === 'signin'
                  ? 'New to our platform?'
                  : 'Already have an account?'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                redirect ? `?redirect=${redirect}` : ''
              }${priceId ? `&priceId=${priceId}` : ''}`}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {mode === 'signin'
                ? 'Create an account'
                : 'Sign in to existing account'}
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalContent[activeModal as keyof typeof modalContent]?.title}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div 
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: modalContent[activeModal as keyof typeof modalContent]?.content || '' 
                }}
              />
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200">
              <Button onClick={closeModal} variant="outline" className="rounded-lg">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
