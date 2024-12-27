// 'use client'

// import React, { useState } from 'react';
// import { useSignUp } from '@clerk/nextjs';
// import { Button } from '@/components/ui/button';
// import OTPForm from './otp-form';
// import { useRouter } from 'next/navigation';

// const VerifyOtpForm = () => {
//   const { signUp, isLoaded } = useSignUp();
//   const [otp, setOtp] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleVerifyOtp = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsLoading(true);
//     setErrorMessage('');

//     if (!isLoaded) {
//       setErrorMessage('Service not ready.');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       await signUp.attemptEmailAddressVerification({ code: otp });
//       router.push('/dashboard/userdetails');
//     } catch (error) {
//       console.error('OTP verification error:', error);
//       setErrorMessage('Invalid OTP, try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleVerifyOtp} className="space-y-3">
//       <OTPForm onOTP={otp} setOTP={setOtp} />

//       {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

//       <Button type="submit" disabled={isLoading} className="w-full">
//         {isLoading ? 'Verifying...' : 'Verify OTP'}
//       </Button>
//     </form>
//   );
// };

// export default VerifyOtpForm;