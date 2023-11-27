import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, concat, filter, map, of, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseApi:string =`${environment.baseUrl}api/authentication`
  private currentUserSource = new BehaviorSubject<TokenModel | null>(null);
  currentUser$ = this.currentUserSource.asObservable();


  constructor(private _http:HttpClient,private presence:PresenceService) {
    // const user = localStorage.getItem('user');
    // if(user){
    //   this.currentUserSource.next(JSON.parse(user));
    // }
    // else{
    //   this.currentUserSource.next(null);
    // }
   }

  isAuthenticated(): Observable<boolean> {

    return this.getUser().pipe(map(u => !!u));
  }

  getUser(){
    return concat(
      this.currentUser$.pipe(
        take(1),
        filter(u => {
          console.log(u,333334);
          return !!u
        }),
      ),
      this.getCurrentUser().pipe(
        filter(u => {
          return !!u
        }),
        tap((u:any) => this.currentUserSource.next(u)),
      ),
      this.currentUserSource.asObservable()
    );
  }


  getCurrentUser(): Observable<TokenModel | null> {
    const user = localStorage.getItem('user');
    if (!user) {
      return of(null);
    }
    return of(JSON.parse(user));
    // let claims: any;

    // try {
    //   claims = jwt_decode(token);
    // } catch {
    //   return of(null);
    // }

    // // check expiry
    // if (!claims || Date.now().valueOf() > claims.exp * 1000) {
    //   return of(null);
    // }


    // const user: NewType = {
    //   username: claims[
    //     "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    //   ] as string,
    //   fullName: claims[
    //     "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    //   ] as string,
    //   role: claims[
    //     "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    //   ] as string,
    // };

    // return of(user);
  }

  login(md:LoginModel):Observable<TokenModel>{
    const urlApi=`${this.baseApi}/login`;
    return this._http.post<TokenModel>(urlApi,md).pipe(map(x =>{
      localStorage.setItem('accessToken',x.accessToken)
      localStorage.setItem('refreshToken',x.refreshToken)
      this.setCurrentUser(x);
      return x;
    }))
  }

  CreateNewToken(refreshToken:string){
    const urlApi=`${this.baseApi}/refresh-token`;
    return this._http.post<TokenModel>(urlApi,{RefeshToken:refreshToken});
  }

  setCurrentUser(user:TokenModel){
    if(user){
      //user.roles = [];
      //const roles = this.getDecodedToken(user.token).role;//copy token to jwt.io see .role
      //Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSource.next(user);
    }
  }

  logout(){
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    this.currentUserSource.next(null);
    //this.presence.stopHubConnection();
  }
}


export interface LoginModel{
  username:string
  password:string
}

export interface TokenModel{
  accessToken:string
  refreshToken:string
  fullName:string
  userName:string
}
