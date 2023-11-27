import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserService } from 'src/app/shares/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private _userService: UserService, private toastr: ToastrService,private router:Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    return this._userService
      .isAuthenticated()
      .pipe(tap((authenticated:boolean) => this.handleAuth(authenticated, state)));
  }

  private handleAuth(isAuthenticated: boolean, state: RouterStateSnapshot) {
    if (!isAuthenticated) {
      // redirect to login
      this.router.navigate(["login"], {
        queryParams: { returnUrl: state.url },
      });
    }
  }

}
