import { Injectable } from '@angular/core';
import { User } from '../../models/User';
import { retry } from 'rxjs';


const TOKEN = 'token';
const USER = 'user';

@Injectable({
  providedIn: 'root'
})
export class UserStorage {
  

 public saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN);
    window.localStorage.setItem(TOKEN,token);
}

 
  public saveUser(user: User) :void {
      window.localStorage.removeItem(USER);
      window.localStorage.setItem(USER,JSON.stringify(user));
  }


  static getUserId(): string {
    
    const user = this.getUser();
    
    if(user === null) {
      return '';
    }
    return user?.id ? user.id.toString() : '';
  
  }

 
  static signOut(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN);
      window.localStorage.removeItem(USER);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN);
    }
    return null;
  }
  
  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER);
      return user ? JSON.parse(user) as User : null;
    }
    return null;
  }
  
  static getUserRole(): string {
    const user = this.getUser();
    return user ? user.role : '';
  }
  
  static isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      return (Math.floor(Date.now() / 1000)) >= expiry;
    } catch {
      return true;
    }
  }


  static isLoggedIn(): boolean {
    
    const token = this.getToken();
    return token && !this.isTokenExpired(token);
  
  }

  static isUserLoggedIn(): boolean {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      return false;
    }
  
    const role = this.getUserRole();
    return role === 'USER';
  }
  
  static isAdminLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
  
    return this.getUserRole() === 'ADMIN';
  }
  
}



