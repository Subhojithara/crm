// import { useState, useEffect } from 'react';
// import Sidebar from '@/components/sidebar/Sidebar';
// import Header from '@/components/header/Header';

// interface Company {
//   id: number;
//   name: string;
//   email: string;
// }

// interface LayoutProps {
//   children: React.ReactNode;
// }

// export default function Layout({ children }: LayoutProps) {
//   const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

//   useEffect(() => {
//     // Load the selected company from localStorage to persist across sessions
//     const storedCompany = localStorage.getItem('selectedCompany');
//     if (storedCompany) {
//       setSelectedCompany(JSON.parse(storedCompany));
//     }
//   }, []);

//   useEffect(() => {
//     if (selectedCompany) {
//       localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
//     } else {
//       localStorage.removeItem('selectedCompany');
//     }
//   }, [selectedCompany]);

//   return (
//     <div className="flex h-screen">
//       <div className="w-64 bg-gray-200">
//         <Sidebar
//           selectedCompany={selectedCompany}
//           setSelectedCompany={setSelectedCompany}
//         />
//       </div>
//       <div className="flex-1 flex flex-col">
//         <Header selectedCompany={selectedCompany} />
//         <main className="flex-1 p-6 overflow-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// } 