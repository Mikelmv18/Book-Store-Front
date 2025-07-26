import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { UserStorage } from '../services/localstorage/user-storage';

export const adminGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router);

  if (UserStorage.isAdminLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']); // or login page
    return false;
  }
};
