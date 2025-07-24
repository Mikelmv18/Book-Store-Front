
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth';
import { UserStorage } from '../services/localstorage/user-storage';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
  Observable<boolean> {
    
    const token = UserStorage.getToken();
    
    if (token && !UserStorage.isTokenExpired(token)) {
      return new Observable((observer) => {
        observer.next(true);
        observer.complete();
      });
    } 
    
    else {
      this.router.navigate(['/login']);
      return new Observable((observer) => {
        observer.next(false);
        observer.complete();
      });
    }
    
  }
}
