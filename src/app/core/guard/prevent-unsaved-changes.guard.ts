import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { RoomComponent } from 'src/app/modules/room/room.component';

@Injectable({
  providedIn: 'root'
})
export class PreventUnsavedChangesGuard implements CanDeactivate<unknown> {
  constructor(){}
  canDeactivate(component: RoomComponent): Observable<boolean> | boolean {
    //confirm close page
    const isQuit = confirm('Bạn có muốn thoát không');
    return isQuit;
  }

}
