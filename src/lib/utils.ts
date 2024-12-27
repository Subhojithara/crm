import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const data: User[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const handleError = (error: unknown) => {
  let errorMessage = 'An unexpected error occurred';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  console.error('An error occurred:', errorMessage);
  // You can add more sophisticated error handling here, such as logging to an external service
  throw new Error(errorMessage);
};

