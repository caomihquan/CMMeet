import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { UserService } from '../../shares/services/user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private _userService:UserService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if(request.url.includes('login')){
      return next.handle(request);
    }
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const authorization = `Bearer ${accessToken}`;

    return next.handle(request.clone({setHeaders:{Authorization:authorization}})).pipe(
      catchError(err =>{
        if(err instanceof HttpErrorResponse && err.status === 401 && refreshToken){
            return this._userService.CreateNewToken(refreshToken).pipe(switchMap((token:any) =>
            {
              if(token){
                localStorage.setItem('accessToken',token.accessToken)
                localStorage.setItem('refreshToken',token.refreshToken)
                this._userService.setCurrentUser(token);
              }
              const authorization1 = `Bearer ${token.accessToken}`;
              return next.handle(request.clone({setHeaders:{Authorization:authorization1}}))
            }))
        }
        return throwError(()=> err)
      })
    );
  }

 IgnoreUrl(request: HttpRequest<unknown>,next: HttpHandler):any{
    switch (true) {
      case request.url.includes('login'):
        return next.handle(request);
      default:
        break;
    }
  }
}
