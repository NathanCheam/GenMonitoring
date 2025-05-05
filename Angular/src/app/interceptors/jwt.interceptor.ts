import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {environment} from '../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  req = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  });
  const authService = inject(AuthService);
  const user = authService.user;
  const isLoggedIn = authService.isLoggedIn;
  const isApiUrl = req.url.startsWith(environment.apiURL);
  if (isLoggedIn() && isApiUrl) {
    req = req.clone({
      setHeaders: {Authorization: `Bearer ${user().token}`}
    });
  }
  return next(req);
};
