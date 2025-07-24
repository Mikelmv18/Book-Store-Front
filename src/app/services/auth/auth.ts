import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { LoginResponse } from '../../models/Login-Response';
import { RegisterUserDto } from '../../models/Register-User';
import { UserStorage } from '../localstorage/user-storage';
import { Router } from '@angular/router';


@Injectable({ providedIn: 'root' })
export class AuthService {
  
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient,
    private user_storage: UserStorage,
    private router: Router
  ) {}

  
  login(email: string, password: string): Observable<LoginResponse> {
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).
    
    pipe(
      tap(response => {
        
        this.user_storage.saveToken(response.token);
  
        const tokenPayload = response.token.split('.')[1];
        const decodedPayload = JSON.parse(atob(tokenPayload));
  
        const user = {
          email: decodedPayload.sub,
          role: decodedPayload.role,
          fullName: decodedPayload.fullName || 'Unknown', 
          password: ''
        };

        this.user_storage.saveUser(user);  
      }),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }
  

  signup(user: RegisterUserDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`,user).pipe(
      tap(() => console.log('Signup successful')),
      catchError(error => {
        console.error('Signup error:', error);
        throw error;
      })
    );
  }

  logout(): void {
    const token = UserStorage.getToken();
  
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).subscribe({
        next: () => {
          console.log('Backend logout successful');
          UserStorage.signOut();
          this.router.navigateByUrl('/login');
        },
        error: err => {
          console.error('Logout failed:', err);
          UserStorage.signOut();
          this.router.navigateByUrl('/login');
        }
      });
    } 
    
    else {
      UserStorage.signOut();
      this.router.navigateByUrl('/login');
    }
  }
  


  

}