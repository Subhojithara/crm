// import React from 'react';
// import { InputOTP } from '@/components/ui/input-otp';
// import {
//     InputOTPGroup,
//     InputOTPSeparator,
//     InputOTPSlot,
//   } from "@/components/ui/input-otp"

// type Props = {
//   setOTP: React.Dispatch<React.SetStateAction<string>>;
//   onOTP: string;
// };

// const OTPForm = ({ onOTP, setOTP }: Props) => {
//   return (
//     <>
//       <h2 className="text-lg font-semibold">Enter OTP</h2>
//       <p className="text-sm text-gray-600">
//         Enter the one-time password sent to your email.
//       </p>
//       <div className="flex justify-center py-4">
//         <InputOTP value={onOTP} onChange={setOTP} maxLength={6}>
//           <InputOTPGroup>
//             <InputOTPSlot index={0} />
//             <InputOTPSlot index={1} />
//             <InputOTPSlot index={2} />
//           </InputOTPGroup>
//           <InputOTPSeparator />
//           <InputOTPGroup>
//             <InputOTPSlot index={3} />
//             <InputOTPSlot index={4} />
//             <InputOTPSlot index={5} />
//           </InputOTPGroup>
//         </InputOTP>
//       </div>
//     </>
//   );
// };

// export default OTPForm; 