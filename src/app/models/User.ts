export interface User {
    id?: number;              
    fullName: string;
    email: string;
    password: string;
    role: 'USER' | 'ADMIN'; 
    createdAt?: Date; 
    updatedAt?: Date; 
  }
  