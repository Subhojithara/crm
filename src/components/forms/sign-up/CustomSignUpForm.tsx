// import React, { useState } from 'react';
// import { useSignUp } from '@clerk/nextjs';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Icons } from '@/components/ui/icons';
// import { useRouter } from 'next/navigation';

// const CustomSignUpForm = () => {
//   const { signUp, isLoaded } = useSignUp();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsLoading(true);
//     setErrorMessage('');

//     if (!isLoaded || !signUp) {
//       setErrorMessage('Authentication service is not loaded yet.');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const createdSignUp = await signUp.create({
//         emailAddress: email,
//         password,
//       });

//       await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

//       router.push('/auth/verify-otp');

//     } catch (error: any) {
//       console.error('Sign-up error:', error);
//       if (error.errors && Array.isArray(error.errors)) {
//         const messages = error.errors.map((err: any) => err.message).join(' ');
//         setErrorMessage(messages);
//       } else if (error.message) {
//         setErrorMessage(error.message);
//       } else {
//         setErrorMessage('Something went wrong, please try again later.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleSignUp = async () => {
//     if (!signUp) {
//       setErrorMessage('Authentication service is not loaded yet.');
//       return;
//     }

//     try {
//       await signUp.authenticateWithRedirect({
//         strategy: 'oauth_google',
//         redirectUrl: '/dashboard', // Directly redirect to dashboard after Google sign-up
//         redirectUrlComplete: '/dashboard/userdetails',
//       });
//     } catch (error: any) {
//       console.error('Google sign-up error:', error);
//       setErrorMessage('Failed to sign up with Google. Please try again.');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="grid gap-2">
//         <div className="grid gap-1">
//           <Label htmlFor="email"></Label>
//           <Input
//             id="email"
//             placeholder="name@example.com"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             disabled={isLoading}
//             aria-label="Email"
//             required
//           />
//         </div>
//         <div className="grid gap-1">
//           <Label htmlFor="password"></Label>
//           <div className="relative">
//             <Input
//               id="password"
//               placeholder="Password"
//               type={showPassword ? 'text' : 'password'}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               disabled={isLoading}
//               aria-label="Password"
//               required
//             />
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//               onClick={() => setShowPassword(!showPassword)}
//               aria-label={showPassword ? 'Hide password' : 'Show password'}
//             >
//               {showPassword ? (
//                 <Icons.eyeOff className="h-4 w-4" />
//               ) : (
//                 <Icons.eye className="h-4 w-4" />
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>
//       <div id="clerk-captcha" className="my-4"></div>
      
//       {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      
//       <Button type="submit" disabled={isLoading} className="w-full">
//         {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
//         Sign Up
//       </Button>

//       <Button
//         type="button"
//         onClick={handleGoogleSignUp}
//         disabled={isLoading}
//         className="w-full mt-2"
//       >
//         Sign Up with Google
//       </Button>
//     </form>
//   );
// };

// export default CustomSignUpForm; 