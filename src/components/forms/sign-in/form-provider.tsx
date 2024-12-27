// 'use client'

// import * as React from 'react'
// import { cn } from '@/lib/utils'
// import SignInAuthentication from './SignInAuthentication';
// import { useUser } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// type SignInFormProps = {
//   children?: React.ReactNode;
// };

// export function SignInForm({ children }: SignInFormProps) {
//     const [isLoading, setIsLoading] = React.useState<boolean>(false)
//     const [showPassword, setShowPassword] = React.useState<boolean>(false)
//     const { isLoaded, isSignedIn } = useUser();
//     const router = useRouter();
  
//     useEffect(() => {
//       if (isLoaded && isSignedIn) {
//         router.replace('/dashboard');
//       }
//     }, [isLoaded, isSignedIn, router]);
  
//     async function onSubmit(event: React.SyntheticEvent) {
//       event.preventDefault()
//       setIsLoading(true)
  
//       // The actual submission is handled by CustomSignUpForm
//       // Consider removing this if redundant
//       setTimeout(() => {
//         setIsLoading(false)
//       }, 3000)
//     }
  
//     if (!isLoaded) {
//       return <div>Loading...</div>;
//     }
  
//     return (
//       <div className={cn('grid gap-6')}>
//         <form onSubmit={onSubmit} className="space-y-4">
//           {children}
//         </form>
//         <SignInAuthentication />
//         {children}
//       </div>
//     )
//   }