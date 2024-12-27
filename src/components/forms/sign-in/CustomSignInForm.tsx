// import React, { useState } from 'react';
// import { useSignIn } from '@clerk/nextjs';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Icons } from '@/components/ui/icons';
// import { useRouter } from 'next/navigation';

// interface SignInError {
//   message: string;
//   errors?: { message: string }[];
// }

// const CustomSignInForm = () => {
//   const { signIn, isLoaded } = useSignIn();
//   const router = useRouter(); // Initialize the router
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsLoading(true);
//     setErrorMessage('');

//     if (!isLoaded || !signIn) {
//       setErrorMessage('Authentication service is not loaded yet.');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       await signIn.create({
//         identifier: email,
//         password,
//       });

//       router.push('/dashboard'); // Redirect to a dashboard or home page after successful sign-in

//     } catch (error) {
//       console.error('Sign-in error:', error);
//       const signInError = error as SignInError;
//       if (signInError.errors && Array.isArray(signInError.errors)) {
//         const messages = signInError.errors.map((err) => err.message).join(' ');
//         setErrorMessage(messages);
//       } else if (signInError.message) {
//         setErrorMessage(signInError.message);
//       } else {
//         setErrorMessage('Something went wrong, please try again later.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     if (!isLoaded || !signIn) {
//       setErrorMessage('Authentication service is not loaded yet.');
//       return;
//     }

//     try {
//       await signIn.authenticateWithRedirect({
//         strategy: 'oauth_google',
//         redirectUrl: '/dashboard',
//         redirectUrlComplete: '/dashboard' // Ensure this is set correctly
//       });
//     } catch (error) {
//       console.error('Google sign-in error:', error);
//       setErrorMessage('Failed to sign in with Google. Please try again.');
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
//               type={showPassword ? 'text' : 'password'} // Toggle password visibility
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
//               onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
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
      
//       {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      
//       <Button type="submit" disabled={isLoading} className="w-full">
//         {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
//         Sign In
//       </Button>

//       <Button
//         type="button"
//         onClick={handleGoogleSignIn}
//         disabled={isLoading}
//         className="w-full mt-2"
//       >
//         Sign In with Google
//       </Button>
//     </form>
//   );
// };

// export default CustomSignInForm;