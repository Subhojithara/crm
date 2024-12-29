// 'use client';

// import React, { useState, useEffect } from 'react';
// import { User } from '@/types/User';

// export default function UserList() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch('/api/users');
//         if (!response.ok) {
//           throw new Error(`Error: ${response.status} ${response.statusText}`);
//         }
//         const data = await response.json();
//         setUsers(data.users);
//       } catch (error) {
//         const err = error as Error;
//         setError(err.message);
//         console.error('Error fetching users:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   if (isLoading) {
//     return <div>Loading users...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div>
//       <h2>Users</h2>
//       <ul>
//         {users.map((user) => (
//           <li key={user.id}>
//             <h3>{user.name}</h3>
//             <p>Username: {user.username}</p>
//             <p>Role: {user.role}</p>
//             {/* Display other user properties as needed */}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// } 