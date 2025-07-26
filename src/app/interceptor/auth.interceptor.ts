import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

console.log("AuthInterceptor file loaded");

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

  return next(request).pipe(
    tap({
      error: (error) => {
        if (error.status === 401) {
          // Token expired or unauthorized
          console.log("Unauthorized detected - redirecting to login");

          if (isBrowser) {
            localStorage.removeItem('token'); // clear token or call your logout logic
            // redirect to login page - simple way:
            window.location.href = '/login';
            // OR use Angular Router if you can inject it (more complex in functional interceptor)
          }
        }
      }
    })
  );
};
