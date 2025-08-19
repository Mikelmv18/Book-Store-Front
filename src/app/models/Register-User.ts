export interface RegisterUserDto {
    fullName: string;
    email: string;
    password: string;
    confirmPassword:string
    role?: 'USER' | 'ADMIN';
}
  