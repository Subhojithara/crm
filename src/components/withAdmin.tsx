// import React from 'react';
// import { useRouter } from 'next/router';
// import { getCurrentUser } from '@/lib/auth'; // Assume you have a method to get the current user
// import { NextRequest } from 'next/server'; // Import NextRequest

// const withAdmin = (WrappedComponent: React.ComponentType) => {
//   const ComponentWithAdmin = (props: any) => {
//     const router = useRouter();
//     const request = {} as NextRequest; // Create a mock request object
//     const currentUser = getCurrentUser(request); // Pass the request to getCurrentUser

//     React.useEffect(() => {
//       if (!currentUser) {
//         router.push('/login');
//       } else if (currentUser.role !== 'Admin') {
//         router.push('/unauthorized');
//       }
//     }, [currentUser, router]);

//     if (!currentUser || currentUser.role !== 'Admin') {
//       return null;
//     }

//     return <WrappedComponent {...props} />;
//   };

//   return ComponentWithAdmin;
// };

// export default withAdmin; 