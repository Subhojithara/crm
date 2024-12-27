// import { motion } from 'framer-motion';
// import CustomSignInForm from './CustomSignInForm';
// import Link from 'next/link';

// export default function SignInAuthentication() {
//     return (
//       <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
//         <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
//           <div className="absolute inset-0 bg-zinc-900" />
//           <div className="relative z-20 mt-auto">
//             <blockquote className="space-y-2">
//               <motion.p
//                 className="text-lg"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.7 }}
//               >
//                 &ldquo;This library has saved me countless hours of work and
//                 helped me deliver stunning designs to my clients faster than
//                 ever before.&rdquo;
//               </motion.p>
//               <motion.footer
//                 className="text-sm"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.9 }}
//               >
//                 Sofia Davis
//               </motion.footer>
//             </blockquote>
//           </div>
//         </div>
//         <div className="lg:p-8">
//           <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
//             <div className="flex flex-col space-y-2 text-center">
//               <h1 className="text-2xl font-semibold tracking-tight">
//                 Welcome to Acme Inc
//               </h1>
//               <p className="text-sm text-muted-foreground">
//                 Sign in to your account or create a new one
//               </p>
//             </div>
//             <CustomSignInForm />
//             <p className="px-8 text-center text-sm text-muted-foreground">
//               By clicking continue, you agree to our{' '}
//               <Link
//                 href="/terms"
//                 className="underline underline-offset-4 hover:text-primary"
//               >
//                 Terms of Service
//               </Link>{' '}
//               and{' '}
//               <Link
//                 href="/privacy"
//                 className="underline underline-offset-4 hover:text-primary"
//               >
//                 Privacy Policy
//               </Link>
//               .
//             </p>
//           </div>
//         </div>
//       </div>
//     )
//   }