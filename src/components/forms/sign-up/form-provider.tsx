// 'use client'

// import * as React from 'react'
// import { cn } from '@/lib/utils'
// import SignUpAuthentication from './SignUpAuthentication';

// type SignUpFormProps = {
//   children?: React.ReactNode;
// };

// export function SignUpForm({ children }: SignUpFormProps) {
//     const [isLoading, setIsLoading] = React.useState<boolean>(false)
//     const [showPassword, setShowPassword] = React.useState<boolean>(false)
  
//     async function onSubmit(event: React.SyntheticEvent) {
//       event.preventDefault()
//       setIsLoading(true)
  
//       // The actual submission is handled by CustomSignUpForm
//       // Consider removing this if redundant
//       setTimeout(() => {
//         setIsLoading(false)
//       }, 3000)
//     }
  
//     return (
//       <div className={cn('grid gap-6')}>
//         <form onSubmit={onSubmit} className="space-y-4">
//           {children}
//         </form>
//         <SignUpAuthentication />
//         {children}
//       </div>
//     )
//   }