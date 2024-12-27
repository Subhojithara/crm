import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Company {
  id: number;
  name: string;
  email: string;
}



interface CompanyContextProps {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
}

const CompanyContext = createContext<CompanyContextProps | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    // Optionally, load the selected company from localStorage to persist across sessions
    const storedCompany = localStorage.getItem('selectedCompany');
    if (storedCompany) {
      setSelectedCompany(JSON.parse(storedCompany));
    }
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
    } else {
      localStorage.removeItem('selectedCompany');
    }
  }, [selectedCompany]);

  return (
    <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};