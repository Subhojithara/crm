import { FC } from 'react';

interface Company {
  id: number;
  name: string;
  email: string;
}

interface HeaderProps {
  selectedCompany: Company | null;
}

const Header: FC<HeaderProps> = ({ selectedCompany }) => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Your Application</h1>
      </div>
      {selectedCompany && (
        <div className="flex items-center space-x-4">
          <div className="text-gray-600">Selected Company:</div>
          <div className="font-medium">
            {selectedCompany.name} ({selectedCompany.email})
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 