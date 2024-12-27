export interface User {
  id: number; // If you need an ID, otherwise remove it
  clerkUserId: string;
  userId?: string; // From User-forms.ts, if needed
  name: string; // Or firstName, lastName if you prefer
  username: string; // From User-forms.ts, if needed
  number: string; // From User-forms.ts, if needed
  bio: string; // From User-forms.ts, if needed
  dateOfBirth: Date | undefined; // From User-forms.ts, if needed
  profileImageUrl?: string; // From User-forms.ts, if needed
  email: string;
  imageUrl: string;
  role: string;
}
