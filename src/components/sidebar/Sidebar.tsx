// import { useEffect, useState } from 'react';
// import { useToast } from '@/hooks/use-toast';

// interface Company {
//   id: number;
//   name: string;
//   email: string;
// }

// interface UserProfile {
//   role: string;
//   // ...other fields
// }

// interface SidebarProps {
//   selectedCompany: Company | null;
//   setSelectedCompany: (company: Company | null) => void;
// }

// export default function Sidebar({ selectedCompany, setSelectedCompany }: SidebarProps) {
//   const { toast } = useToast();
//   const [companies, setCompanies] = useState<Company[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [userRole, setUserRole] = useState<string>('');

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const response = await fetch('/api/users/profile', {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error || 'Failed to fetch user profile');
//         }

//         const data: { profile: UserProfile } = await response.json();
//         setUserRole(data.profile.role);
//       } catch (error: any) {
//         toast({ title: 'Error', description: error.message || 'Failed to fetch user profile' });
//         console.error('Fetch User Profile Error:', error);
//       }
//     };

//     fetchUserProfile();
//   }, [toast]);

//   useEffect(() => {
//     // Define allowed roles
//     const allowedRoles = ['ADMIN', 'MODERATOR', 'USER'];

//     // Early return if userRole is not in allowedRoles
//     if (!allowedRoles.includes(userRole)) {
//       setLoading(false);
//       return;
//     }

//     const fetchCompanies = async () => {
//       try {
//         const response = await fetch('/api/company', {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error || 'Failed to fetch companies');
//         }

//         const data = await response.json();
//         setCompanies(data.companies);

//         // If no company is selected yet, set the first company as selected
//         if (!selectedCompany && data.companies.length > 0) {
//           setSelectedCompany(data.companies[0]);
//         }
//       } catch (error: any) {
//         if (error instanceof Error) {
//           toast({ title: 'Error', description: error.message });
//         } else {
//           toast({ title: 'Error', description: 'An unknown error occurred' });
//         }
//         console.error('Fetch Companies Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCompanies();
//   }, [userRole, toast, setSelectedCompany, selectedCompany]);

//   const handleCompanySelect = (company: Company) => {
//     setSelectedCompany(company);
//     toast({ title: 'Company Selected', description: `You have selected ${company.name}` });
//     // Optionally, you can store the selected company in localStorage or cookies
//     // to persist the selection across sessions
//   };

//   if (loading) {
//     return <div className="sidebar p-4">Loading companies...</div>;
//   }

//   // Handle cases where the user has no access or no companies are available
//   if (!['ADMIN', 'MODERATOR', 'USER'].includes(userRole)) {
//     return <div className="sidebar p-4">You do not have access to view companies.</div>;
//   }

//   if (companies.length === 0) {
//     return <div className="sidebar p-4">No companies available.</div>;
//   }

//   return (
//     <div className="sidebar p-4 bg-gray-100 h-full">
//       <h2 className="text-xl font-semibold mb-4">Companies</h2>
//       <ul className="space-y-2">
//         {companies.map((company) => (
//           <li key={company.id}>
//             <button
//               onClick={() => handleCompanySelect(company)}
//               className={`w-full text-left px-3 py-2 rounded ${
//                 selectedCompany?.id === company.id
//                   ? 'bg-blue-500 text-white'
//                   : 'bg-white text-gray-800 hover:bg-gray-200'
//               } transition-colors duration-200`}
//             >
//               <div className="font-medium">{company.name}</div>
//               <div className="text-sm">{company.email}</div>
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// } 