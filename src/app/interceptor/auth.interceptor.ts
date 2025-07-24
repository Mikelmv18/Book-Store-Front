console.log("AuthInterceptor file loaded");

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

  const token = isBrowser ? localStorage.getItem('token') : null;

  console.log('AuthInterceptor token:', token);

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request);
};
