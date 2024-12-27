export interface User {
    id: number;
    clerkUserId?: string;
    userId?: string;
    name: string;
    username: string;
    number: string;
    bio: string;
    dateOfBirth: Date | undefined;    
    profileImageUrl?: string; 
}